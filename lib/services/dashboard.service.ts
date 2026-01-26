import db from '@/app/db';
import {
    transactionsTable,
    accountsTable,
    categoriesTable,
    budgetsTable,
} from '@/app/db/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

export class DashboardService {
    async getDashboardData(userId: number) {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // Get all transactions for the last 6 months
        const transactions = await db
            .select()
            .from(transactionsTable)
            .where(and(
                eq(transactionsTable.userId, userId),
                gte(transactionsTable.date, sixMonthsAgo)
            ));

        // Get all budgets for the user
        const budgets = await db
            .select()
            .from(budgetsTable)
            .where(and(
                eq(budgetsTable.userId, userId),
                eq(budgetsTable.isActive, true)
            ));

        // Prepare monthly data for the last 6 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = [];

        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(now.getMonth() - (5 - i));
            const monthName = months[date.getMonth()];
            const monthIdx = date.getMonth();
            const yearIdx = date.getFullYear();

            const monthTransactions = transactions.filter(t =>
                t.date.getMonth() === monthIdx && t.date.getFullYear() === yearIdx
            );

            const income = monthTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const expenses = monthTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            // Total budget for this month (sum of all active budgets)
            // Simplified: we'll just sum the amounts of active budgets for now
            const monthlyBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);

            monthlyData.push({
                month: monthName,
                income,
                expenses,
                budget: monthlyBudget,
            });
        }

        // Expense breakdown by category for the CURRENT month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const expenseByCategory = await db
            .select({
                name: categoriesTable.name,
                value: sql<number>`SUM(${transactionsTable.amount})`.mapWith(Number),
            })
            .from(transactionsTable)
            .innerJoin(categoriesTable, eq(transactionsTable.categoryId, categoriesTable.id))
            .where(and(
                eq(transactionsTable.userId, userId),
                eq(transactionsTable.type, 'EXPENSE'),
                gte(transactionsTable.date, startOfMonth)
            ))
            .groupBy(categoriesTable.name);

        return {
            monthlyData,
            expenseByCategory,
        };
    }
}

export const dashboardService = new DashboardService();