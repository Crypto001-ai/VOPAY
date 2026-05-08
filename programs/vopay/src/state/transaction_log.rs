use anchor_lang::prelude::*;

pub const MAX_TOKEN_SYMBOL_BYTES: usize = 10;
pub const MAX_AI_SUMMARY_BYTES: usize = 100;

#[account]
pub struct TransactionLog {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub token_symbol: String,
    pub risk_level: u8,
    pub ai_summary: String,
    pub timestamp: i64,
    pub bump: u8,
}

impl TransactionLog {
    pub const SPACE: usize =
        8 + 32 + 32 + 8 + 4 + MAX_TOKEN_SYMBOL_BYTES + 1 + 4 + MAX_AI_SUMMARY_BYTES + 8 + 1;
}
