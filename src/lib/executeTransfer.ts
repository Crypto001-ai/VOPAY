import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getVopayProgram } from './vopayProgram';
import { parseSolToLamports, getExplorerUrl } from './solanaUtils';
import type { AnchorWallet } from "@solana/wallet-adapter-react";

export interface TransferResult {
  signature: string;
  explorerUrl: string;
  recipient: string;
  amount: string;
  riskLevel: number;
  aiSummary?: string;
}

export async function logTransactionMetadata(params: {
  connection: Connection;
  wallet: AnchorWallet;
  recipient: string;
  amount: string;
  tokenSymbol: string;
  riskLevel: number;
  aiSummary: string;
}) {
  try {
    const program = getVopayProgram(params.connection, params.wallet);
    const recipientPubkey = new PublicKey(params.recipient);
    const lamports = parseSolToLamports(params.amount);
    
    const now = Math.floor(Date.now() / 1000);
    const timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeBigInt64LE(BigInt(now));

    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("txlog"),
        params.wallet.publicKey.toBuffer(),
        timestampBuffer
      ],
      program.programId
    );

    await program.methods
      .logTransactionMetadata(
        recipientPubkey,
        lamports,
        params.tokenSymbol.slice(0, 10),
        params.riskLevel,
        params.aiSummary.slice(0, 100)
      )
      .accounts({
        signer: params.wallet.publicKey,
        clock: new PublicKey("SysvarC1ock11111111111111111111111111111111"),
        transactionLog: metadataPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

  } catch (error) {
    console.error('[VoPay Metadata Log] Failed:', error);
    // Never fail the main transaction if logging fails
  }
}

export async function executeVopayTransfer(
  connection: Connection,
  wallet: AnchorWallet,
  recipientAddress: string,
  amountSol: string,
  riskScore: 'low' | 'medium' | 'high'
): Promise<TransferResult> {
  if (!wallet.publicKey) throw new Error('Wallet not connected');

  const program = getVopayProgram(connection, wallet);
  const recipient = new PublicKey(recipientAddress);
  const lamports = parseSolToLamports(amountSol);

  const riskLevel = riskScore === "high" ? 3 : riskScore === "medium" ? 2 : 1;

  try {
    const signature = await program.methods
      .executeTransfer(lamports, false, riskLevel)
      .accounts({
        sender: wallet.publicKey,
        recipient: recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return {
      signature,
      explorerUrl: getExplorerUrl(signature),
      recipient: recipientAddress,
      amount: amountSol,
      riskLevel
    };
  } catch (error) {
    console.error('Error in executeVopayTransfer:', error);
    throw error;
  }
}
