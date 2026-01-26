import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/lib/services/dashboard.service';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await dashboardService.getDashboardData(Number(session.user.id));
        return NextResponse.json(data);
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
