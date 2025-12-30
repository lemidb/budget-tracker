import { integer, pgTable, varchar, text, timestamp, boolean, decimal, pgEnum, jsonb } from "drizzle-orm/pg-core";

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', ['INCOME', 'EXPENSE', 'TRANSFER']);
export const accountTypeEnum = pgEnum('account_type', ['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT', 'SAVINGS', 'OTHER']);
export const frequencyEnum = pgEnum('frequency', ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME']);

// Users
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  emailVerified: boolean().default(false),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Accounts
export const accountsTable = pgTable("accounts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 100 }).notNull(),
  type: accountTypeEnum('type').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: varchar({ length: 3 }).notNull().default('USD'),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Categories
export const categoriesTable = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 100 }).notNull(),
  icon: varchar({ length: 50 }),
  color: varchar({ length: 20 }),
  isExpense: boolean().notNull().default(true),
  parentId: integer().references((): any => categoriesTable.id, { onDelete: 'set null' }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Transactions
export const transactionsTable = pgTable("transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  accountId: integer().notNull().references(() => accountsTable.id, { onDelete: 'cascade' }),
  categoryId: integer().references(() => categoriesTable.id, { onDelete: 'set null' }),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text(),
  date: timestamp().notNull(),
  isRecurring: boolean().default(false),
  recurringId: integer(),
  tags: text().array(),
  attachmentUrl: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Budgets
export const budgetsTable = pgTable("budgets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  categoryId: integer().references(() => categoriesTable.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  period: frequencyEnum('period').notNull(),
  startDate: timestamp().notNull(),
  endDate: timestamp(),
  isActive: boolean().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Saving Goals
export const savingGoalsTable = pgTable("saving_goals", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 100 }).notNull(),
  targetAmount: decimal('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal('current_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  targetDate: timestamp(),
  description: text(),
  isCompleted: boolean().default(false),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

// Recurring Transactions
export const recurringTransactionsTable = pgTable("recurring_transactions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  accountId: integer().notNull().references(() => accountsTable.id, { onDelete: 'cascade' }),
  categoryId: integer().references(() => categoriesTable.id, { onDelete: 'set null' }),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text(),
  frequency: frequencyEnum('frequency').notNull(),
  startDate: timestamp().notNull(),
  endDate: timestamp(),
  lastRun: timestamp(),
  nextRun: timestamp(),
  isActive: boolean().default(true),
  metadata: jsonb(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});


