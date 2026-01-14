
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionComponent from "@/app/components/Transactions/transaction-component";

export default async function TransactionsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <TransactionComponent />
    );
}