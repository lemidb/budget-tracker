"use client";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  return (
    <div className="h-screen w-full flex flex-col p-20 justify-center">
      <div className="space-y-4 flex flex-col items-center border rounded-xl p-16 w-full sm:w-4xl mx-auto bg-background">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <div className="p-5 border rounded-full text-6xl font-extrabold bg-primary text-primary-foreground">
            404
          </div>
        </div>
        <h3 className="text-sm text-center text-muted-foreground">
          Oops the page your looking for{" "}
          <span className="font-bold">{pathname}</span> couldn't be found
        </h3>
        <div>
          <Link href={"/"}>
            <span className="px-4 py-2 text-base border rounded-xl cursor-pointer flex gap-2 justify-center items-center">
              <Home size={16} />
              Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
