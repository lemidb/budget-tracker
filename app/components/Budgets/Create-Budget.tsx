
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateBudget } from "@/lib/mutations/budgets";
import { BudgetForm, BudgetFormValues } from "./budget-form";

export default function CreateBudget() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const createBudgetMutation = useCreateBudget();

    const onSubmit = async (data: BudgetFormValues) => {
        try {
            const payload = {
                categoryId: parseInt(data.categoryId),
                amount: parseFloat(data.amount),
                period: data.period,
                startDate: new Date(data.startDate).toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
            };
            await createBudgetMutation.mutateAsync(payload);
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Failed to create budget", error);
        }
    };

    return (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Budget
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full min-w-[360px] sm:min-w-xl max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create New Budget</DialogTitle>
                    <DialogDescription>
                        Set spending limits for your categories to stay on track.
                    </DialogDescription>
                </DialogHeader>
                <BudgetForm
                    onSubmit={onSubmit}
                    onCancel={() => setIsCreateOpen(false)}
                    isSubmitting={createBudgetMutation.isPending}
                    submitType="Create Budget"
                />
            </DialogContent>
        </Dialog>
    );
}