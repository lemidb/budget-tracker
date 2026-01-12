import { NextResponse } from "next/server";
import { categoryService } from "@/lib/services/category.service";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createCategorySchema = z.object({
    name: z.string().min(1),
    icon: z.string().optional(),
    color: z.string().optional(),
    isExpense: z.boolean().default(true),
});

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const categories = await categoryService.getCategories(Number(session.user.id));
        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = createCategorySchema.parse(json);

        const category = await categoryService.createCategory(Number(session.user.id), body);
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[CATEGORIES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
