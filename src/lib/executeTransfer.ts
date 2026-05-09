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

/**
 * Log transaction metadata for transparency on-chain.
 */
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
    
    // Create PDA for metadata
    // [Buffer.from("txlog"), signerPublicKey.toBuffer(), timestamp.to_le_bytes()]
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

    console.log('[VoPay Metadata Log] Attempting on-chain log...', {
      pda: metadataPda.toBase58(),
      timestamp: now
    });

    await program.methods
      .logTransactionMetadata(
        recipientPubkey,
        lamports,
        params.tokenSymbol.slice(0, 10), // max 10 bytes
        params.riskLevel,
        params.aiSummary.slice(0, 100) // max 100 bytes
      )
      .accounts({
        signer: params.wallet.publicKey,
        metadata: metadataPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    console.log('[VoPay Metadata Log] Successfully logged metadata on-chain');
  } catch (error) {
    console.error('[VoPay Metadata Log] Failed to log metadata:', error);
    // Requirements: DO NOT fail the transaction UI if logging fails.
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

  // Map risk level: low → 1, medium → 2, high → 3
  const riskLevel = riskScore === "high" ? 3 : riskScore === "medium" ? 2 : 1;

  try {
    const signature = await program.methods
      .executeTransfer(lamports, false, riskLevel)
      .accounts({
        sender: wallet.publicKey,
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
