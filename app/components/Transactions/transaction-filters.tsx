
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useAccountsQuery } from "@/lib/queries/accounts";
import { useGetCategories } from "@/lib/queries/categories";
import { useState } from "react";

interface FilterProps {
    onFilterChange: (filters: any) => void;
}

export function TransactionFilters({ onFilterChange }: FilterProps) {
    const { data: accounts } = useAccountsQuery();
    const { data: categories } = useGetCategories();

    // We can store local state for filters if we want "Apply" button, 
    // or just trigger onChange immediately.
    // For "sleek" feels, immediate is nice but can be spammy.
    // Let's use local state and effect, or just controlled inputs.

    const [filters, setFilters] = useState({
        search: "",
        type: "all",
        accountId: "all",
        categoryId: "all",
    });

    const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Convert to API format
        const apiFilters: any = {};
        if (newFilters.search) apiFilters.search = newFilters.search;
        if (newFilters.type !== "all") apiFilters.type = newFilters.type;
        if (newFilters.accountId !== "all") apiFilters.accountId = newFilters.accountId;
        if (newFilters.categoryId !== "all") apiFilters.categoryId = newFilters.categoryId;

        onFilterChange(apiFilters);
    };

    const clearFilters = () => {
        const reset = {
            search: "",
            type: "all",
            accountId: "all",
            categoryId: "all",
        };
        setFilters(reset);
        onFilterChange({});
    };

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder="Search transactions..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => handleChange("search", e.target.value)}
                />
            </div>

            <Select value={filters.type} onValueChange={(val) => handleChange("type", val)}>
                <SelectTrigger className="w-full md:w-[130px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
            </Select>

            <Select value={filters.accountId} onValueChange={(val) => handleChange("accountId", val)}>
                <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {accounts?.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filters.categoryId} onValueChange={(val) => handleChange("categoryId", val)}>
                <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}> {cat.icon} {cat.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(filters.search || filters.type !== "all" || filters.accountId !== "all" || filters.categoryId !== "all") && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
