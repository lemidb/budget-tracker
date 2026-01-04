// Types based on your schema
export interface Account {
    id: number;
    userId: number;
    name: string;
    type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT' | 'SAVINGS' | 'OTHER';
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AccountSummary {
    totalBalance: number;
    activeAccounts: number;
    accountTypes: string[];
    recentTransactions: number;
}

export interface AccountsFilters {
    type?: Account['type'];
    isActive?: boolean;
    search?: string;
    minBalance?: number;
    maxBalance?: number;
}