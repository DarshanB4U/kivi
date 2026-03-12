"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Trash2, PlayCircle, Loader2, Share2, Users, ArrowLeft, Pencil, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function CourseEditorPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  useEffect(() => { fetchCourse(); }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) setCourse(await res.json());
    } catch { console.error("Failed to fetch course"); }
    finally { setIsLoading(false); }
  };

  const addModule = async () => {
    if (!newModuleTitle) return;
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newModuleTitle, courseId, order: course?.modules?.length || 0 }),
      });
      if (res.ok) { setNewModuleTitle(""); setIsAddingModule(false); fetchCourse(); }
    } catch { toast.error("Failed to add module"); }
  };

  const updateModule = async (moduleId: string) => {
    if (!editingModuleTitle) return;
    try {
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingModuleTitle }),
      });
      if (res.ok) { setEditingModuleId(null); fetchCourse(); }
    } catch { toast.error("Failed to update module"); }
  };

  const deleteModule = async (moduleId: string) => {
    try { await fetch(`/api/modules/${moduleId}`, { method: "DELETE" }); fetchCourse(); }
    catch { toast.error("Failed to delete module"); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;
  }

  if (!course) return <p className="text-center py-12 text-muted-foreground">Course not found.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-10 px-4">
      {/* Back Link */}
      <Link 
        href="/creator/courses" 
        className="inline-flex items-center text-sm font-black uppercase tracking-widest hover:text-blue-600 transition-all gap-1"
      >
        <ArrowLeft size={16} />
        ABANDON EDITOR
      </Link>

      {/* Hero / Header Section */}
      <Card className="p-8 flex flex-col md:flex-row justify-between items-start gap-6 bg-yellow-400 dark:bg-yellow-500 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none">
        <div className="space-y-4 flex-1 text-black">
          <Badge variant="outline" className="rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-1">Creator Mode</Badge>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">{course.title}</h1>
          <p className="text-base font-bold text-black/80 max-w-2xl">{course.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black">${course.price}</span>
            <Separator orientation="vertical" className="h-6 w-[3px] bg-black" />
            <span className="text-sm font-black tracking-widest">{course?.modules?.length || 0} MODULES</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="neo-btn rounded-none border-2 border-black bg-white text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" asChild>
            <Link href={`/creator/courses/${courseId}/students`}>
              <Users size={16} className="mr-2" />
              STUDENTS
            </Link>
          </Button>
          <Button variant="secondary" className="neo-btn rounded-none border-2 border-black bg-blue-400 text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all gap-2" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/student/courses/${courseId}`);
            toast.success("Link copied!");
          }}>
            <Share2 size={16} />
            SHARE
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">COURSE SYLLABUS</h2>
          <Button size="sm" className="neo-btn rounded-none border-2 border-black bg-green-400 text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" onClick={() => setIsAddingModule(!isAddingModule)}>
            <PlusCircle size={16} className="mr-2" />
            ADD MODULE
          </Button>
        </div>

        {isAddingModule && (
          <Card className="p-6 bg-white dark:bg-black border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-none">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="ENTER MODULE TITLE..."
                className="h-12 border-2 border-black font-bold uppercase rounded-none"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button className="h-12 neo-btn rounded-none border-2 border-black bg-black text-white dark:bg-white dark:text-black font-black uppercase hover:opacity-80" onClick={addModule}>SAVE</Button>
                <Button variant="ghost" className="h-12 font-black uppercase underline" onClick={() => setIsAddingModule(false)}>CANCEL</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {course.modules?.map((module: any, index: number) => (
            <Card key={module.id} className="overflow-hidden bg-white dark:bg-black border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] rounded-none flex flex-col group">
              <div className="border-b-4 border-black dark:border-white p-4 flex items-center justify-between bg-indigo-100 dark:bg-indigo-950">
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex items-center justify-center w-10 h-10 font-black border-2 border-black bg-yellow-400 text-black text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">
                    {index + 1}
                  </span>
                  {editingModuleId === module.id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <Input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        className="h-10 border-2 border-black font-bold uppercase rounded-none"
                        autoFocus
                      />
                      <Button size="icon" variant="outline" className="h-10 w-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-400 text-black" onClick={() => updateModule(module.id)}>
                        <Check size={18} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-10 w-10 font-black uppercase text-black" onClick={() => setEditingModuleId(null)}>
                        <X size={18} />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">{module.title}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-400 text-black bg-white" onClick={() => {
                    setEditingModuleId(module.id);
                    setEditingModuleTitle(module.title);
                  }}>
                    <Pencil size={18} />
                  </Button>
                  <Button variant="outline" size="sm" className="h-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-400 text-black bg-white font-black uppercase" asChild>
                    <Link href={`/creator/courses/${courseId}/modules/${module.id}/lessons/new`}>
                      <PlusCircle size={16} className="mr-1.5" />
                      NEW LESSON
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10 neo-btn rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white text-red-500 bg-white">
                        <Trash2 size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="neo-box border-4 border-black rounded-none bg-white text-black p-0 overflow-hidden">
                      <AlertDialogHeader className="bg-red-500 p-6 border-b-4 border-black text-white">
                        <AlertDialogTitle className="font-black uppercase text-2xl tracking-tighter flex items-center gap-2"><Trash2 size={24} /> TRASH MODULE?</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold text-white/90 text-sm uppercase tracking-widest">
                          Warning: This will permanently eradicate the module and all its lessons.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="p-6 bg-gray-100">
                        <AlertDialogCancel className="neo-btn rounded-none border-2 border-black font-black uppercase hover:bg-gray-200 text-black">ABANDON</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteModule(module.id)} className="neo-btn rounded-none border-2 border-black font-black uppercase bg-black text-white hover:opacity-80">CONFIRM DESTRUCTION</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-black">
                {module.lessons?.length === 0 ? (
                  <div className="flex items-center justify-center py-8 border-4 border-dashed border-black/20 dark:border-white/20 bg-gray-50 dark:bg-zinc-900 rounded-none">
                     <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                       NO LESSONS FABRICATED YET.
                     </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {module.lessons?.map((lesson: any, lIdx: number) => (
                      <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden group/lesson rounded-none">
                        <div className="flex items-center justify-center w-12 h-12 border-2 border-black bg-yellow-400 group-hover/lesson:bg-yellow-500 transition-colors rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                          <PlayCircle size={24} className="text-black" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-black text-lg uppercase leading-tight">{lesson.title}</h4>
                          <div className="flex items-center gap-2">
                            {lesson.duration && (
                              <Badge variant="outline" className="rounded-none border-black font-bold uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white text-black">
                                {Math.floor(lesson.duration / 60)} MINS
                              </Badge>
                            )}
                            {lesson.videoUrl && (
                              <Badge className="rounded-none border-2 border-black font-bold uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-green-400 text-black hover:bg-green-500">
                                 VIDEO READY
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="self-end sm:self-auto">
                           <Button variant="outline" size="sm" className="neo-btn rounded-none border-2 border-black text-sm font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-all bg-white text-black" asChild>
                             <Link href={`/creator/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}>
                               <Pencil size={14} className="mr-2" />
                               EDIT
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
