import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/vopay.json";

export const VOPAY_PROGRAM_ID = new PublicKey(
  "2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK"
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const resolveContact = (nameOrAddress: string) => {
  const contacts: Record<string, string> = {
    "Victor": "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute",
    "Opera Axe": "67rg7CFkcXcmGD9nKjRR2EjrhgbcxqR3Exf65xSSazNP",
    "Clinton": "Hng37kXuNDJkG44Wpdg6xLmicWk9NuisjGkwzhayKM5n"
  };
  return contacts[nameOrAddress] || nameOrAddress;
};

export function getVopayProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  return new (anchor.Program as any)(idl, VOPAY_PROGRAM_ID, provider);
}

export async function executeVopayTransfer(
  provider: anchor.AnchorProvider,
  recipientAddress: string,
  amountSol: number,
  riskLevel: number
) {
  const program = new (anchor.Program as any)(idl, VOPAY_PROGRAM_ID, provider);
  const recipient = new PublicKey(recipientAddress);
  const lamports = new anchor.BN(amountSol * 1_000_000_000);

  const signature = await program.methods
    .executeTransfer(lamports, false, riskLevel)
    .accounts({
      sender: provider.wallet.publicKey,
      recipient: recipient,
      tokenMint: null,
      senderTokenAccount: null,
      recipientTokenAccount: null,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    } as any)
    .rpc();

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    amountSol,
    recipient: recipientAddress
  };
}
