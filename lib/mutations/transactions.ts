
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export const useCreateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await axios.post("/api/v1/transactions", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] }); // Update account balances
            toast.success("Transaction created successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to create transaction");
        },
    });
};

export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }: { id: number } & any) => {
            const response = await axios.patch(`/api/v1/transactions/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Transaction updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to update transaction");
        },
    });
};

export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/api/v1/transactions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["accounts"] });
            toast.success("Transaction deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to delete transaction");
        },
    });
};
