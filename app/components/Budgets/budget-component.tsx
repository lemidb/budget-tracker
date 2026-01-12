"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBudgets } from "@/lib/queries/budgets";
import { useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/lib/mutations/budgets";
import { useGetCategories } from "@/lib/queries/categories";
import { toast } from "sonner";

// Schema for budget form
const budgetSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    period: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function BudgetComponent() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<any>(null);

    const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgets();
    const { data: categories, isLoading: isCategoriesLoading } = useGetCategories(); // Fetch expense categories

    const createBudgetMutation = useCreateBudget();
    const updateBudgetMutation = useUpdateBudget();
    const deleteBudgetMutation = useDeleteBudget();

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            categoryId: "",
            amount: "",
            period: "MONTHLY",
            startDate: new Date().toISOString().split("T")[0],
        },
    });

    const onSubmit = async (data: BudgetFormValues) => {
        try {
            const payload = {
                categoryId: parseInt(data.categoryId),
                amount: parseFloat(data.amount),
                period: data.period,
                startDate: new Date(data.startDate).toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
            };

            if (editingBudget) {
                await updateBudgetMutation.mutateAsync({ id: editingBudget.id, ...payload });
                setEditingBudget(null);
            } else {
                await createBudgetMutation.mutateAsync(payload);
            }
            setIsCreateOpen(false);
            form.reset();
        } catch (error) {
            console.error("Failed to submit budget", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this budget?")) {
            await deleteBudgetMutation.mutateAsync(id);
        }
    };

    const openEdit = (budget: any) => {
        setEditingBudget(budget);
        form.reset({
            categoryId: budget.category.id.toString(),
            amount: budget.amount.toString(),
            period: budget.period,
            startDate: new Date(budget.startDate).toISOString().split("T")[0],
            endDate: budget.endDate ? new Date(budget.endDate).toISOString().split("T")[0] : undefined,
        });
        setIsCreateOpen(true);
    };

    if (isBudgetsLoading || isCategoriesLoading) {
        return <div className="flex h-full w-full items-center justify-center p-8 text-neutral-500">Loading budgets...</div>;
    }

    return (
        <div className="flex h-full w-full lg:max-w-5xl flex-col gap-6 p-6 md:p-8 overflow-y-auto mx-auto">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Budgets</h1>
                    <p className="text-muted-foreground text-sm">Track your spending and save more.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingBudget(null);
                        form.reset({
                            amount: "",
                            period: "MONTHLY",
                            startDate: new Date().toISOString().split("T")[0],
                        });
                        setIsCreateOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create Budget
                </Button>
            </div>

            {budgets?.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 py-20 dark:border-neutral-700 dark:bg-neutral-900/50">
                    <div className="bg-neutral-100 p-4 rounded-full dark:bg-neutral-800 mb-4">
                        <Wallet className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No budgets yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm text-center mt-2 mb-6">
                        Create a budget to start tracking your expenses for specific categories.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setEditingBudget(null);
                            form.reset({
                                amount: "",
                                period: "MONTHLY",
                                startDate: new Date().toISOString().split("T")[0],
                            });
                            setIsCreateOpen(true);
                        }}
                    >
                        Create your first budget
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {budgets?.map((budget: any) => {
                        // Calculate progress stats
                        const spent = Number(budget.spent || 0);
                        const total = Number(budget.amount);
                        const percentage = Math.min(Math.round((spent / total) * 100), 100);
                        const remaining = total - spent;
                        const isOverBudget = spent > total;

                        // Determine colors based on internal logic (Green -> Yellow -> Red)
                        let progressColor = "bg-emerald-500";
                        let statusIcon = <CheckCircle2 className="h-4 w-4 text-emerald-500" />;

                        if (percentage >= 80 && percentage < 100) {
                            progressColor = "bg-amber-500";
                            statusIcon = <AlertCircle className="h-4 w-4 text-amber-500" />;
                        } else if (percentage >= 100) {
                            progressColor = "bg-rose-500";
                            statusIcon = <AlertCircle className="h-4 w-4 text-rose-500" />;
                        }

                        return (
                            <Card key={budget.id} className="group relative overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                            <span className="text-xl" role="img" aria-label={budget.category.name}>
                                                {budget.category.icon || "💰"}
                                            </span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold">{budget.category.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{budget.period}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(budget)}>
                                            <Pencil className="h-4 w-4 text-neutral-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(budget.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex items-end justify-between mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Spent</span>
                                            <span className={cn("text-lg font-bold", isOverBudget ? "text-rose-600" : "text-neutral-900 dark:text-neutral-100")}>
                                                ${spent.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground">Limit</span>
                                            <span className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                                                ${total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Custom Progress Bar */}
                                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            className={cn("h-full w-full flex-1 transition-all", progressColor)}
                                            style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
                                        />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            {statusIcon}
                                            <span className={isOverBudget ? "text-rose-600" : "text-neutral-600 dark:text-neutral-400"}>
                                                {isOverBudget ? "Over Budget" : `${percentage}% Used`}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            ${remaining > 0 ? remaining.toLocaleString() : 0} left
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Budget Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingBudget ? "Edit Budget" : "Create New Budget"}</DialogTitle>
                        <DialogDescription>
                            Set spending limits for your categories to stay on track.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="period"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Period</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date (Opt)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}>
                                    {editingBudget ? "Save Changes" : "Create Budget"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}