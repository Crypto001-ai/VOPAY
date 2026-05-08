use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Recipient cannot be the default zero public key.")]
    InvalidRecipient,
    #[msg("Transfer amount must be greater than zero.")]
    InvalidAmount,
    #[msg("The expected user signer did not sign this transaction.")]
    UnauthorizedSigner,
    #[msg("The recipient was not found in the trusted contacts registry.")]
    ContactNotFound,
    #[msg("The SOL or SPL token transfer CPI failed.")]
    TransferFailed,
    #[msg("An SPL transfer requires token mint, sender ATA, and recipient ATA accounts.")]
    MissingSplAccount,
    #[msg("The provided token account is not the expected associated token account.")]
    InvalidAssociatedTokenAccount,
    #[msg("The contact registry can store at most ten trusted contacts.")]
    ContactRegistryFull,
    #[msg("Token symbol must be 10 UTF-8 bytes or fewer.")]
    TokenSymbolTooLong,
    #[msg("AI summary must be 100 UTF-8 bytes or fewer.")]
    AiSummaryTooLong,
}
