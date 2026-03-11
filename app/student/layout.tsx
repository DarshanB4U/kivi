import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/jwt";
import { SignoutButton } from "@/components/auth/signout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decoded = token ? (await verifyToken(token) as any) : null;

  if (!decoded || decoded.role !== "STUDENT") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[var(--neo-cyan)] selection:text-black">
      <header className="sticky top-0 z-50 border-b-4 border-black dark:border-white bg-white dark:bg-black py-4">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/student/dashboard" className="text-2xl font-black uppercase italic tracking-tighter hover:bg-[var(--neo-cyan)] hover:text-black px-2 transition-colors">
              Kivi
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/student/dashboard" className="text-sm font-black uppercase tracking-widest hover:underline decoration-4 underline-offset-4">
                Dashboard
              </Link>
              <Link href="/student/courses" className="text-sm font-black uppercase tracking-widest hover:underline decoration-4 underline-offset-4">
                Explore
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">STUDENT</span>
              <span className="text-xs font-bold truncate max-w-[150px]">{decoded.email}</span>
            </div>
            <ThemeToggle />
            <SignoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
