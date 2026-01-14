"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  MenuIcon,
  User,
  Mail,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import useLogout from "@/lib/mutations/auth/logout";
import { useAuth } from "@/lib/hooks/useAuth";

// Helper function to get user initials from name
function getInitials(name: string | undefined): string {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    // First letter of first name + first letter of last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1) {
    // If only one name, use first two letters
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "U";
}

export function SiteHeader() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { user } = useAuth();



  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions", href: "/transactions" },
    { label: "Budgets", href: "/budgets" },
    { label: "Categories", href: "/budget-category" },
    { label: "Accounts", href: "/accounts" },
  ];

  const handleLogout = async () => {
    logoutMutation.mutate();
  };

  const userInitials = getInitials(user?.name);
  const userName = user?.name || "";
  const userEmail = user?.email || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            BT
          </div>
          <span className="hidden sm:inline">Budget Tracker</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                <Avatar className="h-9 w-9 cursor-pointer transition-opacity hover:opacity-80">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-3">
                <DropdownMenuLabel className="px-0 py-0 font-normal">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {userName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-muted-foreground cursor-pointer focus:bg-primary"
              >
                <LogOut className="h-4 w-4 hover:text-black" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="pb-4">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* User Profile Section */}
                {user && (
                  <div className="border-t border-border mt-4 pt-4">
                    <div className="flex items-center gap-3 px-3 pb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1 items-center justify-center">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pl-5">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {userEmail}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-2">
                      <button
                        onClick={handleLogout}
                        className="w-full inline-flex items-center gap-2 justify-start px-3 py-2.5 rounded-lg text-sm text-muted-foreground transition-colors hover:bg-primary hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
}
