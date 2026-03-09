"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Share2, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
}

export default function CreatorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) setCourses(await res.json());
      } catch (error) {
        console.error("Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      alert("Failed to delete course");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your published courses.</p>
        </div>
        <Button asChild>
          <Link href="/creator/courses/new">
            <PlusCircle className="mr-1" size={16} />
            New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <BookOpen className="mx-auto text-muted-foreground/30" size={40} />
            <p className="text-sm text-muted-foreground">You haven't created any courses yet.</p>
            <Button asChild>
              <Link href="/creator/courses/new">Create your first course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
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
                  <Badge variant="secondary">${course.price}</Badge>
                </div>
                <CardTitle className="line-clamp-2 leading-snug mt-1">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>

              <CardFooter className="mt-auto gap-2">
                <Button variant="outline" size="icon-sm" title="Share"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/student/courses/${course.id}`);
                    alert("Link copied!");
                  }}
                >
                  <Share2 size={14} />
                </Button>
                <Button variant="outline" size="icon-sm" title="Delete"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 size={14} />
                </Button>
                <Button size="sm" className="ml-auto" asChild>
                  <Link href={`/creator/courses/${course.id}`}>
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
