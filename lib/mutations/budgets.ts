import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/client';
import { toast } from 'sonner';

export const useCreateBudget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (budgetData: any) => {
            const { data } = await apiClient.post('/budgets', budgetData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success("Budget created successfully");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error;
            toast.error(typeof errorMessage === "string" ? errorMessage : "Failed to create budget");
        }
    });
};

export const useUpdateBudget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: number } & any) => {
            const { data: response } = await apiClient.put(`/budgets/${id}`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success("Budget updated successfully");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error;
            toast.error(typeof errorMessage === "string" ? errorMessage : "Failed to update budget");
        }
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (budgetId: number) => {
            const { data } = await apiClient.delete(`/budgets/${budgetId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success("Budget deleted successfully");
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error;
            toast.error(typeof errorMessage === "string" ? errorMessage : "Failed to delete budget");
        }
    });
};
