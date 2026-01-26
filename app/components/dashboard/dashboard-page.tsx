"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { Wallet, Target, ArrowUpRight, ArrowDownLeft } from "lucide-react"

import { useGetDashboardData } from "@/lib/queries/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.payload.fill || entry.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: entry.payload.fill || entry.color }}>
                            {entry.name}:
                        </span>
                        <span className="text-sm font-bold text-card-foreground">
                            ${entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export default function DashboardPage() {
    const { data, isLoading, error } = useGetDashboardData()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-24" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <Skeleton className="lg:col-span-2 h-[400px]" />
                        <Skeleton className="h-[400px]" />
                    </div>
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
                        <CardDescription>
                            {error instanceof Error ? error.message : "An unexpected error occurred while fetching dashboard data."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const { monthlyData = [], expenseByCategory = [] } = data || {}

    const currentMonth = monthlyData[monthlyData.length - 1] || { income: 0, expenses: 0, budget: 0 }
    const totalIncome = monthlyData.reduce((sum: number, m: any) => sum + m.income, 0)
    const totalExpenses = monthlyData.reduce((sum: number, m: any) => sum + m.expenses, 0)
    const totalBudget = monthlyData.reduce((sum: number, m: any) => sum + m.budget, 0)
    const balance = totalIncome - totalExpenses
    const expensePercentage = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : "0.0"
    const budgetUsagePercentage = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(0) : "0"

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Budget Dashboard</h1>
                    <p className="text-muted-foreground">Track your income, expenses, and budget allocation</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Income */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-card-foreground">Total Income</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-card-foreground">${totalIncome.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
                        </CardContent>
                    </Card>

                    {/* Total Expenses */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-card-foreground">${totalExpenses.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">{expensePercentage}% of income</p>
                        </CardContent>
                    </Card>

                    {/* Net Balance */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-card-foreground">Net Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                                ${balance.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Income - Expenses</p>
                        </CardContent>
                    </Card>

                    {/* Budget Status */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-card-foreground">Budget Status</CardTitle>
                            <Target className="h-4 w-4 text-accent" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-card-foreground">
                                {budgetUsagePercentage}%
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">of budget used</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Income vs Expenses vs Budget Chart */}
                    <div className="lg:col-span-2">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-card-foreground">Income vs Expenses vs Budget</CardTitle>
                                <CardDescription className="text-muted-foreground">Last 6 months comparison</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                                        <YAxis stroke="var(--muted-foreground)" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                                            labelStyle={{ color: "var(--card-foreground)" }}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="expenses" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="budget" fill="var(--chart-3)" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expense Breakdown Pie Chart */}
                    <div>
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-card-foreground">Expense Breakdown</CardTitle>
                                <CardDescription className="text-muted-foreground">Current month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {expenseByCategory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={expenseByCategory}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="var(--chart-1)"
                                                dataKey="value"
                                            >
                                                {expenseByCategory.map((_: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                        No expenses this month
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Savings Trend */}
                <div>
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-card-foreground">Savings Trend</CardTitle>
                            <CardDescription className="text-muted-foreground">Monthly surplus over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart
                                    data={monthlyData.map((m: any) => ({
                                        month: m.month,
                                        savings: m.income - m.expenses,
                                    }))}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                                    <YAxis stroke="var(--muted-foreground)" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                                        labelStyle={{ color: "var(--card-foreground)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="savings"
                                        stroke="var(--chart-1)"
                                        strokeWidth={2}
                                        dot={{ fill: "var(--chart-1)", r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
