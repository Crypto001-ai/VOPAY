import * as anchor from '@coral-xyz/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from '../idl/vopay.json';

export const VOPAY_PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_VOPAY_PROGRAM_ID ||
    '2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK'
);

export const VOPAY_EXPLORER_URL = `https://explorer.solana.com/address/${VOPAY_PROGRAM_ID.toBase58()}?cluster=devnet`;

export type RiskScore = 'low' | 'medium' | 'high';

export function getRiskLevel(riskScore: RiskScore): number {
  switch (riskScore) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
    default:
      return 1;
  }
}

export function getVopayProgram(connection: Connection, wallet: AnchorWallet) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  return new anchor.Program(idl as anchor.Idl, VOPAY_PROGRAM_ID, provider);
}

export function parseSolToLamports(amount: string): anchor.BN {
  const normalized = amount.trim().replace(/,/g, '');

  if (!/^\d+(\.\d{1,9})?$/.test(normalized)) {
    throw new Error('Enter a valid SOL amount with up to 9 decimal places.');
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  const lamports =
    BigInt(wholePart) * 1_000_000_000n +
    BigInt(fractionPart.padEnd(9, '0'));

  if (lamports <= 0n) {
    throw new Error('Transfer amount must be greater than zero.');
  }

  return new anchor.BN(lamports.toString());
}

export function normalizeTokenSymbol(token: string): string {
  return token.trim().toUpperCase();
}

export function truncateUtf8(input: string, maxBytes: number): string {
  const encoder = new TextEncoder();
  let output = '';

  for (const char of input) {
    const next = output + char;
    if (encoder.encode(next).length > maxBytes) {
      break;
    }
    output = next;
  }

  return output;
}

export async function getCurrentClockTimestamp(connection: Connection): Promise<anchor.BN> {
  const account = await connection.getAccountInfo(SYSVAR_CLOCK_PUBKEY, 'confirmed');
  if (!account) {
    throw new Error('Clock sysvar account not found.');
  }

  // Clock sysvar stores unix_timestamp as i64 at byte offset 32.
  return new anchor.BN(account.data.subarray(32, 40), 'le');
}

export function getTransactionLogPda(sender: PublicKey, timestamp: anchor.BN): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('txlog'),
      sender.toBuffer(),
      timestamp.toArrayLike(Buffer, 'le', 8),
    ],
    VOPAY_PROGRAM_ID
  )[0];
}

export async function executeNativeSolTransfer(params: {
  connection: Connection;
  wallet: AnchorWallet;
  recipient: PublicKey;
  lamports: anchor.BN;
  riskLevel: number;
}) {
  const program = getVopayProgram(params.connection, params.wallet);

  return program.methods
    .executeTransfer(params.lamports, false, params.riskLevel)
    .accounts({
      sender: params.wallet.publicKey,
      recipient: params.recipient,
      tokenMint: null,
      senderTokenAccount: null,
      recipientTokenAccount: null,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

export async function logTransactionMetadataWithRetry(params: {
  connection: Connection;
  wallet: AnchorWallet;
  recipient: PublicKey;
  amount: anchor.BN;
  tokenSymbol: string;
  riskLevel: number;
  aiSummary: string;
}) {
  const program = getVopayProgram(params.connection, params.wallet);
  const tokenSymbol = truncateUtf8(normalizeTokenSymbol(params.tokenSymbol), 10);
  const aiSummary = truncateUtf8(params.aiSummary, 100);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const timestamp = await getCurrentClockTimestamp(params.connection);
    const transactionLog = getTransactionLogPda(params.wallet.publicKey, timestamp);

    try {
      return await program.methods
        .logTransactionMetadata(
          params.recipient,
          params.amount,
          tokenSymbol,
          params.riskLevel,
          aiSummary
        )
        .accounts({
          signer: params.wallet.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
          transactionLog,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 1_100));
    }
  }

  throw new Error('Unable to log transaction metadata.');
}
