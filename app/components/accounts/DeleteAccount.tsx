
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { useDeleteAccount } from "@/lib/mutations/accounts";

interface DeleteAccountProps {
    id: number;
}

export default function DeleteAccount({ id }: DeleteAccountProps) {
    const deleteAccountMutation = useDeleteAccount();

    const handleDelete = async () => {
        try {
            await deleteAccountMutation.mutateAsync(id);
        } catch (error) {
            console.error("Failed to delete account", error);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="flex gap-2 justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete Account</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="hover:text-red-900 hover:bg-red-500 w-22 "
                        onClick={handleDelete}
                        disabled={deleteAccountMutation.isPending}
                    >
                        Yes
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    );
}
