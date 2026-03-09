"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { z } from "zod";

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
      alert("Please select a video file");
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
        alert((error as any).errors[0].message);
      } else {
        alert("Error uploading lesson. Please check console.");
      }
      console.error(error);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add New Lesson</h1>
        <p className="text-neutral-400 mt-2">Upload your video lesson</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-neutral-900 border border-neutral-800 p-8 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Lesson Title</label>
          <input
            type="text"
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Getting Started"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Description (Optional)</label>
          <textarea
            className="w-full bg-neutral-950 border border-neutral-700 rounded-md px-4 py-2 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What will students learn in this specific lesson?"
          />
        </div>

        <div className="border border-dashed border-neutral-700 bg-neutral-950/50 rounded-lg p-8 flex flex-col items-center justify-center relative hover:bg-neutral-900/50 transition-colors">
          <input 
            type="file" 
            accept="video/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          <UploadCloud size={40} className="text-indigo-400 mb-4" />
          <h3 className="font-medium">
            {file ? file.name : "Click or drag to upload video"}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">MP4, WebM (Max 5GB)</p>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-indigo-400">
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> 
                Uploading...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          Save Lesson
        </button>
      </form>
    </div>
  );
}
