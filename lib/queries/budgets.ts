import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/client';

export const useGetBudgets = () => {
    return useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            const { data } = await apiClient.get('/budgets');
            return data;
        },
    });
};
