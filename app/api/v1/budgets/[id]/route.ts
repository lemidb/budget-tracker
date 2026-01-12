import { NextRequest, NextResponse } from 'next/server';
import { budgetService } from '@/lib/services/budget.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const budget = await budgetService.updateBudget(session.user.id, parseInt(id), body);

        if (!budget) {
            return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
        }

        return NextResponse.json(budget);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update budget' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const deleted = await budgetService.deleteBudget(session.user.id, parseInt(id));

        if (!deleted) {
            return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete budget' },
            { status: 500 }
        );
    }
}
