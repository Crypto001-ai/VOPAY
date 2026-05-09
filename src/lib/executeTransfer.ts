import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getVopayProgram } from './vopayProgram';
import { parseSolToLamports, getExplorerUrl } from './solanaUtils';
import * as anchor from '@coral-xyz/anchor';

export interface TransferResult {
  signature: string;
  explorerUrl: string;
  recipient: string;
  amount: string;
  riskLevel: number;
  aiSummary?: string;
}

/**
 * Log transaction metadata for transparency.
 * This is a fire-and-forget attempt as per requirements.
 */
export async function logTransactionMetadata(metadata: {
  recipient: string;
  amount: string;
  tokenSymbol: string;
  riskLevel: number;
  aiSummary: string;
}) {
  try {
    console.log('[VoPay Metadata Log] Logging transaction...', metadata);
    // Placeholder for actual logging API call
    // await fetch('/api/log', { method: 'POST', body: JSON.stringify(metadata) });
  } catch (error) {
    console.error('[VoPay Metadata Log] Failed to log metadata:', error);
    // Requirements: DO NOT fail the transaction UI if logging fails.
  }
}

export async function executeVopayTransfer(
  connection: Connection,
  wallet: any,
  recipientAddress: string,
  amountSol: string,
  riskLevelStr: 'low' | 'medium' | 'high'
): Promise<TransferResult> {
  if (!wallet.publicKey) throw new Error('Wallet not connected');

  const program = getVopayProgram(connection, wallet);
  const recipient = new PublicKey(recipientAddress);
  const amountLamports = parseSolToLamports(amountSol);

  // Map risk level: low → 1, medium → 2, high → 3
  const riskMap = { low: 1, medium: 2, high: 3 };
  const riskLevel = riskMap[riskLevelStr] || 1;

  // Validate network (simple check)
  const genesisHash = await connection.getGenesisHash();
  const isDevnet = genesisHash === 'EtWTRABG3VvQSW8icYvYLCpAQUffvbwiHF7pSGRS98k1'; // Devnet genesis hash
  if (!isDevnet) {
    console.warn('Network mismatch: Expected Solana Devnet');
  }

  try {
    const amountBN = new anchor.BN(amountLamports.toString());
    
    const signature = await program.methods
      .executeTransfer(amountBN, false, riskLevel)
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
