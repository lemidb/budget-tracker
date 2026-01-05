import { accountService } from "@/lib/services/account.service";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; 


export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const accounts = await accountService.getAccounts(session.user.id);
    const summary = {
      totalBalance: accounts.reduce(
        (sum, acc) => sum + parseFloat(acc.balance),
        0
      ),
      activeAccounts: accounts.filter((acc) => acc.isActive).length,
      accountTypes: [...new Set(accounts.map((acc) => acc.type))],
    };
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch account summary",
      },
      { status: 500 }
    );
  }
}
