import LoginPage from "@/app/components/auth/login-form";

export default function page() {
    return (
        <div className="flex flex-col min-h-screen items-center bg-background font-inter w-full">
            <LoginPage />
        </div>
    )
}