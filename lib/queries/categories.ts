import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/client';
import { categoriesTable } from '@/app/db/schema';

export type Category = typeof categoriesTable.$inferSelect;

export const useGetCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await apiClient.get('/categories');
            return data;
        },
    });
};
