
"use client";

import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetBudgets } from "@/lib/queries/budgets";
import CreateBudget from "./Create-Budget";
import UpdateBudget from "./update-budget";
import DeleteBudget from "./delete-budget";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetComponent() {
    const { data: budgets, isLoading: isBudgetsLoading } = useGetBudgets();

    if (isBudgetsLoading) {
        return (
            <div className="container mx-auto flex h-full w-full flex-1 space-y-4 pt-6 flex-col gap-6 p-6 md:p-8 overflow-y-auto">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-3 w-44 mt-2" />
                    </div>
                    <div>
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>
                <BudgetCardsSkeleton />
            </div>
        );
    }

    return (
        <div className="container mx-auto flex h-full w-full max-w-7xl flex-1 space-y-4 pt-6 flex-col gap-6 p-6 md:p-8 overflow-y-auto">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Budgets</h1>
                    <p className="text-muted-foreground text-sm">Track your spending and save more.</p>
                </div>
                <div className="flex gap-2">
                    <CreateBudget />
                </div>
            </div>

            {!budgets || budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 py-20 dark:border-neutral-700 dark:bg-neutral-900/50">
                    <div className="bg-neutral-100 p-4 rounded-full dark:bg-neutral-800 mb-4">
                        <Wallet className="h-10 w-10 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No budgets yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm text-center mt-2 mb-6">
                        Create a budget to start tracking your expenses for specific categories.
                    </p>
                    <CreateBudget />
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {budgets.map((budget: any) => {
                        const spent = Number(budget.spent || 0);
                        const total = Number(budget.amount);
                        const percentage = Math.min(Math.round((spent / total) * 100), 100);
                        const remaining = total - spent;
                        const isOverBudget = spent > total;

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
                                        <UpdateBudget budget={budget} />
                                        <DeleteBudget id={budget.id} />
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
        </div>
    );
}



export function BudgetCardsSkeleton() {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 flex-wrap">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="min-h-[220px] sm:min-w-[475px] rounded-xl border bg-card shadow-sm overflow-hidden"
                >
                    {/* Card header with category and frequency */}
                    <div className="p-6 pb-4 border-b flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>

                    {/* Card body with metrics */}
                    <div className="p-6 space-y-4">


                        {/* Spent and Limit row */}
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-5 w-16" />
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                            <Skeleton className="h-4 w-full rounded-full" />
                        </div>

                        {/* Remaining amount */}
                        <div className=" flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-18" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}