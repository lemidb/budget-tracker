import db from '@/app/db';
import {
  transactionsTable,
  accountsTable,
  categoriesTable,
} from '@/app/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { accountService } from './account.service';

export class TransactionService {
  async createTransaction(
    userId: number,
    data: {
      accountId: number;
      categoryId?: number | null;
      type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
      amount: string;
      description?: string;
      date: Date;
      tags?: string[];
      attachmentUrl?: string;
      // For transfers
      toAccountId?: number;
    }
  ) {
    // Start a transaction for atomic operations
    return await db.transaction(async (tx) => {
      // 1. Validate account ownership
      const [account] = await tx
        .select()
        .from(accountsTable)
        .where(
          and(
            eq(accountsTable.id, data.accountId),
            eq(accountsTable.userId, userId)
          )
        )
        .limit(1);

      if (!account) throw new Error('Account not found');

      // 2. Validate category ownership if provided
      if (data.categoryId) {
        const [category] = await tx
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(
            and(
              eq(categoriesTable.id, data.categoryId),
              eq(categoriesTable.userId, userId)
            )
          )
          .limit(1);

        if (!category) throw new Error('Category not found');
      }

      // 3. Calculate new balance
      let newBalance = BigInt(Math.round(parseFloat(account.balance) * 100));
      const amountInCents = BigInt(Math.round(parseFloat(data.amount) * 100));

      switch (data.type) {
        case 'INCOME':
          newBalance += amountInCents;
          break;
        case 'EXPENSE':
          newBalance -= amountInCents;
          // Optional: Check for negative balance
          if (newBalance < 0 && account.type !== 'CREDIT_CARD') {
            throw new Error('Insufficient funds');
          }
          break;
        case 'TRANSFER':
          if (!data.toAccountId) {
            throw new Error('Transfer requires a destination account');
          }

          // Validate destination account
          const [toAccount] = await tx
            .select()
            .from(accountsTable)
            .where(
              and(
                eq(accountsTable.id, data.toAccountId),
                eq(accountsTable.userId, userId)
              )
            )
            .limit(1);

          if (!toAccount) throw new Error('Destination account not found');

          // Update source account
          newBalance -= amountInCents;
          if (newBalance < 0 && account.type !== 'CREDIT_CARD') {
            throw new Error('Insufficient funds for transfer');
          }

          // Update destination account
          let destNewBalance = BigInt(Math.round(parseFloat(toAccount.balance) * 100));
          destNewBalance += amountInCents;

          await tx
            .update(accountsTable)
            .set({
              balance: (destNewBalance / BigInt(100)).toString(),
              updatedAt: new Date(),
            })
            .where(eq(accountsTable.id, data.toAccountId));

          // Create transfer transaction for destination account
          await tx.insert(transactionsTable).values({
            userId,
            accountId: data.toAccountId,
            type: 'TRANSFER',
            amount: data.amount,
            description: data.description || `Transfer from ${account.name}`,
            date: data.date,
            tags: data.tags,
          });
          break;
      }

      // 4. Update account balance
      await tx
        .update(accountsTable)
        .set({
          balance: (newBalance / BigInt(100)).toString(),
          updatedAt: new Date(),
        })
        .where(eq(accountsTable.id, data.accountId));

      // 5. Create transaction record
      const [transaction] = await tx
        .insert(transactionsTable)
        .values({
          userId,
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          tags: data.tags,
          attachmentUrl: data.attachmentUrl,
        })
        .returning();

      return transaction;
    });
  }

  async getTransactions(
    userId: number,
    filters?: {
      accountId?: number;
      categoryId?: number;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    }
  ) {
    const conditions = [eq(transactionsTable.userId, userId)];

    // Apply filters
    if (filters?.accountId) {
      conditions.push(eq(transactionsTable.accountId, filters.accountId));
    }

    if (filters?.categoryId) {
      conditions.push(eq(transactionsTable.categoryId, filters.categoryId));
    }

    if (filters?.type) {
      conditions.push(eq(transactionsTable.type, filters.type as 'INCOME' | 'EXPENSE' | 'TRANSFER'));
    }

    if (filters?.startDate) {
      conditions.push(gte(transactionsTable.date, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(transactionsTable.date, filters.endDate));
    }

    if (filters?.search) {
      conditions.push(
        sql`${transactionsTable.description} ILIKE ${`%${filters.search}%`}`
      );
    }

    const rows = await db
      .select({
        transaction: transactionsTable,
        account: {
          id: accountsTable.id,
          name: accountsTable.name,
          type: accountsTable.type,
        },
        category: {
          id: categoriesTable.id,
          name: categoriesTable.name,
          icon: categoriesTable.icon,
          color: categoriesTable.color,
        },
      })
      .from(transactionsTable)
      .where(and(...conditions))
      .leftJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
      .leftJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
      .orderBy(desc(transactionsTable.date))
      .limit(100);

    return rows.map((row) => ({
      ...row.transaction,
      account: row.account,
      category: row.category,
    }));
  }

  async deleteTransaction(userId: number, transactionId: number) {
    return await db.transaction(async (tx) => {
      // 1. Get transaction to revert balance
      const [transaction] = await tx
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.id, transactionId),
            eq(transactionsTable.userId, userId)
          )
        )
        .limit(1);

      if (!transaction) throw new Error('Transaction not found');

      // 2. Revert account balance
      const [account] = await tx
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, transaction.accountId))
        .limit(1);

      if (account) {
        let newBalance = BigInt(Math.round(parseFloat(account.balance) * 100));
        const amountInCents = BigInt(Math.round(parseFloat(transaction.amount) * 100));

        // Start reversing the transaction effect
        if (transaction.type === 'INCOME') {
          newBalance -= amountInCents;
        } else if (transaction.type === 'EXPENSE') {
          newBalance += amountInCents;
        } else if (transaction.type === 'TRANSFER') {
          if (transaction.description?.startsWith('Transfer from')) {
            newBalance -= amountInCents;
          } else {
            newBalance += amountInCents;
          }
        }

        await tx
          .update(accountsTable)
          .set({
            balance: (newBalance / BigInt(100)).toString(),
            updatedAt: new Date(),
          })
          .where(eq(accountsTable.id, account.id));
      }

      // 3. Delete transaction
      await tx
        .delete(transactionsTable)
        .where(eq(transactionsTable.id, transactionId));

      return transaction;
    });
  }

  async updateTransaction(userId: number, transactionId: number, data: any) {
    return await db.transaction(async (tx) => {
      // 1. Get old transaction
      const [oldTransaction] = await tx
        .select()
        .from(transactionsTable)
        .where(and(eq(transactionsTable.id, transactionId), eq(transactionsTable.userId, userId)))
        .limit(1);

      if (!oldTransaction) throw new Error("Transaction not found");

      // 2. Revert effect of OLD transaction on its account
      const [oldAccount] = await tx.select().from(accountsTable).where(eq(accountsTable.id, oldTransaction.accountId));
      if (oldAccount) {
        let bal = BigInt(Math.round(parseFloat(oldAccount.balance) * 100));
        // Ensure oldTransaction.amount is treated as positive magnitude for calculation logic
        // (It is stored as positive usually, but let's be sure)
        const oldAmt = BigInt(Math.round(parseFloat(oldTransaction.amount) * 100));

        if (oldTransaction.type === 'INCOME') bal -= oldAmt;
        else if (oldTransaction.type === 'EXPENSE') bal += oldAmt;
        else if (oldTransaction.type === 'TRANSFER') {
          if (oldTransaction.description?.startsWith('Transfer from')) bal -= oldAmt;
          else bal += oldAmt;
        }

        await tx.update(accountsTable).set({
          balance: (bal / BigInt(100)).toString(),
          updatedAt: new Date()
        }).where(eq(accountsTable.id, oldAccount.id));
      }

      // 3. Apply effect of NEW data (or keep old if not changed)
      const newAccountId = data.accountId || oldTransaction.accountId;
      const newAmount = data.amount || oldTransaction.amount;
      const newType = data.type || oldTransaction.type;
      // Check description for transfer direction inference if needed
      const newDesc = data.description || oldTransaction.description;

      const [newAccount] = await tx.select().from(accountsTable).where(eq(accountsTable.id, newAccountId));
      if (newAccount) {
        let bal = BigInt(Math.round(parseFloat(newAccount.balance) * 100));
        const newAmt = BigInt(Math.round(parseFloat(newAmount) * 100));

        if (newType === 'INCOME') bal += newAmt;
        else if (newType === 'EXPENSE') bal -= newAmt;
        else if (newType === 'TRANSFER') {
          if (newDesc?.startsWith('Transfer from')) {
            bal += newAmt;
          } else {
            bal -= newAmt;
          }
        }

        await tx.update(accountsTable).set({
          balance: (bal / BigInt(100)).toString(),
          updatedAt: new Date()
        }).where(eq(accountsTable.id, newAccount.id));
      }

      // 4. Update Transaction
      const [updated] = await tx.update(transactionsTable)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(transactionsTable.id, transactionId))
        .returning();

      return updated;
    });
  }
}
export const transactionService = new TransactionService();
