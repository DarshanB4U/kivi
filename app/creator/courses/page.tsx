"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Share2, BookOpen, Loader2, ArrowRight } from "lucide-react";
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mr-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">Your Courses</h1>
          <p className="text-lg font-medium text-muted-foreground">Orchestrate your knowledge and build premium learning experiences.</p>
        </div>
        <Button className="rounded-full px-8 h-14 text-lg font-bold shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all group" asChild>
          <Link href="/creator/courses/new">
            <PlusCircle className="mr-2" size={20} />
            New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card className="border-none bg-muted/30 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
          <CardContent className="py-24 text-center space-y-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
               <BookOpen className="text-primary" size={40} />
            </div>
            <div className="space-y-2 max-w-md">
              <p className="text-2xl font-bold">No courses published</p>
              <p className="text-muted-foreground font-medium text-lg">Start your journey as a creator today and transform your expertise into impact.</p>
            </div>
            <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/creator/courses/new">Create Your First Course</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col border-none glass-card rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
              <div className="aspect-[16/10] bg-muted relative overflow-hidden m-4 mb-0 rounded-2xl">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted to-muted/50 group-hover:scale-110 transition-transform duration-700 ease-out">
                    <BookOpen className="text-muted-foreground/20" size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                   <Button variant="secondary" size="icon" className="rounded-full font-bold shadow-2xl" 
                     onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/student/courses/${course.id}`);
                        toast.success("Link copied!");
                      }}
                   >
                      <Share2 size={18} />
                   </Button>
                   <Button variant="secondary" asChild className="rounded-full font-bold shadow-2xl">
                      <Link href={`/creator/courses/${course.id}`}>
                        <Pencil className="mr-2" size={18} />
                        Edit Course
                      </Link>
                   </Button>
                </div>
              </div>

              <CardHeader className="px-8 pt-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="w-fit text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border-none">Active Offering</Badge>
                  <span className="text-xl font-black tracking-tighter text-foreground/80">${course.price}</span>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-base font-medium leading-relaxed text-muted-foreground/80 mt-3">{course.description}</CardDescription>
              </CardHeader>

              <CardFooter className="px-8 pb-8 pt-0 mt-auto border-t border-primary/5 pt-6 flex justify-between items-center">
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold rounded-full">
                       <Trash2 size={16} className="mr-2" />
                       Delete
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent className="glass-card border-none rounded-[2rem] p-0 overflow-hidden max-w-md">
                     <AlertDialogHeader className="p-8 pb-6 text-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Trash2 className="text-destructive" size={32} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black tracking-tighter">DELETE COURSE?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base font-medium text-muted-foreground">
                          This action is irreversible. All modules and lessons will be permanently removed.
                        </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                       <AlertDialogCancel className="w-full rounded-full border-2 font-bold h-12">Cancel</AlertDialogCancel>
                       <AlertDialogAction onClick={() => handleDelete(course.id)} className="w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold h-12 border-none">Confirm Destruction</AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
                 <Button size="icon" variant="ghost" className="rounded-full bg-primary/5 hover:bg-primary hover:text-white transition-all group/btn" asChild>
                    <Link href={`/creator/courses/${course.id}`}>
                      <ArrowRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
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
