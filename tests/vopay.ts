import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
} from "@solana/spl-token";

import { Vopay } from "../target/types/vopay";

describe("vopay", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Vopay as Program<Vopay>;
  const sender = provider.wallet.publicKey;

  async function confirm(signature: string) {
    const latest = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction(
      {
        signature,
        ...latest,
      },
      "confirmed",
    );
  }

  async function airdrop(publicKey: PublicKey, lamports: number) {
    const signature = await provider.connection.requestAirdrop(publicKey, lamports);
    await confirm(signature);
  }

  function contactRegistryPda(user: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("contacts"), user.toBuffer()],
      program.programId,
    );
  }

  async function currentClockTimestamp(): Promise<anchor.BN> {
    const account = await provider.connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
    if (!account) {
      throw new Error("Clock sysvar account not found");
    }

    // Clock sysvar layout stores unix_timestamp as i64 at byte offset 32.
    return new anchor.BN(account.data.subarray(32, 40), "le");
  }

  function transactionLogPda(user: PublicKey, timestamp: anchor.BN) {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("txlog"),
        user.toBuffer(),
        timestamp.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
  }

  it("executes a native SOL transfer after explicit signer confirmation", async () => {
    const recipient = Keypair.generate();
    await airdrop(recipient.publicKey, LAMPORTS_PER_SOL / 10);

    const lamports = 10_000_000;
    const before = await provider.connection.getBalance(recipient.publicKey);

    const signature = await program.methods
      .executeTransfer(new anchor.BN(lamports), false, 1)
      .accounts({
        sender,
        recipient: recipient.publicKey,
        tokenMint: null,
        senderTokenAccount: null,
        recipientTokenAccount: null,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await confirm(signature);

    const after = await provider.connection.getBalance(recipient.publicKey);
    assert.equal(after - before, lamports);
  });

  it("executes an SPL transfer only through validated associated token accounts", async () => {
    const payer = (provider.wallet as anchor.Wallet & { payer: Keypair }).payer;
    const recipient = Keypair.generate();
    await airdrop(recipient.publicKey, LAMPORTS_PER_SOL / 10);

    const mint = await createMint(
      provider.connection,
      payer,
      sender,
      null,
      6,
    );
    const senderAta = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      sender,
    );
    const recipientAta = await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mint,
      recipient.publicKey,
    );

    await mintTo(provider.connection, payer, mint, senderAta, payer, 1_000_000);

    const signature = await program.methods
      .executeTransfer(new anchor.BN(250_000), true, 2)
      .accounts({
        sender,
        recipient: recipient.publicKey,
        tokenMint: mint,
        senderTokenAccount: senderAta,
        recipientTokenAccount: recipientAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await confirm(signature);

    const recipientAccount = await getAccount(provider.connection, recipientAta);
    assert.equal(Number(recipientAccount.amount), 250_000);
  });

  it("initializes a trusted-contact registry and verifies a saved contact", async () => {
    const contact = Keypair.generate();
    const [contactRegistry] = contactRegistryPda(sender);

    await program.methods
      .initializeContactRegistry()
      .accounts({
        user: sender,
        contactRegistry,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .addContact(contact.publicKey)
      .accounts({
        user: sender,
        contactRegistry,
      })
      .rpc();

    const registry = await program.account.contactRegistry.fetch(contactRegistry);
    assert.isTrue(
      registry.contacts.some((savedContact) => savedContact.equals(contact.publicKey)),
    );

    await program.methods
      .verifySavedContact(contact.publicKey)
      .accounts({
        user: sender,
        contactRegistry,
      })
      .rpc();
  });

  it("logs transaction metadata in a timestamp-seeded PDA", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(5_000_000);
    let transactionLog: PublicKey | null = null;

    // The PDA seed uses the current Clock sysvar timestamp. If a test crosses a
    // second boundary between client derivation and execution, retry with the
    // fresh timestamp rather than weakening the on-chain seed contract.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const timestamp = await currentClockTimestamp();
      const [candidate] = transactionLogPda(sender, timestamp);

      try {
        const signature = await program.methods
          .logTransactionMetadata(
            recipient,
            amount,
            "SOL",
            2,
            "Confirmed demo transfer",
          )
          .accounts({
            signer: sender,
            clock: SYSVAR_CLOCK_PUBKEY,
            transactionLog: candidate,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        await confirm(signature);
        transactionLog = candidate;
        break;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1_100));
      }
    }

    assert.isNotNull(transactionLog);
    const log = await program.account.transactionLog.fetch(transactionLog!);
    assert.isTrue(log.sender.equals(sender));
    assert.isTrue(log.recipient.equals(recipient));
    assert.equal(log.amount.toString(), amount.toString());
    assert.equal(log.tokenSymbol, "SOL");
    assert.equal(log.riskLevel, 2);
    assert.equal(log.aiSummary, "Confirmed demo transfer");
  });
});
