import { LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Safe helper to convert SOL to Lamports using BigInt to avoid floating point issues.
 * @param amount The SOL amount as a string
 * @returns BigInt lamports
 */
export function parseSolToLamports(amount: string): bigint {
  if (!amount || isNaN(Number(amount))) {
    throw new Error('Invalid amount: Not a number');
  }

  const num = Number(amount);
  if (num <= 0) {
    throw new Error('Invalid amount: Must be greater than zero');
  }

  // Handle precision up to 9 decimals
  const [integral, fractional = ''] = amount.split('.');
  const paddedFractional = fractional.padEnd(9, '0').slice(0, 9);
  
  const integralBig = BigInt(integral || '0') * BigInt(LAMPORTS_PER_SOL);
  const fractionalBig = BigInt(paddedFractional);
  
  return integralBig + fractionalBig;
}

export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
