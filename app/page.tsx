import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import { Footer } from "@/components/footer";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decoded = token ? ((await verifyToken(token)) as any) : null;

  if (decoded) {
    if (decoded.role === "CREATOR") redirect("/creator/courses");
    else if (decoded.role === "STUDENT") redirect("/student/dashboard");
  }

  const courses = await prisma.course.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-200 bg-linear-to-b from-primary/20 via-primary/5 to-transparent rounded-b-[100%] blur-3xl -z-10" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/15 rounded-full blur-[100px] -z-10 animate-pulse delay-1000" />

      <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40 w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="group-hover:scale-110 transition-transform duration-300">
              <img
                src="/kiwi-svgrepo-com.svg"
                alt="Kivi Logo"
                className="w-8 h-8"
              />
            </div>
            <span className="font-black text-2xl tracking-tighter hover:text-primary transition-colors">
              Kivi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hidden sm:flex font-medium hover:bg-primary/10"
              asChild
            >
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button
              className="rounded-full px-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold"
              asChild
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <Sparkles className="w-4 h-4 mr-1" />
            Kivi Version 1.0 is Live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Design your <br />
            <span className="text-gradient">creative destiny.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            The elite ecosystem for creators to build world-class courses and
            students to master the skills of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <Button
              size="lg"
              className="rounded-full px-10 h-16 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1.5 active:scale-95 w-full sm:w-auto group font-bold"
              asChild
            >
              <Link href="/signup">
                Start building now{" "}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-10 h-16 text-lg border-2 hover:bg-muted/50 w-full sm:w-auto group font-bold backdrop-blur-sm transition-all"
              asChild
            >
              <Link href="#courses">
                <PlayCircle className="mr-2 w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                Explore courses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="courses" className="py-32 px-6 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto space-y-20"></div>
      </section>

      <Footer />
    </div>
  );
}
