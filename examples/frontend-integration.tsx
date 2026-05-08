import { useCallback, useMemo } from "react";
import * as anchor from "@coral-xyz/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import idl from "../idl/vopay.json";
import type { Vopay } from "../target/types/vopay";

export const VOPAY_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_VOPAY_PROGRAM_ID ??
    "2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK",
);

type ConfirmedTransfer = {
  recipient: PublicKey;
  amountBaseUnits: anchor.BN | number | string;
  isSpl: boolean;
  tokenMint?: PublicKey;
  riskLevel: number;
};

type MetadataInput = {
  recipient: PublicKey;
  amountBaseUnits: anchor.BN | number | string;
  tokenSymbol: string;
  riskLevel: number;
  aiSummary: string;
};

function buildProgram(connection: anchor.web3.Connection, wallet: AnchorWallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  return new anchor.Program<Vopay>(idl as Vopay, VOPAY_PROGRAM_ID, provider);
}

function contactRegistryPda(user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("contacts"), user.toBuffer()],
    VOPAY_PROGRAM_ID,
  )[0];
}

async function currentClockTimestamp(connection: anchor.web3.Connection) {
  const account = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY);
  if (!account) {
    throw new Error("Clock sysvar account not found");
  }

  return new anchor.BN(account.data.subarray(32, 40), "le");
}

function transactionLogPda(user: PublicKey, timestamp: anchor.BN) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("txlog"),
      user.toBuffer(),
      timestamp.toArrayLike(Buffer, "le", 8),
    ],
    VOPAY_PROGRAM_ID,
  )[0];
}

export function useVopayProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) {
      return null;
    }

    return buildProgram(connection, wallet);
  }, [connection, wallet]);

  const executeConfirmedTransfer = useCallback(
    async (request: ConfirmedTransfer) => {
      if (!wallet || !program) {
        throw new Error("Wallet not connected");
      }

      const amount = new anchor.BN(request.amountBaseUnits);
      const tokenMint = request.isSpl ? request.tokenMint : null;

      if (request.isSpl && !tokenMint) {
        throw new Error("SPL transfers require a token mint");
      }

      const senderTokenAccount =
        request.isSpl && tokenMint
          ? getAssociatedTokenAddressSync(tokenMint, wallet.publicKey)
          : null;
      const recipientTokenAccount =
        request.isSpl && tokenMint
          ? getAssociatedTokenAddressSync(tokenMint, request.recipient)
          : null;

      const signature = await program.methods
        .executeTransfer(amount, request.isSpl, request.riskLevel)
        .accounts({
          sender: wallet.publicKey,
          recipient: request.recipient,
          tokenMint,
          senderTokenAccount,
          recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      };
    },
    [program, wallet],
  );

  const initializeContactRegistry = useCallback(async () => {
    if (!wallet || !program) {
      throw new Error("Wallet not connected");
    }

    const contactRegistry = contactRegistryPda(wallet.publicKey);
    return program.methods
      .initializeContactRegistry()
      .accounts({
        user: wallet.publicKey,
        contactRegistry,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  }, [program, wallet]);

  const addTrustedContact = useCallback(
    async (contact: PublicKey) => {
      if (!wallet || !program) {
        throw new Error("Wallet not connected");
      }

      return program.methods
        .addContact(contact)
        .accounts({
          user: wallet.publicKey,
          contactRegistry: contactRegistryPda(wallet.publicKey),
        })
        .rpc();
    },
    [program, wallet],
  );

  const verifySavedContact = useCallback(
    async (recipient: PublicKey) => {
      if (!wallet || !program) {
        throw new Error("Wallet not connected");
      }

      return program.methods
        .verifySavedContact(recipient)
        .accounts({
          user: wallet.publicKey,
          contactRegistry: contactRegistryPda(wallet.publicKey),
        })
        .rpc();
    },
    [program, wallet],
  );

  const logTransactionMetadata = useCallback(
    async (metadata: MetadataInput) => {
      if (!wallet || !program) {
        throw new Error("Wallet not connected");
      }

      const timestamp = await currentClockTimestamp(connection);
      const transactionLog = transactionLogPda(wallet.publicKey, timestamp);

      return program.methods
        .logTransactionMetadata(
          metadata.recipient,
          new anchor.BN(metadata.amountBaseUnits),
          metadata.tokenSymbol,
          metadata.riskLevel,
          metadata.aiSummary,
        )
        .accounts({
          signer: wallet.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
          transactionLog,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    },
    [connection, program, wallet],
  );

  return {
    program,
    executeConfirmedTransfer,
    initializeContactRegistry,
    addTrustedContact,
    verifySavedContact,
    logTransactionMetadata,
  };
}
