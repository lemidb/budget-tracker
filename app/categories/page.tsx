"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Input } from "@/components/ui/input";
import { useGetCategories, Category } from "@/lib/queries/categories";
import { useDeleteCategory } from "@/lib/mutations/categories";
import { CategoryForm } from "@/app/components/Categories/category-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
    const { data: categories, isLoading } = useGetCategories();
    const deleteCategoryMutation = useDeleteCategory();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDelete = async () => {
        if (deletingId) {
            await deleteCategoryMutation.mutateAsync(deletingId);
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full lg:max-w-5xl flex-col gap-6 p-6 md:p-8 overflow-y-auto mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Categories</h1>
                    <p className="text-muted-foreground">Manage your budget categories</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories..."
                    className="pl-8 max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 space-y-2">
                {filteredCategories.map((category) => (
                    <div
                        key={category.id}
                        className="group relative flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-200"
                        style={{ borderLeftColor: category.color || 'transparent', borderLeftWidth: '4px' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-xl">
                                {category.icon || "📂"}
                            </div>
                            <div>
                                <h3 className="font-semibold">{category.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {category.isExpense ? "Expense" : "Income"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingCategory(category)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeletingId(category.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                        <div className="text-4xl mb-2">🏷️</div>
                        <h3 className="font-semibold text-lg">No categories found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mt-1">
                            {searchQuery ? "Try searching for something else" : "Create your first category to get started"}
                        </p>
                        {!searchQuery && (
                            <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="mt-4">
                                Create Category
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm onClose={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                    </DialogHeader>
                    {editingCategory && (
                        <CategoryForm
                            category={editingCategory}
                            onClose={() => setEditingCategory(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this category
                            and may affect budgets or transactions associated with it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
