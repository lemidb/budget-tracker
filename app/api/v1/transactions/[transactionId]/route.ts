
import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/lib/services/transaction.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId } = await params;
        const body = await request.json();

        if (body.date) {
            body.date = new Date(body.date);
        }

        const transaction = await transactionService.updateTransaction(
            session.user.id,
            parseInt(transactionId),
            body
        );

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Update Transaction Error", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update transaction' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ transactionId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionId } = await params;

        await transactionService.deleteTransaction(session.user.id, parseInt(transactionId));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
            { status: 500 }
        );
    }
}
