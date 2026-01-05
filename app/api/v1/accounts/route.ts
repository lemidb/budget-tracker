import { NextRequest, NextResponse } from 'next/server';
import { accountService } from '@/lib/services/account.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// Middleware handles authentication, so we can safely assume user is authenticated
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    // Session is guaranteed by middleware, but TypeScript needs the check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const accounts = await accountService.getAccounts(session.user.id);
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    // Session is guaranteed by middleware, but TypeScript needs the check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const account = await accountService.createAccount(session.user.id, body);
    
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}