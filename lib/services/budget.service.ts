import db from "@/app/db";
import { budgetsTable, categoriesTable, transactionsTable } from "@/app/db/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";


export class BudgetService {
    async getBudgets(userId: number) {

        const budgets = await db
            .select({
                id: budgetsTable.id,
                amount: budgetsTable.amount,
                period: budgetsTable.period,
                startDate: budgetsTable.startDate,
                endDate: budgetsTable.endDate,
                category: {
                    id: categoriesTable.id,
                    name: categoriesTable.name,
                    icon: categoriesTable.icon,
                    color: categoriesTable.color,
                },
            })
            .from(budgetsTable)
            .leftJoin(categoriesTable, eq(budgetsTable.categoryId, categoriesTable.id))
            .where(and(eq(budgetsTable.userId, userId), eq(budgetsTable.isActive, true)))
            .orderBy(desc(budgetsTable.createdAt));


        const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
            if (!budget.category?.id) return { ...budget, spent: 0 };

            const conditions = [
                eq(transactionsTable.userId, userId),
                eq(transactionsTable.categoryId, budget.category.id),
                eq(transactionsTable.type, 'EXPENSE'),
            ];

            if (budget.startDate) {
                conditions.push(gte(transactionsTable.date, budget.startDate));
            }
            if (budget.endDate) {
                conditions.push(lte(transactionsTable.date, budget.endDate));
            }

            const [result] = await db
                .select({
                    total: sql<number>`sum(${transactionsTable.amount})`.mapWith(Number)
                })
                .from(transactionsTable)
                .where(and(...conditions));

            return {
                ...budget,
                spent: result?.total || 0
            };
        }));

        return budgetsWithSpent;
    }

    async createBudget(userId: number, data: any) {
        const [budget] = await db
            .insert(budgetsTable)
            .values({
                userId,
                ...data,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
            })
            .returning();
        return budget;
    }

    async updateBudget(userId: number, budgetId: number, data: any) {
        const [updated] = await db
            .update(budgetsTable)
            .set({
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : null,
            })
            .where(and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)))
            .returning();
        return updated;
    }

    async deleteBudget(userId: number, budgetId: number) {
        const [deleted] = await db
            .delete(budgetsTable)
            .where(and(eq(budgetsTable.id, budgetId), eq(budgetsTable.userId, userId)))
            .returning();
        return deleted;
    }
}

export const budgetService = new BudgetService();
