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
    // Get presigned URL
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
    
    return publicUrl;
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

      // 1. Upload Video
      const videoUrl = await uploadToR2(file);

      // 2. Save Lesson
      setProgress(90);
      const saveRes = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          moduleId,
          order: 0, // In standard implementation you'd calculate the actual order
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to save lesson");
      
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
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <Link 
        href={`/creator/courses/${courseId}`} 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-all gap-1"
      >
        <ArrowLeft size={16} />
        Back to Editor
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Lesson</h1>
        <p className="text-muted-foreground mt-2">Upload your video lesson and provide details below.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Getting Started"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will students learn in this specific lesson?"
              />
            </div>

            <div className="space-y-2">
               <Label>Video Content</Label>
               <div className="border border-dashed bg-muted/30 rounded-lg p-8 flex flex-col items-center justify-center relative hover:bg-muted/50 transition-colors">
                 <input 
                   type="file" 
                   accept="video/*" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   onChange={handleFileChange}
                 />
                 <UploadCloud size={40} className="text-muted-foreground mb-4" />
                 <h3 className="font-medium text-foreground text-center">
                   {file ? file.name : "Click or drag to upload video"}
                 </h3>
                 <p className="text-sm text-muted-foreground mt-1">MP4, WebM (Max 5GB)</p>
               </div>
            </div>

            {isUploading && (
              <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between text-sm font-medium text-primary">
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> 
                    Uploading...
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading}
              className="w-full h-12 text-base"
            >
              Save Lesson
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
