import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { redirect } from "next/navigation";
import "@/app/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/app/components/dashboard/site-header";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Your personal finance management tool.",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side auth check - redirect immediately if not authenticated
  // This prevents any content from rendering before redirect
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <AuthProvider>
        <SiteHeader />
        <SidebarInset className="flex-1">{children}</SidebarInset>
        <Toaster />
      </AuthProvider>
    </div>
  );
}
