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
import { BookOpen, Users, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
          <span className="text-base font-semibold">Kivi</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Learn from the best.
            <br />
            <span className="text-muted-foreground">Teach what you know.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A clean platform for creators to build courses and for students to master new skills.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start learning <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Courses */}
      <section id="courses" className="py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured courses</h2>
            <p className="text-sm text-muted-foreground mt-1">Discover top content from our creators.</p>
          </div>

          {courses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                No courses available yet. Check back soon.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="flex flex-col">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-muted-foreground/30" size={40} />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{course._count.modules} modules</Badge>
                      <span className="text-sm font-semibold">${course.price}</span>
                    </div>
                    <CardTitle className="line-clamp-2 leading-snug mt-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardFooter className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">
                          {course.creator.name?.[0] || course.creator.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {course.creator.name || course.creator.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} />
                      {course._count.enrollments}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <Card className="max-w-3xl mx-auto text-center">
          <CardContent className="py-12 space-y-4">
            <h2 className="text-2xl font-semibold">Ready to start?</h2>
            <p className="text-muted-foreground">Join as a student or a creator — it's free to sign up.</p>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild>
                <Link href="/signup">Create account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signin">Sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Kivi</span>
          <span>Built by Darshan</span>
        </div>
      </footer>
    </div>
  );
}
