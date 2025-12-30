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

// Sample data - replace with real data from your API/database
const monthlyData = [
    { month: "Jan", income: 4500, expenses: 2400, budget: 3500 },
    { month: "Feb", income: 5200, expenses: 2800, budget: 3500 },
    { month: "Mar", income: 4800, expenses: 3200, budget: 3500 },
    { month: "Apr", income: 5500, expenses: 2900, budget: 3500 },
    { month: "May", income: 6200, expenses: 3500, budget: 3500 },
    { month: "Jun", income: 5800, expenses: 3100, budget: 3500 },
]

const expenseByCategory = [
    { name: "Housing", value: 1200 },
    { name: "Food", value: 450 },
    { name: "Transportation", value: 280 },
    { name: "Entertainment", value: 320 },
    { name: "Utilities", value: 350 },
]

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export default function DashboardPage() {
    // Calculate summary metrics
    const currentMonth = monthlyData[monthlyData.length - 1]
    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0)
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0)
    const totalBudget = monthlyData[0].budget * 6
    const balance = totalIncome - totalExpenses
    const expensePercentage = ((totalExpenses / totalIncome) * 100).toFixed(1)

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
                                {((totalExpenses / totalBudget) * 100).toFixed(0)}%
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
                                            {expenseByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                                            labelStyle={{ color: "var(--card-foreground)" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
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
                                    data={monthlyData.map((m) => ({
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
