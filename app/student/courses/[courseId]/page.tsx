"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  PlayCircle, CheckCircle, Circle, ChevronDown, ChevronRight,
  Loader2, MessageSquare, Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progressData, setProgressData] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchCourse(); }, [courseId]);
  useEffect(() => { if (activeLesson) fetchComments(); }, [activeLesson]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        const initial: Record<string, boolean> = {};
        if (data.modules?.[0]) {
          initial[data.modules[0].id] = true;
          if (data.modules[0].lessons?.[0]) setActiveLesson(data.modules[0].lessons[0]);
        }
        setExpandedModules(initial);
      }
    } catch { console.error("Failed to fetch course"); }
    finally { setIsLoading(false); }
  };

  const fetchComments = async () => {
    if (!activeLesson) return;
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?lessonId=${activeLesson.id}`);
      if (res.ok) setComments(await res.json());
    } catch { console.error("Failed to fetch comments"); }
    finally { setIsLoadingComments(false); }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeLesson) return;
    setIsPostingComment(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, lessonId: activeLesson.id }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch { toast.error("Failed to post comment"); }
    finally { setIsPostingComment(false); }
  };

  const toggleModule = (id: string) => setExpandedModules((p) => ({ ...p, [id]: !p[id] }));

  const markCompleted = async (lessonId: string, completed: boolean) => {
    setProgressData((p) => ({ ...p, [lessonId]: completed }));
    try {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed }),
      });
    } catch {
      setProgressData((p) => ({ ...p, [lessonId]: !completed }));
      toast.error("Failed to save progress");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;
  if (!course) return <p className="text-center py-12 text-muted-foreground">Course not found.</p>;

  // Enrollment CTA
  const handleEnroll = async () => {
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) { toast.success("Enrolled successfully!"); fetchCourse(); }
      else { const d = await res.json(); toast.error(d.message || "Enrollment failed"); }
    } catch { toast.error("Something went wrong"); }
  };

  if (!course.isEnrolled) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <PlayCircle className="mx-auto text-muted-foreground" size={48} />
            <div>
              <h1 className="text-2xl font-semibold">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{course.description}</p>
            </div>
            <Button size="lg" onClick={handleEnroll}>Enroll for ${course.price}</Button>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Modules</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {course.modules?.map((m: any, i: number) => (
                <div key={m.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-6 h-6 flex items-center justify-center rounded-md bg-muted text-xs font-medium">{i + 1}</span>
                  {m.title}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>What's included</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" />Full lifetime access</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" />Certificate of completion</div>
              <div className="flex items-center gap-2"><CheckCircle size={14} className="text-primary" />Community support</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Player
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main */}
      <div className="flex-1 space-y-4">
        <div className="aspect-video bg-black rounded-xl overflow-hidden border">
          {activeLesson ? (
            <video src={activeLesson.videoUrl} controls controlsList="nodownload" className="w-full h-full object-contain" onEnded={() => markCompleted(activeLesson.id, true)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
              <PlayCircle size={40} />
              <p className="text-sm">Select a lesson to start</p>
            </div>
          )}
        </div>

        {activeLesson && (
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{activeLesson.title}</CardTitle>
              <Button
                variant={progressData[activeLesson.id] ? "default" : "outline"}
                size="sm"
                onClick={() => markCompleted(activeLesson.id, !progressData[activeLesson.id])}
              >
                {progressData[activeLesson.id] ? <CheckCircle size={14} className="mr-1" /> : <Circle size={14} className="mr-1" />}
                {progressData[activeLesson.id] ? "Completed" : "Mark complete"}
              </Button>
            </CardHeader>
            {activeLesson.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{activeLesson.description}</p>
              </CardContent>
            )}
          </Card>
        )}

        {/* Comments */}
        {activeLesson && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={16} />
                Discussion ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={postComment} className="space-y-3">
                <Textarea
                  placeholder="Add a comment or question..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button size="sm" disabled={isPostingComment || !newComment.trim()}>
                    {isPostingComment ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Send size={14} className="mr-1" />}
                    Post
                  </Button>
                </div>
              </form>

              <Separator />

              {isLoadingComments ? (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-muted-foreground" size={20} /></div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Start the conversation.</p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c: any) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">{c.user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{c.user.name || "User"}</span>
                          <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <Card className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
          <CardHeader className="border-b pb-3">
            <CardTitle className="line-clamp-1 text-sm">{course.title}</CardTitle>
            <p className="text-xs text-muted-foreground">Course content</p>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {course.modules?.map((mod: any, mIdx: number) => (
              <div key={mod.id} className="border-b last:border-0">
                <button onClick={() => toggleModule(mod.id)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Module {mIdx + 1}</p>
                    <p className="text-sm font-medium truncate">{mod.title}</p>
                    <p className="text-xs text-muted-foreground">{mod.lessons?.length || 0} lessons</p>
                  </div>
                  {expandedModules[mod.id] ? <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />}
                </button>
                {expandedModules[mod.id] && (
                  <div className="border-t">
                    {mod.lessons?.length === 0 ? (
                      <p className="p-3 text-xs text-muted-foreground italic">No lessons</p>
                    ) : (
                      mod.lessons?.map((lesson: any, lIdx: number) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isDone = progressData[lesson.id];
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}`}
                          >
                            {isDone ? <CheckCircle size={14} className="text-primary flex-shrink-0" /> : isActive ? <PlayCircle size={14} className="text-primary flex-shrink-0" /> : <PlayCircle size={14} className="text-muted-foreground/50 flex-shrink-0" />}
                            <span className={`text-sm truncate ${isActive ? "font-medium" : "text-muted-foreground"}`}>{lIdx + 1}. {lesson.title}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
