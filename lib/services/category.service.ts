import db from "@/app/db";
import { categoriesTable } from "@/app/db/schema";
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
    const [deleted] = await db
      .delete(categoriesTable)
      .where(and(eq(categoriesTable.id, categoryId), eq(categoriesTable.userId, userId)))
      .returning();
    return deleted;
  }
}

export const categoryService = new CategoryService();
