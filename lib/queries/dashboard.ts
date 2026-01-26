import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetDashboardData = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const response = await axios.get("/api/v1/dashboard");
            return response.data;
        },
    });
};
