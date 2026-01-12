
import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/lib/services/transaction.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filters = {
            accountId: searchParams.get('accountId') ? parseInt(searchParams.get('accountId')!) : undefined,
            categoryId: searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined,
            type: searchParams.get('type') || undefined,
            startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
            endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
            search: searchParams.get('search') || undefined,
        };

        const transactions = await transactionService.getTransactions(session.user.id, filters);
        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.accountId || !body.type || !body.amount || !body.date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await transactionService.createTransaction(session.user.id, {
            ...body,
            date: new Date(body.date),
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create transaction' },
            { status: 500 }
        );
    }
}
