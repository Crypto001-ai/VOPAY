use anchor_lang::prelude::*;

pub const MAX_CONTACTS: usize = 10;

#[account]
pub struct ContactRegistry {
    pub user: Pubkey,
    pub contacts: Vec<Pubkey>,
    pub bump: u8,
}

impl ContactRegistry {
    pub const SPACE: usize = 8 + 32 + 4 + (MAX_CONTACTS * 32) + 1;

    pub fn contains_contact(&self, recipient: &Pubkey) -> bool {
        self.contacts.iter().any(|contact| contact == recipient)
    }
}
