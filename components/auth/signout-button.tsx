"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignoutButton() {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (res.ok) {
          // Important: refresh to clear server-side state/cookies
          router.push("/signin");
          router.refresh();
      }
    } catch (error) {
      console.error("Signout failed");
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSignout}
      className="text-neutral-400 hover:text-red-400 hover:bg-neutral-800 gap-2 font-medium"
    >
      <LogOut size={16} />
      <span>Sign out</span>
    </Button>
  );
}
