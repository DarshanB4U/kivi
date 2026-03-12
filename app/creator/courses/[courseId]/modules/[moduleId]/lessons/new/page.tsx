"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const lessonSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
});



export default function NewLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToR2 = async (file: File) => {
    setProgress(10);
    // Get presigned URL (no lessonId yet since lesson doesn't exist)
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    });

    if (!res.ok) throw new Error("Failed to get presigned URL");
    const { presignedUrl, publicUrl, videoId } = await res.json();
    
    setProgress(40);

    // Upload directly to R2
    const uploadRes = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    setProgress(80);

    if (!uploadRes.ok) throw new Error("Failed to upload video to R2");
    
    return { publicUrl, videoId };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    try {
      setIsUploading(true);
      lessonSchema.parse(formData);

      // 1. Upload Video to R2
      const { publicUrl: videoUrl, videoId } = await uploadToR2(file);

      // 2. Save Lesson
      setProgress(85);
      const saveRes = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          moduleId,
          order: 0,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save lesson");
      const lesson = await saveRes.json();

      // 3. Link video to lesson and trigger transcoding
      if (videoId && lesson.id) {
        setProgress(90);
        // Link the video to the newly created lesson
        await fetch(`/api/videos/${videoId}/link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson.id }),
        });
        
        // Trigger transcoding
        setProgress(95);
        await fetch(`/api/videos/${videoId}/upload-complete`, { method: "POST" });
      }
      
      setProgress(100);
      router.push(`/creator/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error((error as any).errors[0].message);
      } else {
        toast.error("Error uploading lesson. Please check console.");
      }
      console.error(error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link 
        href={`/creator/courses/${courseId}`} 
        className="inline-flex items-center text-sm font-black uppercase tracking-widest hover:text-primary transition-all gap-2 group"
      >
        <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
          <ArrowLeft size={16} />
        </div>
        Back to Editor
      </Link>

      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter leading-none">NEW LESSON</h1>
        <p className="text-lg font-medium text-muted-foreground leading-relaxed">Expand your course with fresh interactive content.</p>
      </div>

      <Card className="border-none glass-card rounded-[2.5rem] bg-background/50 backdrop-blur-xl shadow-2xl">
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid gap-8">
              <div className="grid gap-3">
                <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-primary ml-1">Lesson Title</Label>
                <Input
                  id="title"
                  className="h-14 bg-muted/30 border-none font-bold text-xl rounded-2xl px-6 focus-visible:ring-primary/20 shadow-inner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Masterclass Foundations"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-primary ml-1">Description (Optional)</Label>
                <Textarea
                  id="description"
                  className="min-h-[160px] bg-muted/30 border-none font-medium text-lg rounded-2xl p-6 focus-visible:ring-primary/20 resize-none shadow-inner leading-relaxed"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will students learn in this specific lesson?"
                />
              </div>
            </div>

            <div className="space-y-6">
               <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Video Component</Label>
               <div className="aspect-video bg-primary/5 flex flex-col items-center justify-center relative hover:bg-primary/10 transition-all cursor-pointer border-2 border-dashed border-primary/20 rounded-[2.5rem] group overflow-hidden">
                 <input 
                   type="file" 
                   accept="video/*" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   onChange={handleFileChange}
                 />
                 <div className="bg-background w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <UploadCloud size={32} className="text-primary" />
                 </div>
                 <div className="text-center px-6 mt-4 space-y-2">
                   <h3 className="text-lg font-bold tracking-tight text-foreground">
                     {file ? "Media Captured" : "Click to Upload Masterclass"}
                   </h3>
                   <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                     {file ? file.name : "MP4, WebM (Max 5GB)"}
                   </p>
                 </div>
               </div>
            </div>

            {isUploading && (
              <div className="space-y-4 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> 
                    Conducting Media Upload...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-indigo-500/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full h-16 rounded-full font-black uppercase shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-lg tracking-widest"
            >
              Construct Lesson
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

