import * as anchor from "@coral-xyz/anchor";

/**
 * Safe helper to convert SOL to Lamports using BigInt to avoid floating point issues.
 * @param amount The SOL amount as a string
 * @returns anchor.BN lamports
 */
export function parseSolToLamports(amount: string): anchor.BN {
  const normalized = amount.trim().replace(/,/g, "");

  if (!/^\d+(\.\d{1,9})?$/.test(normalized)) {
    throw new Error("Enter a valid SOL amount with up to 9 decimal places.");
  }

  const [wholePart, fractionPart = ""] = normalized.split(".");

  const lamports =
    BigInt(wholePart) * 1_000_000_000n +
    BigInt(fractionPart.padEnd(9, "0"));

  if (lamports <= 0n) {
    throw new Error("Transfer amount must be greater than zero.");
  }

  return new anchor.BN(lamports.toString());
}

export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
