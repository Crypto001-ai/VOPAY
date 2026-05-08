use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::{TransactionLog, MAX_AI_SUMMARY_BYTES, MAX_TOKEN_SYMBOL_BYTES};

#[derive(Accounts)]
pub struct LogTransactionMetadata<'info> {
    #[account(mut, signer)]
    pub signer: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,

    #[account(
        init,
        payer = signer,
        space = TransactionLog::SPACE,
        seeds = [
            b"txlog",
            signer.key().as_ref(),
            clock.unix_timestamp.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub transaction_log: Account<'info, TransactionLog>,

    pub system_program: Program<'info, System>,
}

pub fn log_transaction_metadata_handler(
    ctx: Context<LogTransactionMetadata>,
    recipient: Pubkey,
    amount: u64,
    token_symbol: String,
    risk_level: u8,
    ai_summary: String,
) -> Result<()> {
    // Metadata is still user-owned state. Requiring the signer protects users
    // from third parties writing misleading risk records into their history.
    require!(
        ctx.accounts.signer.to_account_info().is_signer,
        ErrorCode::UnauthorizedSigner
    );
    require!(recipient != Pubkey::default(), ErrorCode::InvalidRecipient);
    require!(amount > 0, ErrorCode::InvalidAmount);

    // Borsh stores String length plus UTF-8 bytes. Byte checks prevent account
    // overrun even when summaries contain multi-byte characters.
    require!(
        token_symbol.as_bytes().len() <= MAX_TOKEN_SYMBOL_BYTES,
        ErrorCode::TokenSymbolTooLong
    );
    require!(
        ai_summary.as_bytes().len() <= MAX_AI_SUMMARY_BYTES,
        ErrorCode::AiSummaryTooLong
    );

    let timestamp = ctx.accounts.clock.unix_timestamp;
    let transaction_log = &mut ctx.accounts.transaction_log;

    transaction_log.sender = ctx.accounts.signer.key();
    transaction_log.recipient = recipient;
    transaction_log.amount = amount;
    transaction_log.token_symbol = token_symbol.clone();
    transaction_log.risk_level = risk_level;
    transaction_log.ai_summary = ai_summary.clone();
    transaction_log.timestamp = timestamp;
    transaction_log.bump = ctx.bumps.transaction_log;

    emit!(MetadataLogged {
        sender: ctx.accounts.signer.key(),
        recipient,
        amount,
        token_symbol,
        risk_level,
        ai_summary,
        timestamp,
    });

    Ok(())
}

#[event]
pub struct MetadataLogged {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub token_symbol: String,
    pub risk_level: u8,
    pub ai_summary: String,
    pub timestamp: i64,
}
