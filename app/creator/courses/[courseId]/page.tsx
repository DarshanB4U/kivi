"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  Trash2,
  PlayCircle,
  Loader2,
  Share2,
  Users,
  ArrowLeft,
  Pencil,
  Check,
  X,
  Code,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration?: number;
  video?: {
    id: string;
    status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  };
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  modules: Module[];
}

const VideoStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "UPLOADING":
      return (
        <Badge
          variant="secondary"
          className="rounded-full font-black uppercase text-[10px] px-2 py-0.5 bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-none animate-pulse"
        >
          UPLOADING...
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge
          variant="secondary"
          className="rounded-full font-black uppercase text-[10px] px-2 py-0.5 bg-blue-400/20 text-blue-600 dark:text-blue-400 border-none"
        >
          <Loader2 size={10} className="mr-1 animate-spin" />
          PROCESSING
        </Badge>
      );
    case "READY":
      return (
        <Badge
          variant="secondary"
          className="rounded-full font-black uppercase text-[10px] px-2 py-0.5 bg-green-400/20 text-green-600 dark:text-green-400 border-none"
        >
          READY
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="destructive"
          className="rounded-full font-black uppercase text-[10px] px-2 py-0.5 border-none"
        >
          FAILED
        </Badge>
      );
    default:
      return null;
  }
};

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (!course) return;

    const hasProcessingVideos = course.modules.some((m) =>
      m.lessons.some(
        (l) =>
          l.video &&
          (l.video.status === "UPLOADING" || l.video.status === "PROCESSING"),
      ),
    );

    if (hasProcessingVideos) {
      const interval = setInterval(() => {
        fetchCourse();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data: Course = await res.json();
        setCourse(data);
      }
    } catch {
      console.error("Failed to fetch course");
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = async () => {
    if (!newModuleTitle) return;
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newModuleTitle,
          courseId,
          order: course?.modules?.length || 0,
        }),
      });
      if (res.ok) {
        setNewModuleTitle("");
        setIsAddingModule(false);
        fetchCourse();
      }
    } catch {
      toast.error("Failed to add module");
    }
  };

  const updateModule = async (moduleId: string) => {
    if (!editingModuleTitle) return;
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingModuleTitle }),
      });
      if (res.ok) {
        setEditingModuleId(null);
        fetchCourse();
      }
    } catch {
      toast.error("Failed to update module");
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
      fetchCourse();
    } catch {
      toast.error("Failed to delete module");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!course)
    return (
      <p className="text-center py-12 text-muted-foreground font-bold">
        Course not found.
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Link
          href="/creator/courses"
          className="inline-flex items-center text-sm font-black uppercase tracking-widest hover:text-primary transition-all gap-2 group"
        >
          <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Abandon Editor
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-full font-bold border-2"
            asChild
          >
            <Link href={`/creator/courses/${courseId}/students`}>
              <Users size={16} className="mr-2" />
              View Students
            </Link>
          </Button>
          <Button
            className="rounded-full font-bold shadow-lg shadow-primary/20"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/student/courses/${courseId}`,
              );
              toast.success("Link copied!");
            }}
          >
            <Share2 size={16} className="mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden border-none rounded-[2.5rem] bg-[#64c37d] text-white p-10 shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Code size={160} strokeWidth={1} />
        </div>
        <div className="relative z-10 space-y-6">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1 bg-white/20 text-white border-none font-black uppercase text-[10px] tracking-widest backdrop-blur-md"
          >
            Creator Mode
          </Badge>
          <div className="space-y-4">
            <h1 className="text-2xl font-black tracking-tighter leading-none">
              {course.title}
            </h1>
            <p className="text-lg font-medium text-white/80 max-w-2xl leading-relaxed">
              {course.description}
            </p>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black">${course.price}</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Price Point
              </span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-3xl font-black">
                {course?.modules?.length || 0}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                Modules
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter">
              COURSE SYLLABUS
            </h2>
            <p className="text-muted-foreground font-medium">
              Structure and manage your educational content.
            </p>
          </div>
          <Button
            className="rounded-full font-bold h-12 px-6"
            onClick={() => setIsAddingModule(!isAddingModule)}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Module
          </Button>
        </div>

        {isAddingModule && (
          <Card className="p-8 glass-card border-none rounded-[2rem] animate-in zoom-in-95 duration-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="ENTER MODULE TITLE..."
                className="h-14 bg-muted/50 border-none font-bold text-lg rounded-2xl px-6 focus-visible:ring-primary/20"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  className="h-14 px-8 rounded-2xl font-black"
                  onClick={addModule}
                >
                  Save Module
                </Button>
                <Button
                  variant="ghost"
                  className="h-14 font-bold text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setIsAddingModule(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-10">
          {course.modules?.map((module: Module, index: number) => (
            <Card
              key={module.id}
              className="overflow-hidden glass-card border-none rounded-[2.5rem] flex flex-col group shadow-xl"
            >
              <div className="p-8 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-6 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 font-black bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20 text-xl">
                    {index + 1}
                  </div>
                  {editingModuleId === module.id ? (
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <Input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        className="h-12 bg-background border-none font-bold text-lg rounded-xl px-4 shadow-inner"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        className="h-12 w-12 rounded-xl shadow-lg"
                        onClick={() => updateModule(module.id)}
                      >
                        <Check size={20} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-12 w-12 rounded-xl"
                        onClick={() => setEditingModuleId(null)}
                      >
                        <X size={20} />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-black tracking-tighter text-foreground">
                      {module.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => {
                      setEditingModuleId(module.id);
                      setEditingModuleTitle(module.title);
                    }}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-11 rounded-xl px-5 font-bold tracking-tight"
                    asChild
                  >
                    <Link
                      href={`/creator/courses/${courseId}/modules/${module.id}/lessons/new`}
                    >
                      <PlusCircle size={16} className="mr-2" />
                      New Lesson
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-card border-none rounded-[2rem] p-0 overflow-hidden max-w-md">
                      <AlertDialogHeader className="p-8 pb-6 text-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Trash2 className="text-destructive" size={32} />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black tracking-tighter">
                          TRASH MODULE?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base font-medium text-muted-foreground">
                          Warning: This will permanently eradicate the module
                          and all its lessons.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="w-full rounded-full border-2 font-bold h-12">
                          Abandon
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteModule(module.id)}
                          className="w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold h-12 border-none"
                        >
                          Confirm Destruction
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="p-8">
                {module.lessons?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 bg-muted/10 rounded-[1.5rem] gap-4">
                    <BookOpen className="text-muted-foreground/30" size={48} />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                      No lessons fabricated yet.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full font-bold"
                      asChild
                    >
                      <Link
                        href={`/creator/courses/${courseId}/modules/${module.id}/lessons/new`}
                      >
                        Fabricate First Lesson
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {module.lessons?.map((lesson: Lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-muted/20 hover:bg-muted/40 transition-all rounded-[1.5rem] group/lesson relative border border-transparent hover:border-primary/20"
                      >
                        <div className="flex items-center justify-center w-14 h-14 bg-background rounded-2xl shadow-md group-hover/lesson:scale-105 transition-transform flex-shrink-0">
                          <PlayCircle size={28} className="text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-bold text-xl tracking-tight leading-tight">
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3">
                            {lesson.duration && (
                              <Badge
                                variant="secondary"
                                className="rounded-full font-black uppercase text-[10px] bg-background text-muted-foreground border-none px-3"
                              >
                                {Math.floor(lesson.duration / 60)} MINS
                              </Badge>
                            )}
                            {lesson.video && (
                              <VideoStatusBadge status={lesson.video.status} />
                            )}
                          </div>
                        </div>
                        <div className="self-end sm:self-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full font-bold px-5 h-10 hover:bg-primary/10 hover:text-primary transition-all bg-background border-none shadow-sm"
                            asChild
                          >
                            <Link
                              href={`/creator/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}
                            >
                              <Pencil size={14} className="mr-2" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
