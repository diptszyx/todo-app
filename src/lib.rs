use anchor_lang::prelude::*;

declare_id!("34HsRQej7oKwqBqnm7BojyoUWYwek39QjJkgkPPK6aab");

#[program]
pub mod todoapp {
    use super::*;

    pub fn add_task(ctx: Context<AddTask>, content: String) -> Result<()> {
        let task_account = &mut ctx.accounts.task_account;
        
        task_account.authority = ctx.accounts.authority.key();
        task_account.content = content;
        task_account.marked = false;

        Ok(())
    }

    pub fn remove_task(_ctx: Context<RemoveTask>) -> Result<()> {
        // Không cần làm gì thêm vì task_account sẽ tự động đóng
        Ok(())
    }

    pub fn mark_task(ctx: Context<MarkTask>) -> Result<()> {
        let task_account = &mut ctx.accounts.task_account;
        task_account.marked = !task_account.marked;
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(content: String)]
pub struct AddTask<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 4 + 200, // Xóa + 8 vì không cần space cho timestamp nữa
        seeds = [
            b"task".as_ref(), 
            authority.key().as_ref(),
            content.as_bytes()
        ],
        bump
    )]
    pub task_account: Account<'info, TaskAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveTask<'info> {
    #[account(
        mut,
        close = authority,
        has_one = authority,
    )]
    pub task_account: Account<'info, TaskAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct MarkTask<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub task_account: Account<'info, TaskAccount>,
    pub authority: Signer<'info>,
}

#[account]
pub struct TaskAccount {
    pub authority: Pubkey,    // 32
    pub content: String,      // 4 + 200
    pub marked: bool,         // 1
}
