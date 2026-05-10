import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

export const VOPAY_PROGRAM_ID = new PublicKey(
  "6QdpMaXN77sWmQwRnkAyLiBP1QdwX25Fkt7zUZKB4jAX"
);

export const CONFIG_ACCOUNT = new PublicKey(
  "8NQLjTBUzEHvg1ajE2phSk78F7SRxgUsCCUXG41dxrXQ"
);

export const TREASURY = new PublicKey(
  "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute"
);

const VOPAY_IDL = {
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

export function resolveContact(nameOrAddress: string): string | null {
  const contacts: Record<string, string> = {
    "victor": "3V2PnZBSegHu6Q8BYzR6bk2kfz96jRAYSFoAP2rwUute",
    "opera axe": "67rg7CFkcXcmGD9nKjRR2EjrhgbcxqR3Exf65xSSazNP",
    "clinton": "Hng37kXuNDJkG44Wpdg6xLmicWk9NuisjGkwzhayKM5n",
  };
  const key = nameOrAddress.toLowerCase().trim();
  if (contacts[key]) return contacts[key];
  try {
    new PublicKey(nameOrAddress);
    return nameOrAddress;
  } catch {
    return null;
  }
}

function deriveTxLogPDA(senderPubkey: PublicKey, txIndex: number): PublicKey {
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
) {
  if (!provider.wallet?.publicKey) {
    throw new Error("Wallet not connected");
  }

  const program = new Program(VOPAY_IDL, provider);
  const sender = provider.wallet.publicKey;
  const recipient = new PublicKey(recipientAddress);
  const amountLamports = new BN(Math.floor(amountSol * 1_000_000_000));

  const config = await (program.account as any).config.fetch(CONFIG_ACCOUNT);
  const txCount = Number(config.totalTransactions.toString());
  const txLogPDA = deriveTxLogPDA(sender, txCount);

  const signature = await program.methods
    .execute_vopay_transfer(amountLamports, riskScore)
    .accounts({
      config: CONFIG_ACCOUNT,
      transactionLog: txLogPDA,
      sender: sender,
      recipient: recipient,
      treasury: TREASURY,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    amountSol,
    recipient: recipientAddress,
  };
}
