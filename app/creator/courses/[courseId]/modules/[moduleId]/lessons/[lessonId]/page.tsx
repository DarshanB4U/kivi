"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, ArrowLeft, PlayCircle, Save, Trash2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const lessonSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
});

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const lessonId = params.lessonId as string;

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const res = await fetch(`/api/lessons`); 
      // Note: The existing API might need fetching all and filtering or we need a specific [id] endpoint.
      // Checking existing files showed app/api/lessons/[id]/route.ts exists.
      const lessonRes = await fetch(`/api/lessons/${lessonId}`);
      if (lessonRes.ok) {
        const data = await lessonRes.json();
        setFormData({ title: data.title, description: data.description || "" });
        setCurrentVideoUrl(data.videoUrl);
      }
    } catch (error) {
      console.error("Failed to fetch lesson", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToR2 = async (file: File) => {
    setProgress(10);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) throw new Error("Failed to get presigned URL");
    const { presignedUrl, publicUrl } = await res.json();
    
    setProgress(40);

    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    setProgress(80);
    if (!uploadRes.ok) throw new Error("Failed to upload video to R2");
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProgress(0);

    try {
      lessonSchema.parse(formData);

      let videoUrl = currentVideoUrl;
      if (file) {
        setIsUploading(true);
        videoUrl = await uploadToR2(file);
      }

      setProgress(90);
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to update lesson");
      
      setProgress(100);
      alert("Lesson updated successfully!");
      router.push(`/creator/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        alert((error as any).errors[0].message);
      } else {
        alert("Error saving lesson. Please check console.");
      }
      console.error(error);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const deleteLesson = async () => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/creator/courses/${courseId}`);
        router.refresh();
      }
    } catch {
      alert("Failed to delete lesson");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Link 
        href={`/creator/courses/${courseId}`} 
        className="inline-flex items-center text-sm font-black border-b-2 border-transparent hover:border-black dark:hover:border-white transition-all gap-1"
      >
        <ArrowLeft size={16} />
        BACK TO EDITOR
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Edit Lesson</h1>
          <p className="text-muted-foreground mt-2 font-bold uppercase tracking-widest text-xs">Update content and video</p>
        </div>
        <Button variant="ghost" className="text-destructive font-black uppercase text-xs items-center gap-1" onClick={deleteLesson}>
          <Trash2 size={14} />
          DELETE LESSON
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="neo-box p-8 bg-white dark:bg-black space-y-8">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-black uppercase text-xs tracking-widest">Lesson Title</Label>
            <Input
              id="title"
              className="border-2 border-black dark:border-white font-bold h-12"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Mastering Closures"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="font-black uppercase text-xs tracking-widest">Description</Label>
            <Textarea
              id="description"
              className="border-2 border-black dark:border-white font-bold min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief overview of this lesson..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="font-black uppercase text-xs tracking-widest">Video Content</Label>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase italic opacity-60">Current Video</span>
              {currentVideoUrl ? (
                <div className="neo-box aspect-video bg-muted relative group overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                    <PlayCircle size={48} className="text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="bg-green-400 text-black border-2 border-black font-black uppercase text-[10px]">ACTIVE VIDEO</Badge>
                  </div>
                </div>
              ) : (
                <div className="neo-box aspect-video bg-muted flex items-center justify-center border-dashed opacity-40">
                  <span className="font-black uppercase italic text-xs">No video assigned</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase italic opacity-60">Replace Video</span>
              <div className="neo-box aspect-video bg-yellow-400 flex flex-col items-center justify-center relative hover:bg-yellow-500 transition-colors cursor-pointer text-black">
                <input 
                  type="file" 
                  accept="video/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <UploadCloud size={32} />
                <span className="font-black uppercase text-xs mt-2 text-center px-4">
                  {file ? file.name : "DRAG NEW VIDEO HERE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="space-y-4 neo-box p-4 bg-indigo-50 dark:bg-indigo-950/30">
            <div className="flex items-center justify-between font-black uppercase text-[10px] tracking-widest text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> 
                UPLOADING NEW MEDIA...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-4 w-full bg-white dark:bg-black border-2 border-indigo-600 dark:border-indigo-400 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 shadow-[2px_0_0_0_rgba(0,0,0,0.1)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full neo-btn h-14 bg-black text-white dark:bg-white dark:text-black font-black text-lg uppercase tracking-widest"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              SAVING CHANGES...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              SAVE LESSON
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
