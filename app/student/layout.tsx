import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/jwt";
import { SignoutButton } from "@/components/auth/signout-button";
import { Separator } from "@/components/ui/separator";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decoded = token ? (await verifyToken(token) as any) : null;

  if (!decoded || decoded.role !== "STUDENT") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/student/dashboard" className="text-base font-semibold">
              Kivi
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/student/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/student/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                Explore
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{decoded.email}</span>
            <SignoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
