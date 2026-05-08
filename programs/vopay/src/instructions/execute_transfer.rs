use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::get_associated_token_address;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    #[account(mut, signer)]
    pub sender: Signer<'info>,

    /// CHECK: For SOL this can be any writable recipient account. For SPL this
    /// is the recipient wallet owner, and its associated token account is
    /// validated below before the token-program CPI is allowed to run.
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub token_mint: Option<Account<'info, Mint>>,

    #[account(mut)]
    pub sender_token_account: Option<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub recipient_token_account: Option<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn execute_transfer_handler(
    ctx: Context<ExecuteTransfer>,
    amount: u64,
    is_spl: bool,
    risk_level: u8,
) -> Result<()> {
    // The frontend may prepare the transaction, but only this signer can
    // authorize value movement. This prevents any PDA or delegated actor from
    // executing user funds on their behalf.
    require!(
        ctx.accounts.sender.to_account_info().is_signer,
        ErrorCode::UnauthorizedSigner
    );

    // Zero-amount transfers are ambiguous in audit logs and can be used to
    // spam confirmation flows, so they are rejected before any CPI.
    require!(amount > 0, ErrorCode::InvalidAmount);

    // The all-zero pubkey is never a meaningful destination for VoPay and is
    // usually a client-side bug or maliciously malformed input.
    require!(
        ctx.accounts.recipient.key() != Pubkey::default(),
        ErrorCode::InvalidRecipient
    );

    let timestamp = Clock::get()?.unix_timestamp;

    if is_spl {
        execute_spl_transfer(&ctx, amount)?;
    } else {
        execute_sol_transfer(&ctx, amount)?;
    }

    emit!(TransferExecuted {
        sender: ctx.accounts.sender.key(),
        recipient: ctx.accounts.recipient.key(),
        amount,
        risk_level,
        timestamp,
    });

    Ok(())
}

fn execute_sol_transfer(ctx: &Context<ExecuteTransfer>, amount: u64) -> Result<()> {
    let cpi_accounts = system_program::Transfer {
        from: ctx.accounts.sender.to_account_info(),
        to: ctx.accounts.recipient.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);

    system_program::transfer(cpi_ctx, amount).map_err(|err| {
        msg!("SOL transfer CPI failed: {:?}", err);
        error!(ErrorCode::TransferFailed)
    })
}

fn execute_spl_transfer(ctx: &Context<ExecuteTransfer>, amount: u64) -> Result<()> {
    let mint = ctx
        .accounts
        .token_mint
        .as_ref()
        .ok_or_else(|| error!(ErrorCode::MissingSplAccount))?;
    let sender_ata = ctx
        .accounts
        .sender_token_account
        .as_ref()
        .ok_or_else(|| error!(ErrorCode::MissingSplAccount))?;
    let recipient_ata = ctx
        .accounts
        .recipient_token_account
        .as_ref()
        .ok_or_else(|| error!(ErrorCode::MissingSplAccount))?;

    let mint_key = mint.key();
    let sender_key = ctx.accounts.sender.key();
    let recipient_key = ctx.accounts.recipient.key();
    let expected_sender_ata = get_associated_token_address(&sender_key, &mint_key);
    let expected_recipient_ata = get_associated_token_address(&recipient_key, &mint_key);

    // These checks bind the transfer to the canonical ATAs for the confirmed
    // sender, recipient, and mint. A malicious UI cannot swap in a different
    // token account after the user confirms the wallet-level destination.
    require!(
        sender_ata.key() == expected_sender_ata,
        ErrorCode::InvalidAssociatedTokenAccount
    );
    require!(
        recipient_ata.key() == expected_recipient_ata,
        ErrorCode::InvalidAssociatedTokenAccount
    );
    require!(
        sender_ata.owner == sender_key,
        ErrorCode::InvalidAssociatedTokenAccount
    );
    require!(
        recipient_ata.owner == recipient_key,
        ErrorCode::InvalidAssociatedTokenAccount
    );
    require!(
        sender_ata.mint == mint_key,
        ErrorCode::InvalidAssociatedTokenAccount
    );
    require!(
        recipient_ata.mint == mint_key,
        ErrorCode::InvalidAssociatedTokenAccount
    );

    let cpi_accounts = Transfer {
        from: sender_ata.to_account_info(),
        to: recipient_ata.to_account_info(),
        authority: ctx.accounts.sender.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

    token::transfer(cpi_ctx, amount).map_err(|err| {
        msg!("SPL transfer CPI failed: {:?}", err);
        error!(ErrorCode::TransferFailed)
    })
}

#[event]
pub struct TransferExecuted {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub risk_level: u8,
    pub timestamp: i64,
}
