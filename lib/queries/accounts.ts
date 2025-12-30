// /lib/queries/accounts.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/client';

// Types based on your schema
export interface Account {
  id: number;
  userId: number;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT' | 'SAVINGS' | 'OTHER';
  balance: string;
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

/**
 * Query key factories for consistent key management
 */
export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters: AccountsFilters = {}) => [...accountKeys.lists(), { filters }] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
  summary: () => [...accountKeys.all, 'summary'] as const,
  analytics: () => [...accountKeys.all, 'analytics'] as const,
};

/**
 * Fetch all accounts for the current user
 */
export const useAccounts = (filters?: AccountsFilters) => {
  return useQuery({
    queryKey: accountKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.minBalance !== undefined) params.append('minBalance', filters.minBalance.toString());
      if (filters?.maxBalance !== undefined) params.append('maxBalance', filters.maxBalance.toString());
      
      const url = params.toString() ? `/accounts?${params.toString()}` : '/accounts';
      const { data } = await apiClient.get<Account[]>(url);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Fetch a single account by ID
 */
export const useAccount = (accountId: number | null) => {
  return useQuery({
    queryKey: accountKeys.detail(accountId!),
    queryFn: async () => {
      if (!accountId) throw new Error('Account ID is required');
      const { data } = await apiClient.get<Account>(`/accounts/${accountId}`);
      return data;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Fetch account summary (total balance, count, etc.)
 */
export const useAccountSummary = () => {
  return useQuery({
    queryKey: accountKeys.summary(),
    queryFn: async () => {
      const { data } = await apiClient.get<AccountSummary>('/accounts/summary');
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (summary updates frequently)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch accounts by type
 */
export const useAccountsByType = (type: Account['type'] | null) => {
  return useQuery({
    queryKey: accountKeys.list({ type: type! }),
    queryFn: async () => {
      if (!type) return [];
      const { data } = await apiClient.get<Account[]>(`/accounts?type=${type}`);
      return data;
    },
    enabled: !!type,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch active accounts only
 */
export const useActiveAccounts = () => {
  return useQuery({
    queryKey: accountKeys.list({ isActive: true }),
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts?isActive=true');
      return data;
    },
    select: (accounts) => accounts.filter((account: any) => account.isActive),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch accounts with balance above a certain threshold
 */
export const useAccountsWithMinimumBalance = (minBalance: number = 0) => {
  return useQuery({
    queryKey: accountKeys.list({ minBalance }),
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>(`/api/accounts?minBalance=${minBalance}`);
      return data;
    },
    select: (accounts) => accounts.filter((account: any) => parseFloat(account.balance) >= minBalance),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Search accounts by name
 */
export const useSearchAccounts = (searchTerm: string) => {
  return useQuery({
    queryKey: accountKeys.list({ search: searchTerm }),
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const { data } = await apiClient.get<Account[]>(`/api/accounts?search=${encodeURIComponent(searchTerm)}`);
      return data;
    },
    enabled: searchTerm.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch accounts grouped by type
 */
export const useAccountsGroupedByType = () => {
  return useQuery({
    queryKey: [...accountKeys.all, 'grouped'],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts');
      return data;
    },
    select: (accounts) => {
      const grouped: Record<Account['type'], Account[]> = {
        CASH: [],
        BANK: [],
        CREDIT_CARD: [],
        INVESTMENT: [],
        SAVINGS: [],
        OTHER: [],
      };
      
      accounts.forEach(account => {
        grouped[account.type].push(account);
      });
      
      return grouped;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch accounts sorted by balance
 */
export const useAccountsSortedByBalance = (order: 'asc' | 'desc' = 'desc') => {
  return useQuery({
    queryKey: [...accountKeys.all, 'sorted', order],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts');
      return data;
    },
    select: (accounts) => {
      return [...accounts].sort((a, b) => {
        const balanceA = parseFloat(a.balance);
        const balanceB = parseFloat(b.balance);
        return order === 'desc' ? balanceB - balanceA : balanceA - balanceB;
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch total balance across all accounts
 */
export const useTotalBalance = () => {
  return useQuery({
    queryKey: [...accountKeys.all, 'total-balance'],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts');
      return data;
    },
    select: (accounts) => {
      return accounts.reduce((total, account) => {
        return total + parseFloat(account.balance);
      }, 0);
    },
    staleTime: 1000 * 30, // 30 seconds (balance updates frequently)
    gcTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Fetch currency distribution
 */
export const useCurrencyDistribution = () => {
  return useQuery({
    queryKey: [...accountKeys.all, 'currency-distribution'],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts');
      return data;
    },
    select: (accounts) => {
      const distribution: Record<string, { count: number; total: number }> = {};
      
      accounts.forEach(account => {
        if (!distribution[account.currency]) {
          distribution[account.currency] = { count: 0, total: 0 };
        }
        distribution[account.currency].count++;
        distribution[account.currency].total += parseFloat(account.balance);
      });
      
      return distribution;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Fetch recent accounts (created in the last 7 days)
 */
export const useRecentAccounts = (days: number = 7) => {
  return useQuery({
    queryKey: [...accountKeys.all, 'recent', days],
    queryFn: async () => {
      const { data } = await apiClient.get<Account[]>('/api/accounts');
      return data;
    },
    select: (accounts) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return accounts.filter(account => {
        const createdDate = new Date(account.createdAt);
        return createdDate >= cutoffDate;
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Prefetch accounts data (useful for optimistic updates or page transitions)
 */
export const usePrefetchAccounts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: accountKeys.list({}),
      queryFn: async () => {
        const { data } = await apiClient.get<Account[]>('/api/accounts');
        return data;
      },
    });
  };
};

/**
 * Invalidate accounts queries (useful after mutations)
 */
export const useInvalidateAccounts = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
  };
};

/**
 * Get account by ID from cache (synchronous)
 */
export const useGetAccountFromCache = () => {
  const queryClient = useQueryClient();
  
  return (accountId: number) => {
    return queryClient.getQueryData<Account>(accountKeys.detail(accountId));
  };
};

/**
 * Update account in cache optimistically
 */
export const useUpdateAccountInCache = () => {
  const queryClient = useQueryClient();
  
  return (updatedAccount: Partial<Account> & { id: number }) => {
    queryClient.setQueryData<Account[]>(accountKeys.list({}), (oldAccounts) => {
      if (!oldAccounts) return oldAccounts;
      
      return oldAccounts.map(account => 
        account.id === updatedAccount.id 
          ? { ...account, ...updatedAccount }
          : account
      );
    });
    
    queryClient.setQueryData<Account>(accountKeys.detail(updatedAccount.id), (oldAccount) => {
      if (!oldAccount) return oldAccount;
      
      return { ...oldAccount, ...updatedAccount };
    });
  };
};

/**
 * Fetch accounts with combined filters
 */
export const useFilteredAccounts = (filters: AccountsFilters) => {
  return useQuery({
    queryKey: accountKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const url = `/api/accounts?${params.toString()}`;
      const { data } = await apiClient.get<Account[]>(url);
      return data;
    },
    enabled: Object.values(filters).some(value => value !== undefined && value !== ''),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

/**
 * Analytics: Get balance trends over time
 */
export const useAccountBalanceTrend = (accountId: number, period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: [...accountKeys.all, 'trend', accountId, period],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/accounts/${accountId}/trend?period=${period}`);
      return data;
    },
    enabled: !!accountId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Type guard for account type
export const isValidAccountType = (type: string): type is Account['type'] => {
  return ['CASH', 'BANK', 'CREDIT_CARD', 'INVESTMENT', 'SAVINGS', 'OTHER'].includes(type);
};

// Helper to get account type label
export const getAccountTypeLabel = (type: Account['type']): string => {
  const labels: Record<Account['type'], string> = {
    CASH: 'Cash',
    BANK: 'Bank Account',
    CREDIT_CARD: 'Credit Card',
    INVESTMENT: 'Investment',
    SAVINGS: 'Savings',
    OTHER: 'Other',
  };
  return labels[type];
};

// Helper to get account type icon (returns Lucide icon name)
export const getAccountTypeIcon = (type: Account['type']): string => {
  const icons: Record<Account['type'], string> = {
    CASH: 'Wallet',
    BANK: 'Building',
    CREDIT_CARD: 'CreditCard',
    INVESTMENT: 'TrendingUp',
    SAVINGS: 'PiggyBank',
    OTHER: 'Circle',
  };
  return icons[type];
};

// Helper to format balance with currency
export const formatAccountBalance = (account: Account): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(account.balance));
};

// Helper to check if account is empty (zero balance)
export const isAccountEmpty = (account: Account): boolean => {
  return parseFloat(account.balance) === 0;
};

// Helper to check if account is negative (for credit cards)
export const isAccountNegative = (account: Account): boolean => {
  return parseFloat(account.balance) < 0;
};