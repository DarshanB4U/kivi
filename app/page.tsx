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
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 ">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                Featured Masterclasses
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl font-medium">
                Curated high-performance content from world-class industry
                leaders.
              </p>
            </div>
            <Button
              variant="link"
              className="text-primary font-bold text-lg group p-0"
            >
              View all courses{" "}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {courses.length === 0 ? (
            <Card className="border-dashed bg-background/50 backdrop-blur-sm border-2 rounded-[2rem]">
              <CardContent className="py-32 text-center text-muted-foreground flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center animate-bounce">
                  <BookOpen className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-foreground">
                    No courses available yet.
                  </p>
                  <p className="text-lg">
                    The next big thing is currently being built.
                  </p>
                </div>
                <Button className="rounded-full" variant="secondary" asChild>
                  <Link href="/signup">Notify me on launch</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="flex flex-col group hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 border-none overflow-hidden glass-card rounded-[2rem] hover:-translate-y-2"
                >
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden m-4 mb-0 rounded-2xl">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50 group-hover:scale-110 transition-transform duration-700 ease-out">
                        <BookOpen
                          className="text-muted-foreground/20"
                          size={64}
                        />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Badge className="bg-white/90 dark:bg-black/90 text-foreground border-none font-black px-4 py-2 text-base shadow-xl rounded-xl">
                        ${course.price}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="flex-1 px-8 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        variant="secondary"
                        className="text-xs font-bold uppercase tracking-wider rounded-lg px-2.5 py-1 bg-primary/10 text-primary border-none"
                      >
                        {course._count.modules} lessons
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Users size={14} className="text-primary" />
                        {course._count.enrollments} Enrolled
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-4">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-base font-medium leading-relaxed text-muted-foreground/80">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="px-8 pb-8 pt-0 mt-4 h-20 flex items-center justify-between border-t border-primary/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background ring-4 ring-primary/5">
                        <AvatarFallback className="premium-gradient text-white text-sm font-black">
                          {course.creator.name?.[0] ||
                            course.creator.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col -space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                          Creator
                        </span>
                        <span className="text-sm font-bold truncate max-w-[140px]">
                          {course.creator.name ||
                            course.creator.email.split("@")[0]}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      <ArrowRight
                        size={20}
                        className="group-hover/btn:translate-x-0.5 transition-transform"
                      />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
