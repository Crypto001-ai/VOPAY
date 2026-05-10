import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";

export const VOPAY_PROGRAM_ID = new PublicKey(
  "6QdpMaXN77sWmQwRnkAyLiBP1QdwX25Fkt7zUZKB4jAX"
);

export const CONFIG_ACCOUNT = new PublicKey(
  "8NQLjTBUzEHvg1ajE2phSk78F7SRxgUsCCUXG41dxrXQ"
);

export const TREASURY = new PublicKey(
  "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute"
);

export const DEVNET_RPC = clusterApiUrl("devnet");

export const CONTACTS: Record<string, { name: string; address: string }> = {
  victor: {
    name: "Victor",
    address: "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute",
  },
  "opera axe": {
    name: "Opera Axe",
    address: "67rg7CFkcXcmGD9nKjRR2EjrhgbcxqR3Exf65xSSazNP",
  },
  clinton: {
    name: "Clinton",
    address: "Hng37kXuNDJkG44Wpdg6xLmicWk9NuisjGkwzhayKM5n",
  },
};

export const VOPAY_IDL: Idl = {
  address: "6QdpMaXN77sWmQwRnkAyLiBP1QdwX25Fkt7zUZKB4jAX",
  metadata: { name: "workspace", version: "0.1.0", spec: "0.1.0" },
  instructions: [
    {
      name: "execute_vopay_transfer",
      discriminator: [36, 65, 160, 18, 140, 170, 103, 197],
      accounts: [
        { name: "config", writable: true },
        { name: "transaction_log", writable: true, signer: false },
        { name: "sender", writable: true, signer: true },
        { name: "recipient", writable: true },
        { name: "treasury", writable: true },
        { name: "system_program" },
      ],
      args: [
        { name: "amount_lamports", type: "u64" },
        { name: "risk_score", type: "u8" },
      ],
    },
  ],
  accounts: [
    {
      name: "Config",
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130],
    },
  ],
  types: [
    {
      name: "Config",
      type: {
        kind: "struct" as const,
        fields: [
          { name: "bump", type: "u8" },
          { name: "authority", type: "pubkey" },
          { name: "treasury", type: "pubkey" },
          { name: "fee_bps", type: "u16" },
          { name: "max_transfer_lamports", type: "u64" },
          { name: "high_risk_threshold", type: "u8" },
          { name: "is_active", type: "bool" },
          { name: "is_paused", type: "bool" },
          { name: "total_transactions", type: "u64" },
          { name: "total_volume_lamports", type: "u64" },
          { name: "total_blocked", type: "u64" },
          { name: "version", type: "u8" },
        ],
      },
    },
  ],
} as any;

export interface TransferResult {
  signature: string;
  explorerUrl: string;
  amountSol: number;
  recipient: string;
  fee: number;
}

export interface TransferError {
  code: string;
  message: string;
}

export function resolveContact(nameOrAddress: string): string | null {
  const key = nameOrAddress.toLowerCase().trim();
  if (CONTACTS[key]) {
    return CONTACTS[key].address;
  }
  try {
    new PublicKey(nameOrAddress);
    return nameOrAddress;
  } catch {
    return null;
  }
}

export function getVoPayProgram(provider: AnchorProvider): Program {
  return new Program(VOPAY_IDL, provider);
}

export function deriveTxLogPDA(
  senderPubkey: PublicKey,
  txIndex: number
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("tx_log"),
      senderPubkey.toBuffer(),
      new BN(txIndex).toArrayLike(Buffer, "le", 8),
    ],
    VOPAY_PROGRAM_ID
  );
  return pda;
}

export async function executeVopayTransfer(
  provider: AnchorProvider,
  recipientAddress: string,
  amountSol: number,
  riskScore: number
): Promise<TransferResult> {
  if (!provider.wallet?.publicKey) {
    throw new Error("Wallet not connected");
  }
  if (amountSol <= 0) {
    throw { code: "InvalidAmount", message: "Please enter a valid amount" };
  }
  if (amountSol > 5) {
    throw { code: "TransferExceedsMax", message: "Transfer exceeds 5 SOL maximum" };
  }

  const recipientPubkey = new PublicKey(recipientAddress);
  const sender = provider.wallet.publicKey;
  const program = getVoPayProgram(provider);

  const config = await (program.account as any).config.fetch(CONFIG_ACCOUNT);
  const txCount = Number(config.totalTransactions.toString());
  const txLogPDA = deriveTxLogPDA(sender, txCount);
  const amountLamports = new BN(Math.floor(amountSol * 1_000_000_000));

  try {
    const signature = await program.methods
      .execute_vopay_transfer(amountLamports, riskScore)
      .accounts({
        config: CONFIG_ACCOUNT,
        transactionLog: txLogPDA,
        sender: sender,
        recipient: recipientPubkey,
        treasury: TREASURY,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    const feeBps = Number(config.feeBps);
    const fee = (amountSol * feeBps) / 10000;

    return { signature, explorerUrl, amountSol, recipient: recipientAddress, fee };

  } catch (error: any) {
    const msg = error?.message || error?.toString() || "";
    if (msg.includes("HighRiskBlocked")) throw { code: "HighRiskBlocked", message: "Transaction blocked - risk score too high" };
    if (msg.includes("TransferExceedsMax")) throw { code: "TransferExceedsMax", message: "Transfer exceeds 5 SOL maximum" };
    if (msg.includes("InvalidAmount")) throw { code: "InvalidAmount", message: "Please enter a valid amount" };
    if (msg.includes("ConfigPaused")) throw { code: "ConfigPaused", message: "VoPay is temporarily unavailable" };
    if (msg.includes("User rejected") || msg.includes("Transaction cancelled")) throw { code: "UserRejected", message: "Transaction cancelled by user" };
    if (msg.includes("Insufficient")) throw { code: "InsufficientFunds", message: "Insufficient SOL balance" };
    throw { code: "Unknown", message: msg || "Transaction failed" };
  }
           }
