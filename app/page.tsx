import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  TrendingUp,
  PieChart,
  Target,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="flex flex-col min-h-screen font-inter w-full relative">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMCAwVjIyaDJ2MTJoLTJ6TTIyIDM0aDJ2LTJoLTJ2MnptMC0xMkgzNnYySDIyem0wIDBoMTJ2LTJIMjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40 dark:opacity-20" />
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <p className="text-2xl font-bold font-[poppins] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Budget Tracker
          </p>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-4 py-20 md:py-32 lg:py-40 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Take Control of Your
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financial Future
              </span>
            </h1>
            <p className="text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto">
              Track expenses, analyze spending patterns, and make informed
              financial decisions with powerful insights at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" asChild className="text-base">
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Insights & Features Section */}
        <section className="px-4 py-20 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Powerful Insights for
                <span className="block text-primary">Better Decisions</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Understand your spending habits, identify opportunities to save,
                and achieve your financial goals with data-driven insights.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Track Spending Trends</CardTitle>
                  <CardDescription>
                    Visualize your spending patterns over time and identify
                    trends that impact your financial health.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Monthly and yearly spending analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Category-wise expense breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Compare periods to spot changes</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                    <PieChart className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Category Insights</CardTitle>
                  <CardDescription>
                    See exactly where your money goes with detailed category
                    analysis and spending distribution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Visual spending breakdown by category</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Identify top spending areas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Set budgets per category</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Goal Tracking</CardTitle>
                  <CardDescription>
                    Set financial goals and track your progress toward achieving
                    them with real-time updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Create savings and spending goals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Monitor progress with visual indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Get alerts when goals are achieved</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>
                    Compare your income and expenses to understand your net
                    financial position at any time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Real-time balance calculations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Monthly income and expense summaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Forecast future financial health</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your financial data is encrypted and stored securely. We
                    never share your information with third parties.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Bank-level encryption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Your data stays private</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Regular security audits</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle>Quick & Easy</CardTitle>
                  <CardDescription>
                    Add transactions in seconds, categorize automatically, and
                    get instant insights without the hassle.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Fast transaction entry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Smart categorization suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-1">•</span>
                      <span>Mobile-friendly interface</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 p-12 rounded-2xl border-2 bg-card/50 backdrop-blur-sm">
              <h3 className="text-3xl font-bold md:text-4xl">
                Ready to Transform Your Finances?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who are taking control of their
                financial future. Start tracking today—it's free!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="text-base">
                  <Link href="/auth/signup">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-base"
                >
                  <Link href="/auth/login">Sign In to Existing Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background/80 backdrop-blur-sm py-8">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {currentYear} Budget Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
