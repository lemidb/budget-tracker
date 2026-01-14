"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Category, useGetCategories } from "@/lib/queries/categories";
import { useDeleteCategory } from "@/lib/mutations/categories";
import { CategoryForm } from "@/app/components/Categories/category-form";
import { formatCustomDate } from "@/lib/utils";

export default function BudgetCategoryPage() {
    const { data: categories, isLoading } = useGetCategories();
    const deleteCategory = useDeleteCategory();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsCreateOpen(true);
    };

    const handleDelete = (category: Category) => {
        setCategoryToDelete(category);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete.id);
            setCategoryToDelete(null);
        }
    };

    const handleCloseDialog = () => {
        setIsCreateOpen(false);
        setEditingCategory(undefined);
    };

    if (isLoading) {
        return (
            <div className="p-6 container mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-40 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full container flex flex-col h-full space-y-6 mx-auto max-w-7xl p-6 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your income and expense categories
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    if (!open) handleCloseDialog();
                    else setIsCreateOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                            <Plus className="h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? "Edit Category" : "Create Category"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? "Make changes to your category here."
                                    : "Add a new category to organize your budget."}
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm
                            category={editingCategory}
                            onClose={handleCloseDialog}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories?.map((category) => (
                    <Card key={category.id} className="group hover:shadow-md transition-all duration-300 border-l-4" style={{ borderLeftColor: category.color || 'transparent' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Badge
                                    variant={category.isExpense ? "destructive" : "default"}
                                    className={`bg-opacity-10 text-opacity-100 px-2 py-1 ${category.isExpense
                                        ? "bg-red-500 text-white hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-500"
                                        : "bg-emerald-500 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-600"
                                        }`}
                                >
                                    {category.isExpense ? (
                                        <span className="flex items-center gap-1">
                                            <TrendingDown className="h-3 w-3" /> Expense
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" /> Income
                                        </span>
                                    )}
                                </Badge>
                            </CardTitle>
                            <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-muted"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                                    onClick={() => handleDelete(category)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 py-4">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm"
                                    style={{
                                        backgroundColor: category.color ? `${category.color}15` : '#f3f4f6',
                                    }}
                                >
                                    {category.icon || <Wallet className="h-6 w-6 text-muted-foreground" />}
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{category.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Created {formatCustomDate(category.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Empty State */}
                {categories?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30">
                        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Wallet className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">No categories yet</h3>
                        <p className="text-muted-foreground text-center max-w-sm mt-2 mb-6">
                            Create your first category to start organizing your transactions and budgets.
                        </p>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    </div>
                )}
            </div>

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            <span className="font-semibold text-foreground"> "{categoryToDelete?.name}" </span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
