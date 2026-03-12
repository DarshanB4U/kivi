"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Share2, BookOpen, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      toast.error("Failed to delete course");
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Your Courses</h1>
          <p className="text-sm font-bold mt-1 uppercase tracking-widest text-muted-foreground">Manage your published courses.</p>
        </div>
        <Button className="neo-btn rounded-none border-2 border-black bg-black text-white hover:bg-gray-800 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all h-12" asChild>
          <Link href="/creator/courses/new">
            <PlusCircle className="mr-2" size={18} />
            NEW COURSE
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-4 border-dashed border-black rounded-none">
          <CardContent className="py-16 text-center space-y-6">
            <BookOpen className="mx-auto text-black/30" size={60} />
            <p className="text-xl font-black uppercase tracking-widest">You haven't created any courses yet.</p>
            <Button className="h-12 neo-btn rounded-none border-2 border-black bg-yellow-400 text-black hover:bg-yellow-500 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" asChild>
              <Link href="/creator/courses/new">CREATE YOUR FIRST COURSE</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none group hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-black">
              <div className="aspect-video bg-indigo-100 dark:bg-indigo-900 border-b-4 border-black relative overflow-hidden flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="text-black/30 dark:text-white/30" size={60} />
                  </div>
                )}
              </div>

              <CardHeader className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="rounded-none border-2 border-black font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-green-400 text-black">${course.price}</Badge>
                </div>
                <CardTitle className="line-clamp-2 leading-tight text-2xl font-black uppercase tracking-tighter">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 font-bold text-black/70 dark:text-white/70 mt-2">{course.description}</CardDescription>
              </CardHeader>

              <CardFooter className="mt-auto gap-3 p-6 bg-gray-50 dark:bg-zinc-900 border-t-4 border-black">
                <Button variant="outline" size="icon" className="h-10 w-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-400 bg-white text-black" title="Share"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/student/courses/${course.id}`);
                    toast.success("Link copied!");
                  }}
                >
                  <Share2 size={18} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white bg-white text-red-500" title="Delete">
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="neo-box border-4 border-black rounded-none bg-white p-0 overflow-hidden">
                    <AlertDialogHeader className="bg-red-500 p-6 border-b-4 border-black text-white">
                        <AlertDialogTitle className="font-black uppercase text-2xl tracking-tighter flex items-center gap-2"><Trash2 size={24} /> DELETE COURSE?</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-white/90 text-sm uppercase tracking-widest">
                          Are you sure you want to permanently delete this course?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="p-6 bg-gray-100">
                      <AlertDialogCancel className="neo-btn rounded-none border-2 border-black font-black uppercase hover:bg-gray-200 text-black">CANCEL</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(course.id)} className="neo-btn rounded-none border-2 border-black font-black uppercase bg-black text-white hover:opacity-80">CONFIRM DELETE</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button className="h-10 ml-auto neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 bg-white text-black font-black uppercase" asChild>
                  <Link href={`/creator/courses/${course.id}`}>
                    <Pencil size={16} className="mr-2" />
                    EDIT
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
