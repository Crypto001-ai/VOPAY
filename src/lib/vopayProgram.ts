import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "../idl/vopay.json";

export const VOPAY_PROGRAM_ID = new PublicKey(
  "2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK"
);

export function getVopayProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  return new (anchor.Program as any)(idl, VOPAY_PROGRAM_ID, provider);
}
