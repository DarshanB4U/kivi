"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle, BookOpen } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Learning</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {enrollments.length > 0
            ? `You have ${enrollments.length} course${enrollments.length > 1 ? "s" : ""} in your library.`
            : "Start exploring courses to build your library."}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <BookOpen className="mx-auto text-muted-foreground/30" size={40} />
            <div>
              <p className="text-sm text-muted-foreground">You haven't enrolled in any courses yet.</p>
            </div>
            <Button asChild>
              <Link href="/student/courses">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment: any) => (
            <Card key={enrollment.id} className="flex flex-col">
              <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
                {enrollment.course.thumbnail ? (
                  <img src={enrollment.course.thumbnail} alt={enrollment.course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="text-muted-foreground/30" size={40} />
                  </div>
                )}
              </div>

              <CardHeader>
                <Badge variant="outline" className="w-fit text-[10px]">Enrolled</Badge>
                <CardTitle className="line-clamp-2 leading-snug mt-1">{enrollment.course.title}</CardTitle>
              </CardHeader>

              <CardFooter className="mt-auto">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {enrollment.course.creator?.name?.[0] || "K"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{enrollment.course.creator?.name || "Instructor"}</span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/student/courses/${enrollment.courseId}`}>
                      <PlayCircle className="mr-1" size={14} />
                      Continue
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
