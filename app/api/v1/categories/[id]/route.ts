import { NextResponse } from "next/server";
import { categoryService } from "@/lib/services/category.service";
import { z } from "zod";
import { auth } from "@/lib/auth";


const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    isExpense: z.boolean().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const json = await req.json();
        const body = updateCategorySchema.parse(json);
        const { id } = await params;

        const updatedCategory = await categoryService.updateCategory(
            Number(session.user.id),
            parseInt(id),
            body
        );

        if (!updatedCategory) {
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(updatedCategory);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 });
        }
        console.error("[CATEGORY_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;
        console.log("[CATEGORY_DELETE]", id);

        const deletedCategory = await categoryService.deleteCategory(
            Number(session.user.id),
            parseInt(id)
        );

        if (!deletedCategory) {
            return new NextResponse("Category not found", { status: 404 });
        }

        return NextResponse.json(deletedCategory);
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
