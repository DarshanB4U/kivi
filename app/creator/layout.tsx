import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/jwt";
import { SignoutButton } from "@/components/auth/signout-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decoded = token ? (await verifyToken(token) as any) : null;

  if (!decoded || decoded.role !== "CREATOR") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 py-4 w-full">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/creator/courses" className="text-2xl font-bold tracking-tight text-primary transition-colors hover:text-primary/80">
              Kivi Creator
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/creator/courses" className="text-sm font-medium tracking-wide hover:text-primary transition-colors">
                My Courses
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-muted-foreground">CREATOR</span>
              <span className="text-sm font-semibold truncate max-w-[150px]">{decoded.email.split('@')[0]}</span>
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
