// /app/accounts/page.tsx
"use client";

import { useState } from "react";
import { useAccounts, useAccount } from "@/lib/queries/accounts";
import { useCreateAccount, useUpdateAccount, useDeleteAccount } from "@/lib/mutations/accounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, CreditCard, Wallet, Building, TrendingUp, PiggyBank, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountForm } from "@/app/components/accounts/AccountForm";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const ACCOUNT_TYPE_CONFIG = {
  CASH: { 
    label: "Cash", 
    icon: Wallet, 
    color: "bg-green-100 text-green-800 border-green-200",
    bgColor: "bg-green-50"
  },
  BANK: { 
    label: "Bank Account", 
    icon: Building, 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    bgColor: "bg-blue-50"
  },
  CREDIT_CARD: { 
    label: "Credit Card", 
    icon: CreditCard, 
    color: "bg-red-100 text-red-800 border-red-200",
    bgColor: "bg-red-50"
  },
  INVESTMENT: { 
    label: "Investment", 
    icon: TrendingUp, 
    color: "bg-purple-100 text-purple-800 border-purple-200",
    bgColor: "bg-purple-50"
  },
  SAVINGS: { 
    label: "Savings", 
    icon: PiggyBank, 
    color: "bg-amber-100 text-amber-800 border-amber-200",
    bgColor: "bg-amber-50"
  },
  OTHER: { 
    label: "Other", 
    icon: MoreHorizontal, 
    color: "bg-gray-100 text-gray-800 border-gray-200",
    bgColor: "bg-gray-50"
  },
};

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const [showHidden, setShowHidden] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (accountId: number) => {
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      try {
        await deleteAccount.mutateAsync(accountId);
        toast.success("Account deleted successfully");
      } catch (error) {
        toast.error("Failed to delete account");
      }
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const filteredAccounts = accounts?.filter(account => 
    showHidden ? true : account.isActive !== false
  );

  const totalBalance = accounts?.reduce((sum, account) => {
    return sum + parseFloat(account.balance || "0");
  }, 0) || 0;

  const activeAccounts = accounts?.filter(account => account.isActive !== false).length || 0;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Failed to load accounts. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 md:px-28 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts and track balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
            className="gap-2"
          >
            {showHidden ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Inactive
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Inactive
              </>
            )}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[95vh] flex flex-col overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
                <DialogDescription>
                  Add a new account to track your finances
                </DialogDescription>
              </DialogHeader>
              <AccountForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  toast.success("Account created successfully");
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalBalance, "USD")}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAccounts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Account Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(accounts?.map(acc => acc.type)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredAccounts?.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {showHidden 
                      ? "You don't have any accounts yet"
                      : "All your accounts are active"}
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredAccounts?.map((account) => {
            const config = ACCOUNT_TYPE_CONFIG[account.type as keyof typeof ACCOUNT_TYPE_CONFIG];
            const Icon = config.icon;
            
            return (
              <Card 
                key={account.id} 
                className={`overflow-hidden transition-all hover:shadow-md ${!account.isActive ? 'opacity-70' : ''}`}
              >
                <div className={`h-2 ${config.bgColor}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {account.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {!account.isActive && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            Inactive
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Account
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(account.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(parseFloat(account.balance), account.currency)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="text-muted-foreground">
                        Currency: <span className="font-medium">{account.currency}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Updated:{" "}
                        {new Date(account.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] h-[90vh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update account details
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              mode="edit"
              account={editingAccount}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(null);
                toast.success("Account updated successfully");
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}