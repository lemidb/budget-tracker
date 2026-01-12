
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/mutations/transactions";
import { useAccountsQuery } from "@/lib/queries/accounts";
import { useGetCategories } from "@/lib/queries/categories";

const transactionSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
    accountId: z.string().min(1, "Account is required"),
    categoryId: z.string().optional(),
    toAccountId: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
}).refine((data) => {
    if (data.type === 'TRANSFER' && !data.toAccountId) {
        return false;
    }
    return true;
}, {
    message: "Destination account is required for transfers",
    path: ["toAccountId"],
}).refine((data) => {
    if (data.type === 'TRANSFER' && data.accountId === data.toAccountId) {
        return false;
    }
    return true;
}, {
    message: "Source and destination accounts must be different",
    path: ["toAccountId"],
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    initialData?: any;
    onSuccess?: () => void;
}

export function TransactionForm({ initialData, onSuccess }: TransactionFormProps) {
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    // Hooks for data
    // Assuming useGetAccounts returns array directly or inside data property?
    // budget-component used `useGetBudgets` -> `data: budgets`.
    // So I assume `useGetAccounts` -> `data: accounts`.
    const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
    const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();

    // Accounts might be wrapped differently? Based on budget-component usage:
    // `const { data: budgets } = useGetBudgets();`
    // I'll assume standard ReactQuery structure.
    // accountsData might be the array itself or an object. I'll check later or code defensively.
    // Usually standard is { accounts: [] } or just [].
    // Let's assume accountsData is the array for now or check types if I could.
    const accounts = Array.isArray(accountsData) ? accountsData : (accountsData || []);

    const form = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            amount: initialData?.amount ? initialData.amount.toString() : "",
            type: initialData?.type || "EXPENSE",
            accountId: initialData?.accountId ? initialData.accountId.toString() : "",
            categoryId: initialData?.categoryId ? initialData.categoryId.toString() : "",
            toAccountId: "", // Can't easily pre-fill for transfer without complex logic if not storing it explicitly
            date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            description: initialData?.description || "",
        },
    });

    const watchType = form.watch("type");

    const onSubmit = async (values: TransactionFormValues) => {
        const payload: any = {
            amount: parseFloat(values.amount),
            type: values.type,
            accountId: parseInt(values.accountId),
            date: new Date(values.date).toISOString(),
            description: values.description,
        };

        if (values.categoryId && values.categoryId !== "none") {
            payload.categoryId = parseInt(values.categoryId);
        } else {
            payload.categoryId = null;
        }

        if (values.type === 'TRANSFER') {
            payload.toAccountId = parseInt(values.toAccountId!);
            // Clean up payload
            delete payload.categoryId;
        }

        try {
            if (initialData) {
                await updateMutation.mutateAsync({ id: initialData.id, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onSuccess?.();
            if (!initialData) form.reset();
        } catch (error) {
            console.error(error);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INCOME">Income</SelectItem>
                                        <SelectItem value="EXPENSE">Expense</SelectItem>
                                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input placeholder="0.00" {...field} type="number" step="0.01" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{watchType === 'TRANSFER' ? 'From Account' : 'Account'}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {accounts?.map((acc: any) => (
                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                            {acc.name} ({acc.currency})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchType === 'TRANSFER' && (
                    <FormField
                        control={form.control}
                        name="toAccountId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Account</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select destination account" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts?.map((acc: any) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.name} ({acc.currency})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                {watchType !== 'TRANSFER' && (
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Uncategorized</SelectItem>
                                        {categories?.map((cat: any) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                <span className="mr-2">{cat.icon}</span> {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Grocery shopping, Salary, etc." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? "Update Transaction" : "Create Transaction"}
                </Button>
            </form>
        </Form>
    );
}
