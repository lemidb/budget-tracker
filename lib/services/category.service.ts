import db from "@/app/db";
import { categoriesTable } from "@/app/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export class CategoryService {
  async getCategories(
    userId: number,
    options?: {
      parentId?: number | null;
      isExpense?: boolean;
      includeSubcategories?: boolean;
    }
  ) {
    const conditions = [eq(categoriesTable.userId, userId)];

    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        conditions.push(isNull(categoriesTable.parentId));
      } else {
        conditions.push(eq(categoriesTable.parentId, options.parentId));
      }
    }

    if (options?.isExpense !== undefined) {
      conditions.push(eq(categoriesTable.isExpense, options.isExpense));
    }

    return await db
      .select()
      .from(categoriesTable)
      .where(and(...conditions))
      .orderBy(categoriesTable.name);
  }

  async createCategory(
    userId: number,
    data: {
      name: string;
      icon?: string;
      color?: string;
      isExpense: boolean;
      parentId?: number | null;
    }
  ) {
    // Validate parent exists and belongs to user
    if (data.parentId) {
      const [parent] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(
          and(
            eq(categoriesTable.id, data.parentId),
            eq(categoriesTable.userId, userId)
          )
        )
        .limit(1);

      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    const [category] = await db
      .insert(categoriesTable)
      .values({
        userId,
        name: data.name,
        icon: data.icon,
        color: data.color,
        isExpense: data.isExpense,
        parentId: data.parentId,
      })
      .returning();

    return category;
  }

  // ... update, delete methods similar to AccountService
}
