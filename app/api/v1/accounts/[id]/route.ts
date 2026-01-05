import { NextRequest, NextResponse } from 'next/server';
import { accountService } from '@/lib/services/account.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic'; 

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Session is guaranteed by middleware, but TypeScript needs the check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const account = await accountService.updateAccount(
      session.user.id,
      accountId,
      body
    );

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update account' },
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
    // Session is guaranteed by middleware, but TypeScript needs the check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await accountService.deleteAccount(
      session.user.id,
      accountId
    );

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Session is guaranteed by middleware, but TypeScript needs the check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id, 10);
    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await accountService.getAccountById(
      session.user.id,
      accountId
    );

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

