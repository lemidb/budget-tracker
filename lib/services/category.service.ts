import db from "@/app/db";
import { budgetsTable, categoriesTable } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";

export class CategoryService {
  async getCategories(userId: number) {
    return await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId))
      .orderBy(desc(categoriesTable.createdAt));
  }

  async createCategory(userId: number, data: Omit<typeof categoriesTable.$inferInsert, "userId">) {
    const [category] = await db
      .insert(categoriesTable)
      .values({
        ...data,
        userId,
      })
      .returning();
    return category;
  }

  async updateCategory(userId: number, categoryId: number, data: Partial<typeof categoriesTable.$inferInsert>) {
    const [updated] = await db
      .update(categoriesTable)
      .set(data)
      .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCategory(userId: number, categoryId: number) {

    const budgetUsage = await db
      .select({ id: budgetsTable.id })
      .from(budgetsTable)
      .where(
        and(
          eq(budgetsTable.userId, userId),
          eq(budgetsTable.categoryId, categoryId)
        )
      )
      .limit(1);

    if (budgetUsage.length > 0) {
      throw new Error("THIS CATEGORY CANNOT BE DELETED BECAUSE IT IS ASSIGNED TO AN ACTIVE BUDGET.");
    }
    const [deleted] = await db
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.userId, userId)))
      .returning();
    return deleted;
  }
}

export const categoryService = new CategoryService();
