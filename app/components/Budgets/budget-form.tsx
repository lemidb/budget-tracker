
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useGetCategories } from "@/lib/queries/categories";

export const budgetSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number",
    }),
    period: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME"]),
    startDate: z.date(),
    endDate: z.date().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
    defaultValues?: Partial<BudgetFormValues>;
    onSubmit: (values: BudgetFormValues) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitType?: string;
}

export function BudgetForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
    submitType = "Save Budget",
}: BudgetFormProps) {
    const { data: categories } = useGetCategories();

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            categoryId: defaultValues?.categoryId || "",
            amount: defaultValues?.amount || "",
            period: defaultValues?.period || "MONTHLY",
            startDate: defaultValues?.startDate || new Date(),
            endDate: defaultValues?.endDate,
        },
    });

    let submitLabel = submitType == "Save Budget" ? isSubmitting ? "...Saving budget" : "Save Budget" : isSubmitting ? "...Updating budget" : "Update Budget";


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 space-x-2 pt-4">
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
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

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem className="flex-1">
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
                            <FormItem className="flex-1">
                                <FormLabel>Period</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-[240px]">
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

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const normalized = new Date(
                                                            Date.UTC(
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate()
                                                            )
                                                        );
                                                        field.onChange(normalized);
                                                    }
                                                }}
                                                disabled={(date) => date < new Date("1900-01-01")}
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>End Date (Opt)</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const normalized = new Date(
                                                            Date.UTC(
                                                                date.getFullYear(),
                                                                date.getMonth(),
                                                                date.getDate()
                                                            )
                                                        );
                                                        field.onChange(normalized);
                                                    } else {
                                                        field.onChange(undefined);
                                                    }
                                                }}
                                                disabled={(date) => date < new Date("1900-01-01")}
                                                captionLayout="dropdown"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className={`${isSubmitting ? "animate-pulse" : ""}`}>
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

