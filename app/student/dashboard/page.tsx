"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/enrollments");
        if (res.ok) setEnrollments(await res.json());
      } catch (error) {
        console.error("Failed to fetch enrollments");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">My Learning</h1>
          <p className="text-lg text-muted-foreground font-medium">
            {enrollments.length > 0
              ? `You have ${enrollments.length} premium course${enrollments.length > 1 ? "s" : ""} in your creative library.`
              : "Your journey starts here. Explore our world-class masterclasses."}
          </p>
        </div>
        {enrollments.length > 0 && (
          <Button variant="outline" className="rounded-full font-bold border-2 hover:bg-primary/5 group" asChild>
            <Link href="/student/courses">
              Browse more courses <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        )}
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-none bg-muted/30 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="py-24 text-center space-y-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
               <BookOpen className="text-primary" size={40} />
            </div>
            <div className="space-y-2 max-w-md">
              <p className="text-2xl font-bold">Your library is empty</p>
              <p className="text-muted-foreground font-medium text-lg">Master your craft with hand-picked courses from the world's best creators.</p>
            </div>
            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/student/courses">Explore masterclasses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {enrollments.map((enrollment: any) => (
            <Card key={enrollment.id} className="flex flex-col border-none glass-card rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
              <div className="aspect-[16/10] bg-muted relative overflow-hidden m-4 mb-0 rounded-2xl">
                {enrollment.course.thumbnail ? (
                  <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50 group-hover:scale-110 transition-transform duration-700 ease-out">
                    <BookOpen className="text-muted-foreground/20" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <Button variant="secondary" className="rounded-full font-bold shadow-2xl" asChild>
                      <Link href={`/student/courses/${enrollment.courseId}`}>
                        <PlayCircle className="mr-2" size={20} />
                        Continue Learning
                      </Link>
                   </Button>
                </div>
              </div>

              <CardHeader className="px-8 pt-6 pb-4">
                <Badge variant="secondary" className="w-fit text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary border-none">Active Curriculum</Badge>
                <CardTitle className="text-xl font-bold tracking-tight line-clamp-2 leading-tight mt-3 group-hover:text-primary transition-colors">{enrollment.course.title}</CardTitle>
              </CardHeader>

              <CardFooter className="px-8 pb-8 pt-0 mt-auto border-t border-primary/5 pt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2 border-background ring-4 ring-primary/5">
                      <AvatarFallback className="premium-gradient text-white text-[10px] font-black">
                        {enrollment.course.creator?.name?.[0] || "K"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col -space-y-1">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Instructor</span>
                       <span className="text-sm font-bold truncate max-w-[120px]">{enrollment.course.creator?.name || "Instructor"}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-all group/btn" asChild>
                    <Link href={`/student/courses/${enrollment.courseId}`}>
                      <ArrowRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

