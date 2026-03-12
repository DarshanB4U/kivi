"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export function LandingActions() {
  return (
    <div className="flex flex-col items-center gap-3 bg-muted/30 p-6 rounded-2xl border backdrop-blur-sm animate-in zoom-in-95 duration-700">
      <p className="text-sm font-medium text-muted-foreground mb-1">Interactive Notification Preview</p>
      <div className="flex items-center gap-4">
         <Button 
           variant="outline" 
           className="rounded-full shadow-sm"
           onClick={() => toast.success("You've been successfully subscribed!", { description: "You will receive updates in your inbox." })}
         >
           Subscribe to Updates
         </Button>
         <Button 
           className="rounded-full shadow-sm group"
           onClick={() => toast("Welcome back to Kivi,", {
             description: "Your learning journey awaits.",
             icon: <BellRing className="w-4 h-4 text-primary" />,
             action: { label: "Dashboard", onClick: () => console.log("Dashboard") }
           })}
         >
           <BellRing className="w-4 h-4 mr-2 group-hover:animate-bounce" />
           Notify Me
         </Button>
      </div>
    </div>
  );
}
