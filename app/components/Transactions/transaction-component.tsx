
"use client";

import { useState } from "react";
import { useGetTransactions } from "@/lib/queries/transactions";
import { TransactionForm } from "./transaction-form";
import { TransactionFilters } from "./transaction-filters";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit, Trash, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTransaction } from "@/lib/mutations/transactions";
import { cn } from "@/lib/utils";
import DeleteTransaction from "./delete-transaction";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionComponent() {
    const [filters, setFilters] = useState({});
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);

    const { data: transactions, isLoading } = useGetTransactions(filters);
    const deleteMutation = useDeleteTransaction();

    const handleEdit = (transaction: any) => {
        setEditingTransaction(transaction);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this transaction?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const groupedTransactions = transactions?.reduce((groups: any, transaction: any) => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedTransactions || {}).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div className="container flex flex-col flex-1 space-y-7 p-6 md:p-8 pt-8 h-full mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Manage and view your financial activity.</p>
                </div>
                <Button onClick={() => { setEditingTransaction(null); setIsCreateOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
            </div>

            <TransactionFilters onFilterChange={setFilters} />

            <div className="flex-1 rounded-xl border bg-card text-card-foreground shacleardow-sm overflow-hidden">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col gap-3 p-4">
                        <div className="space-y-8">
                            {Array.from({ length: 2 }).map((_, dateIndex) => (
                                <div key={dateIndex} className="space-y-4">
                                    <Skeleton className="h-6 w-48" />

                                    {Array.from({ length: 3 }).map((_, transIndex) => (
                                        <div key={transIndex} className="space-y-4">
                                            <div className="flex items-center gap-4 pl-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="space-y-1 pt-2">
                                                        <Skeleton className="h-5 w-[200px]" />
                                                        <div className="flex items-center gap-2">
                                                            <Skeleton className="h-3 w-28" />
                                                            <Skeleton className="h-1 w-1 rounded-full" />
                                                            <Skeleton className="h-3 w-24" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-6 w-20 ml-auto" />
                                                </div>
                                            </div>

                                            {transIndex === 0 && (
                                                <div className="pl-14">
                                                    <Skeleton className="h-px w-full" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : transactions?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <p>No transactions found.</p>
                        <Button variant="link" onClick={() => { setEditingTransaction(null); setIsCreateOpen(true); }}>
                            Add one now
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y relative">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <div className="bg-muted/50 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground sticky top-0 backdrop-blur-sm z-10">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="divide-y">
                                    {groupedTransactions[date].map((transaction: any) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "flex h-10 w-10 items-center justify-center rounded-full border shadow-sm",
                                                    transaction.type === 'INCOME' && "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900",
                                                    transaction.type === 'EXPENSE' && "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-900",
                                                    transaction.type === 'TRANSFER' && "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900",
                                                )}>
                                                    {transaction.category?.icon ? (
                                                        <span className="text-lg">{transaction.category.icon}</span>
                                                    ) : (
                                                        <>
                                                            {transaction.type === 'INCOME' && <ArrowDownLeft className="h-5 w-5" />}
                                                            {transaction.type === 'EXPENSE' && <ArrowUpRight className="h-5 w-5" />}
                                                            {transaction.type === 'TRANSFER' && <ArrowRightLeft className="h-5 w-5" />}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-medium leading-none">
                                                        {transaction.description || (transaction.category?.name ?? "Uncategorized")}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>{transaction.account?.name}</span>
                                                        {transaction.category && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    {transaction.category.name}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "font-bold tabular-nums",
                                                    transaction.type === 'INCOME' ? "text-emerald-600" : "text-neutral-900 dark:text-neutral-100"
                                                )}>
                                                    {transaction.type === 'INCOME' ? '+' : transaction.type === 'EXPENSE' ? '-' : ''}
                                                    ${parseFloat(transaction.amount).toLocaleString()}
                                                </span>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <Button variant="ghost" className="w-full flex justify-start" onClick={() => handleEdit(transaction)}>
                                                            <Edit className="mr-1 h-4 w-4" /> Edit
                                                        </Button>
                                                        <DeleteTransaction id={transaction.id} onConfirm={handleDelete} isPending={deleteMutation.isPending} />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingTransaction ? "Edit Transaction" : "New Transaction"}</DialogTitle>
                        <DialogDescription>
                            {editingTransaction ? "Modify the details of your transaction." : "Record a new income, expense, or transfer."}
                        </DialogDescription>
                    </DialogHeader>
                    <TransactionForm
                        initialData={editingTransaction}
                        onSuccess={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
