import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, ArrowRight, Sparkles, Code, PlayCircle } from "lucide-react";
import { Footer } from "@/components/footer";
import { LandingActions } from "@/components/landing-actions";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const decoded = token ? (await verifyToken(token) as any) : null;

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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-primary/10 via-background to-background rounded-b-[100%] blur-3xl -z-10" />

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-md">
                <Code size={20} />
             </div>
             Kivi
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Sparkles className="w-4 h-4 mr-2 inline-block" />
             Kivi Version 1.0 is Live
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Master your craft.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Elevate your future.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            The premium platform for creators to build exceptional courses and for students to master high-income skills seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-xl shadow-primary/25 hover:shadow-primary/50 transition-all hover:-translate-y-1 w-full sm:w-auto group" asChild>
              <Link href="/signup">
                Start learning for free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-base border-2 hover:bg-muted w-full sm:w-auto group" asChild>
              <Link href="#courses">
                 <PlayCircle className="mr-2 w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                 Explore courses
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo (Sonner integration) */}
      <section className="py-12 px-6">
         <div className="max-w-6xl mx-auto flex justify-center">
            <LandingActions />
         </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-24 px-6 relative">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-tl from-blue-500/5 via-transparent to-transparent -z-10" />
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Masterclasses</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hand-picked premium content from industry-leading creators.</p>
          </div>

          {courses.length === 0 ? (
            <Card className="border-dashed bg-background/50 backdrop-blur-sm">
              <CardContent className="py-24 text-center text-muted-foreground flex flex-col items-center gap-4">
                 <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                 <p className="text-lg font-medium">No courses available yet.</p>
                 <p className="text-sm">Be the first to create one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-muted/50 overflow-hidden bg-card/60 backdrop-blur-xl hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 group-hover:scale-105 transition-transform duration-700 ease-out">
                        <BookOpen className="text-muted-foreground/20" size={48} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                       <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none font-semibold shadow-sm">
                          ${course.price}
                       </Badge>
                    </div>
                  </div>

                  <CardHeader className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs font-normal rounded-md bg-background/50">
                         {course._count.modules} modules
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 leading-snug group-hover:text-primary transition-colors">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 leading-relaxed">{course.description}</CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-4 pb-6 border-t border-muted/20 bg-muted/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {course.creator.name?.[0] || course.creator.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {course.creator.name || course.creator.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/80 bg-background/50 px-2 py-1 rounded-md">
                      <Users size={14} />
                      {course._count.enrollments}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 py-16 px-8 md:px-16 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Ready to unlock your potential?</h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Join thousands of creators and students building the future of online education. It takes seconds to start.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base font-semibold hover:scale-105 transition-transform" asChild>
                  <Link href="/signup">Create free account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
