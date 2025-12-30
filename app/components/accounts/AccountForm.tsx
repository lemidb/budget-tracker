"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  CreditCard,
  Wallet,
  Building,
  TrendingUp,
  PiggyBank,
  MoreHorizontal,
} from "lucide-react";
import { useCreateAccount, useUpdateAccount } from "@/lib/mutations/accounts";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const accountTypeOptions = [
  { value: "CASH", label: "Cash", icon: Wallet, color: "text-green-600" },
  {
    value: "BANK",
    label: "Bank Account",
    icon: Building,
    color: "text-blue-600",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
    icon: CreditCard,
    color: "text-red-600",
  },
  {
    value: "INVESTMENT",
    label: "Investment",
    icon: TrendingUp,
    color: "text-purple-600",
  },
  {
    value: "SAVINGS",
    label: "Savings",
    icon: PiggyBank,
    color: "text-amber-600",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: MoreHorizontal,
    color: "text-gray-600",
  },
];

const currencyOptions = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar ($)" },
  { value: "AUD", label: "Australian Dollar ($)" },
];

const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Account name is required")
    .max(100, "Name is too long"),
  type: z.enum([
    "CASH",
    "BANK",
    "CREDIT_CARD",
    "INVESTMENT",
    "SAVINGS",
    "OTHER",
  ]),
  Balance: z
    .string()
    .regex(/^-?\d+(\.\d{1,2})?$/, "Enter a valid amount")
    .default("0.00"),
  currency: z.string().length(3, "Select a valid currency").default("USD"),
});

const updateAccountSchema = createAccountSchema
  .extend({
    isActive: z.boolean().default(true),
  })
  .omit({ Balance: true });

type AccountFormData = z.infer<typeof createAccountSchema>;
type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

interface AccountFormProps {
  mode?: "create" | "edit";
  account?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountForm({
  mode = "create",
  account,
  onSuccess,
  onCancel,
}: AccountFormProps) {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormData | UpdateAccountFormData>({
    resolver: zodResolver(
      mode === "create" ? createAccountSchema : updateAccountSchema
    ) as any,
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          currency: account.currency,
          isActive: account.isActive !== false,
        }
      : {
          name: "",
          type: "BANK",
          Balance: "0.00",
          currency: "USD",
        },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Align payload with accountsTable schema
      const payload = {
        name: data.name,
        type: data.type,
        currency: data.currency,
        isActive: data.isActive ?? true,
        ...(mode === "create" && {
          balance: parseFloat(data.initialBalance || "0").toFixed(2),
        }),
      };

      if (mode === "create") {
        await createAccount.mutateAsync(payload);
      } else {
        await updateAccount.mutateAsync({
          id: account.id,
          ...payload,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = form.watch("type");
  const selectedTypeConfig = accountTypeOptions.find(
    (opt) => opt.value === selectedType
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Type Selection Cards */}
        <div>
          <FormLabel className="text-base">Account Type</FormLabel>
          <FormDescription className="mb-4">
            Select the type of account you're adding
          </FormDescription>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {accountTypeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setValue("type", option.value as any)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full mb-2 transition-colors",
                      isSelected ? "bg-primary/10" : "bg-accent"
                    )}
                  >
                    <Icon className={cn("h-6 w-6", option.color)} />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <FormMessage />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Chase Checking, Cash Wallet, Amazon Card"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Give your account a recognizable name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Balance</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </div>
                    <Input
                      type="text"
                      className="pl-8"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => {
                        // Allow only numbers and one decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = value.split(".");
                        if (parts.length > 2) return;
                        if (parts[1]?.length > 2) return;
                        field.onChange(value || "0.00");
                      }}
                    />
                  </div>
                </FormControl>
                <FormDescription>Balance on this account</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "edit" && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                    <div className="space-y-0.5 w-full">
                      <FormLabel className="text-base">
                        Active Account
                      </FormLabel>
                      <FormDescription>
                        {/* Active accounts appear in your dashboard */}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Preview Card */}
        <Card className="border-dashed">
          <CardContent className="pt-6 ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedTypeConfig && (
                  <div className={`p-2 rounded-lg bg-primary/10`}>
                    <selectedTypeConfig.icon
                      className={`h-5 w-5 ${selectedTypeConfig.color}`}
                    />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">
                    {form.watch("name") || "Account Name"}
                  </h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedTypeConfig?.label.toLowerCase()} account
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Currency</div>
                <div className="font-medium">{form.watch("currency")}</div>
              </div>
            </div>
            {mode === "create" && (
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Starting Balance
                </div>
                <div className="text-2xl font-bold">
                  ${parseFloat(form.watch("Balance") || "0").toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>{mode === "create" ? "Create Account" : "Update Account"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
