import db from '@/app/db';
import { accountsTable } from '@/app/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { accountTypeEnum } from "@/app/db/schema"

type accountType = typeof accountTypeEnum.enumValues[number];

export class AccountService {
  async getAccounts(userId: number) {
    return await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .orderBy(accountsTable.name);
  }

  async getAccountById(userId: number, accountId: number) {
    const [account] = await db
      .select()
      .from(accountsTable)
      .where(
        and(
          eq(accountsTable.id, accountId),
          eq(accountsTable.userId, userId)
        )
      )
      .limit(1);

    if (!account) throw new Error('Account not found');
    return account;
  }

  async createAccount(
    userId: number,
    data: {
      name: string;
      type: accountType;
      balance?: string;
      currency?: string;
      isActive?: boolean;
    }
  ) {
    const [account] = await db
      .insert(accountsTable)
      .values({
        userId,
        name: data.name,
        type: data.type,
        balance: data.balance || '0',
        currency: data.currency || 'USD',
        isActive: data.isActive !== false,
      })
      .returning();

    return account;
  }

  async updateAccount(
    userId: number,
    accountId: number,
    data: Partial<{
      name: string;
      type: accountType;
      balance?: string;
      currency: string;
      isActive: boolean;
    }>
  ) {
    console.log(`Here is the data: ${JSON.stringify(data, null, 2)}`)
    const [account] = await db
      .update(accountsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(accountsTable.id, accountId),
          eq(accountsTable.userId, userId)
        )
      )
      .returning();

    if (!account) throw new Error('Account not found');
    return account;
  }

  async deleteAccount(userId: number, accountId: number) {
    // Check if account has transactions before deleting?
    const [account] = await db
      .delete(accountsTable)
      .where(
        and(
          eq(accountsTable.id, accountId),
          eq(accountsTable.userId, userId)
        )
      )
      .returning();

    if (!account) throw new Error('Account not found');
    return account;
  }

  async updateAccountBalance(
    userId: number,
    accountId: number,
    newBalance: string
  ) {
    const [account] = await db
      .update(accountsTable)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(accountsTable.id, accountId),
          eq(accountsTable.userId, userId)
        )
      )
      .returning();

    if (!account) throw new Error('Account not found');
    return account;
  }
}

export const accountService = new AccountService();