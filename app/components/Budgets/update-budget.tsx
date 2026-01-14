
import { useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateBudget } from "@/lib/mutations/budgets";
import { BudgetForm, BudgetFormValues } from "./budget-form";

interface UpdateBudgetProps {
    budget: any;
}

export default function UpdateBudget({ budget }: UpdateBudgetProps) {
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const updateBudgetMutation = useUpdateBudget();

    const onSubmit = async (data: BudgetFormValues) => {
        try {
            const payload = {
                categoryId: parseInt(data.categoryId),
                amount: parseFloat(data.amount),
                period: data.period,
                startDate: new Date(data.startDate).toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
            };
            await updateBudgetMutation.mutateAsync({ id: budget.id, ...payload });
            setIsUpdateOpen(false);
        } catch (error) {
            console.error("Failed to update budget", error);
        }
    };

    return (
        <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4 text-neutral-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full min-w-[360px] sm:min-w-xl max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Update Budget</DialogTitle>
                    <DialogDescription>
                        Modify your budget settings for this category.
                    </DialogDescription>
                </DialogHeader>
                <BudgetForm
                    defaultValues={{
                        categoryId: budget.category.id.toString(),
                        amount: budget.amount.toString(),
                        period: budget.period,
                        startDate: new Date(budget.startDate),
                        endDate: budget.endDate ? new Date(budget.endDate) : undefined,
                    }}
                    onSubmit={onSubmit}
                    onCancel={() => setIsUpdateOpen(false)}
                    isSubmitting={updateBudgetMutation.isPending}
                    submitType="Update Budget"
                />
            </DialogContent>
        </Dialog>
    );
}
