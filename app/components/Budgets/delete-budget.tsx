
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useDeleteBudget } from "@/lib/mutations/budgets";
import { useState } from "react";

interface DeleteBudgetProps {
    id: number;
}

export default function DeleteBudget({ id }: DeleteBudgetProps) {
    const deleteBudgetMutation = useDeleteBudget();

    const handleDelete = async () => {
        try {
            await deleteBudgetMutation.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete budget", error);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:text-red-500">
                    <Trash2 size={24} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        budget.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="hover:text-red-900 hover:bg-red-500 w-22 "
                        onClick={handleDelete}
                        disabled={deleteBudgetMutation.isPending}
                    >
                        Yes
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
}
