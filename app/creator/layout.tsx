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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link href="/creator/courses" className="flex items-center gap-2 group">
              <div className="group-hover:scale-110 transition-transform duration-300">
                <img src="/kiwi-svgrepo-com.svg" alt="Kivi Logo" className="w-7 h-7" />
              </div>
              <span className="text-xl font-black tracking-tighter hover:text-primary transition-colors">Kivi <span className="text-muted-foreground/50 ml-1 font-medium">Creator</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/creator/courses" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all relative group">
                My Courses
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end border-r pr-5 border-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none text-primary mb-1 text-indigo-500">Creator</span>
              <span className="text-xs font-bold truncate max-w-[150px] opacity-80">{decoded.email.split('@')[0]}</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SignoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}

