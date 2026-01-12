
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetTransactions = (filters?: any) => {
    return useQuery({
        queryKey: ["transactions", filters],
        queryFn: async () => {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`/api/v1/transactions?${params.toString()}`);
            return response.data;
        },
    });
};
