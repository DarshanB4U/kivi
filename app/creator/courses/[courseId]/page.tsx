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
    } catch { alert("Failed to add module"); }
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
    } catch { alert("Failed to update module"); }
  };

  const deleteModule = async (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    try { await fetch(`/api/modules/${moduleId}`, { method: "DELETE" }); fetchCourse(); }
    catch { alert("Failed to delete module"); }
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
        className="inline-flex items-center text-sm font-bold border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all gap-1"
      >
        <ArrowLeft size={16} />
        BACK TO COURSES
      </Link>

      {/* Hero / Header Section */}
      <div className="neo-box p-8 flex flex-col md:flex-row justify-between items-start gap-6 bg-white dark:bg-black">
        <div className="space-y-4 flex-1">
          <Badge className="neo-btn rounded-none bg-indigo-500 text-white hover:bg-indigo-600 border-2">CREATOR MODE</Badge>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none italic">{course.title}</h1>
          <p className="text-lg font-medium text-muted-foreground max-w-2xl">{course.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-black">$ {course.price}</span>
            <Separator orientation="vertical" className="h-6 bg-black dark:bg-white w-[2px]" />
            <span className="text-sm font-bold uppercase tracking-widest">{course?.modules?.length || 0} MODULES</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="neo-btn" asChild>
            <Link href={`/creator/courses/${courseId}/students`}>
              <Users size={18} className="mr-2" />
              STUDENTS
            </Link>
          </Button>
          <Button variant="outline" className="neo-btn bg-yellow-400 text-black hover:bg-yellow-500" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/student/courses/${courseId}`);
            alert("Link copied!");
          }}>
            <Share2 size={18} className="mr-2" />
            SHARE
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Course Syllabus</h2>
          <Button className="neo-btn bg-green-400 text-black hover:bg-green-500" onClick={() => setIsAddingModule(!isAddingModule)}>
            <PlusCircle size={18} className="mr-2" />
            ADD MODULE
          </Button>
        </div>

        {isAddingModule && (
          <div className="neo-box p-6 bg-white dark:bg-black">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter Module Title..."
                className="border-2 border-black font-bold h-12"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button className="neo-btn bg-black text-white" onClick={addModule}>SAVE MODULE</Button>
                <Button variant="ghost" className="font-bold underline" onClick={() => setIsAddingModule(false)}>CANCEL</Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {course.modules?.map((module: any, index: number) => (
            <div key={module.id} className="neo-box bg-white dark:bg-black overflow-hidden">
              <div className="border-b-2 border-black dark:border-white p-4 flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-4 flex-1">
                  <span className="flex items-center justify-center w-8 h-8 font-black border-2 border-black bg-white dark:bg-black dark:border-white text-sm">
                    {index + 1}
                  </span>
                  {editingModuleId === module.id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <Input
                        value={editingModuleTitle}
                        onChange={(e) => setEditingModuleTitle(e.target.value)}
                        className="border-2 border-black font-bold h-8"
                        autoFocus
                      />
                      <Button size="icon-sm" className="neo-btn h-8 w-8 p-0 border-2" onClick={() => updateModule(module.id)}>
                        <Check size={14} />
                      </Button>
                      <Button size="icon-sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingModuleId(null)}>
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-black uppercase tracking-tight">{module.title}</h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon-sm" onClick={() => {
                    setEditingModuleId(module.id);
                    setEditingModuleTitle(module.title);
                  }}>
                    <Pencil size={18} />
                  </Button>
                  <Button variant="outline" size="sm" className="neo-btn h-8 py-0" asChild>
                    <Link href={`/creator/courses/${courseId}/modules/${module.id}/lessons/new`}>
                      <PlusCircle size={14} className="mr-1" />
                      NEW LESSON
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteModule(module.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/10">
                {module.lessons?.length === 0 ? (
                  <p className="text-sm font-bold uppercase italic text-muted-foreground p-4 border-2 border-dashed border-black/20">
                    No lessons in this module.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {module.lessons?.map((lesson: any, lIdx: number) => (
                      <div key={lesson.id} className="flex items-center gap-4 p-4 border-2 border-black dark:border-white bg-white dark:bg-black hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all group">
                        <div className="flex items-center justify-center w-10 h-10 border-2 border-black dark:border-white bg-yellow-400 group-hover:bg-green-400 transition-colors">
                          <PlayCircle size={20} className="text-black" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-lg leading-tight uppercase tracking-tight">{lesson.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.duration && (
                              <Badge variant="outline" className="border-black font-bold text-[10px] uppercase truncate">
                                {Math.floor(lesson.duration / 60)} MINS
                              </Badge>
                            )}
                            {lesson.videoUrl && (
                              <Badge className="bg-blue-500 text-white font-bold text-[10px] uppercase border-2 border-black">VIDEO READY</Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" className="neo-btn h-10 font-black uppercase text-xs" asChild>
                          <Link href={`/creator/courses/${courseId}/modules/${module.id}/lessons/${lesson.id}`}>
                            EDIT LESSON
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
