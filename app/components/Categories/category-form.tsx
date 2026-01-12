"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { useCreateCategory, useUpdateCategory } from "@/lib/mutations/categories";
import { Category } from "@/lib/queries/categories";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const CATEGORY_COLORS = [
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Yellow", value: "#eab308" },
    { name: "Lime", value: "#84cc16" },
    { name: "Green", value: "#22c55e" },
    { name: "Emerald", value: "#10b981" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Sky", value: "#0ea5e9" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Purple", value: "#a855f7" },
    { name: "Fuchsia", value: "#d946ef" },
    { name: "Pink", value: "#ec4899" },
    { name: "Rose", value: "#f43f5e" },
    { name: "Slate", value: "#64748b" },
];

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().optional(),
    color: z.string().optional(),
    isExpense: z.boolean(),
});

interface CategoryFormProps {
    category?: Category;
    onClose: () => void;
}

export const CategoryForm = ({ category, onClose }: CategoryFormProps) => {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category?.name || "",
            icon: category?.icon || "💰",
            color: category?.color || "#3b82f6",
            isExpense: category?.isExpense ?? true,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (category) {
            updateCategory.mutate(
                { id: category.id, data: values },
                { onSuccess: onClose }
            );
        } else {
            createCategory.mutate(values, { onSuccess: onClose });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem className="col-span-1">
                                <FormLabel>Icon</FormLabel>
                                <FormControl>
                                    <Input
                                        className="w-full h-10 text-center text-2xl p-0"
                                        placeholder="💰"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-3">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Category Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="isExpense"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value === "true")}
                                defaultValue={field.value ? "true" : "false"}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="true">Expense</SelectItem>
                                    <SelectItem value="false">Income</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                                {CATEGORY_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${field.value === color.value ? "ring-2 ring-offset-2 ring-black scale-110" : ""
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        onClick={() => field.onChange(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {category ? "Update Category" : "Create Category"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
