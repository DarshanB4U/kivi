"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Trash2, PlayCircle, Loader2, Share2, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/creator/courses"><ArrowLeft size={14} className="mr-1" />Back to courses</Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
          <p className="text-sm text-muted-foreground max-w-xl">{course.description}</p>
          <Badge variant="secondary" className="mt-2">${course.price}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/creator/courses/${courseId}/students`}><Users size={14} className="mr-1" />Students</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/student/courses/${courseId}`);
            alert("Link copied!");
          }}>
            <Share2 size={14} className="mr-1" />Share
          </Button>
        </div>
      </div>

      <Separator />

      {/* Modules */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Modules</h2>
          <Button size="sm" variant="outline" onClick={() => setIsAddingModule(!isAddingModule)}>
            <PlusCircle size={14} className="mr-1" />Add Module
          </Button>
        </div>

        {isAddingModule && (
          <Card>
            <CardContent className="flex gap-3 pt-4">
              <Input
                placeholder="Module title"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                autoFocus
              />
              <Button onClick={addModule}>Save</Button>
              <Button variant="ghost" onClick={() => setIsAddingModule(false)}>Cancel</Button>
            </CardContent>
          </Card>
        )}

        {course.modules?.length === 0 && !isAddingModule ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No modules yet. Click "Add Module" to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {course.modules?.map((module: any, index: number) => (
              <Card key={module.id}>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-md bg-muted text-xs font-medium">{index + 1}</span>
                    <CardTitle>{module.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/creator/courses/${courseId}/modules/${module.id}/lessons/new`}>
                        <PlusCircle size={14} className="mr-1" />Lesson
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => deleteModule(module.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {module.lessons?.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No lessons yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {module.lessons?.map((lesson: any, lIdx: number) => (
                        <div key={lesson.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                          <PlayCircle size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{lIdx + 1}. {lesson.title}</span>
                          {lesson.duration && (
                            <span className="ml-auto text-xs text-muted-foreground">{Math.floor(lesson.duration / 60)}m</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
