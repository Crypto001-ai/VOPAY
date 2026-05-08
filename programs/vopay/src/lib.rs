#![allow(unexpected_cfgs)]

pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
pub use instructions::*;

declare_id!("2BqHZjo6i4qGLeqU43KFHeW7qwymY9PXc5J5iXzsrsKK");

#[program]
pub mod vopay {
    use super::*;

    pub fn execute_transfer(
        ctx: Context<ExecuteTransfer>,
        amount: u64,
        is_spl: bool,
        risk_level: u8,
    ) -> Result<()> {
        instructions::execute_transfer::execute_transfer_handler(ctx, amount, is_spl, risk_level)
    }

    pub fn initialize_contact_registry(ctx: Context<InitializeContactRegistry>) -> Result<()> {
        instructions::verify_contact::initialize_handler(ctx)
    }

    pub fn add_contact(ctx: Context<AddContact>, contact: Pubkey) -> Result<()> {
        instructions::verify_contact::add_contact_handler(ctx, contact)
    }

    pub fn verify_saved_contact(ctx: Context<VerifySavedContact>, recipient: Pubkey) -> Result<()> {
        instructions::verify_contact::verify_handler(ctx, recipient)
    }

    pub fn log_transaction_metadata(
        ctx: Context<LogTransactionMetadata>,
        recipient: Pubkey,
        amount: u64,
        token_symbol: String,
        risk_level: u8,
        ai_summary: String,
    ) -> Result<()> {
        instructions::log_metadata::log_transaction_metadata_handler(
            ctx,
            recipient,
            amount,
            token_symbol,
            risk_level,
            ai_summary,
        )
    }
}
