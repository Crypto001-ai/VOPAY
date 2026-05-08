use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::{ContactRegistry, MAX_CONTACTS};

#[derive(Accounts)]
pub struct InitializeContactRegistry<'info> {
    #[account(mut, signer)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ContactRegistry::SPACE,
        seeds = [b"contacts", user.key().as_ref()],
        bump
    )]
    pub contact_registry: Account<'info, ContactRegistry>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddContact<'info> {
    #[account(mut, signer)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"contacts", user.key().as_ref()],
        bump = contact_registry.bump,
        has_one = user @ ErrorCode::UnauthorizedSigner
    )]
    pub contact_registry: Account<'info, ContactRegistry>,
}

#[derive(Accounts)]
pub struct VerifySavedContact<'info> {
    #[account(signer)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"contacts", user.key().as_ref()],
        bump = contact_registry.bump,
        has_one = user @ ErrorCode::UnauthorizedSigner
    )]
    pub contact_registry: Account<'info, ContactRegistry>,
}

pub fn initialize_handler(ctx: Context<InitializeContactRegistry>) -> Result<()> {
    require!(
        ctx.accounts.user.to_account_info().is_signer,
        ErrorCode::UnauthorizedSigner
    );

    let registry = &mut ctx.accounts.contact_registry;
    registry.user = ctx.accounts.user.key();
    registry.contacts = Vec::with_capacity(MAX_CONTACTS);
    registry.bump = ctx.bumps.contact_registry;

    Ok(())
}

pub fn add_contact_handler(ctx: Context<AddContact>, contact: Pubkey) -> Result<()> {
    // Adding contacts is an explicit user-signed registry mutation. The program
    // never seeds or trusts contacts without the user's transaction signature.
    require!(
        ctx.accounts.user.to_account_info().is_signer,
        ErrorCode::UnauthorizedSigner
    );
    require!(contact != Pubkey::default(), ErrorCode::InvalidRecipient);

    let registry = &mut ctx.accounts.contact_registry;

    if !registry.contains_contact(&contact) {
        require!(
            registry.contacts.len() < MAX_CONTACTS,
            ErrorCode::ContactRegistryFull
        );
        registry.contacts.push(contact);
    }

    emit!(ContactAdded {
        user: ctx.accounts.user.key(),
        contact,
        total_contacts: registry.contacts.len() as u8,
    });

    Ok(())
}

pub fn verify_handler(ctx: Context<VerifySavedContact>, recipient: Pubkey) -> Result<()> {
    // Verification is read-only but still signer-gated so third parties cannot
    // cheaply enumerate a user's trusted-contact graph through this program.
    require!(
        ctx.accounts.user.to_account_info().is_signer,
        ErrorCode::UnauthorizedSigner
    );
    require!(recipient != Pubkey::default(), ErrorCode::InvalidRecipient);

    let is_trusted = ctx.accounts.contact_registry.contains_contact(&recipient);

    emit!(ContactVerified {
        user: ctx.accounts.user.key(),
        recipient,
        is_trusted,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct ContactAdded {
    pub user: Pubkey,
    pub contact: Pubkey,
    pub total_contacts: u8,
}

#[event]
pub struct ContactVerified {
    pub user: Pubkey,
    pub recipient: Pubkey,
    pub is_trusted: bool,
    pub timestamp: i64,
}
