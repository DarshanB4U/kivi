"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UploadCloud, Loader2, ArrowLeft, PlayCircle, Save, Trash2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { HlsPlayer } from "@/components/video/hls-player";
import { uploadFileWithProgress } from "@/lib/upload/upload-file-with-progress";

const lessonSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
});

interface VideoRecord {
  id: string;
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
  hlsPlaylistKey?: string;
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  video?: VideoRecord;
}

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [videoRecord, setVideoRecord] = useState<VideoRecord | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchLesson = useCallback(async () => {
    try {
      const lessonRes = await fetch(`/api/lessons/${lessonId}`);
      if (lessonRes.ok) {
        const data: LessonData = await lessonRes.json();
        setFormData({ title: data.title, description: data.description || "" });
        setCurrentVideoUrl(data.videoUrl);
        if (data.video) {
          setVideoRecord(data.video);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lesson", error);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToR2 = async (file: File) => {
    setProgress(5);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        lessonId,
      }),
    });

    if (!res.ok) throw new Error("Failed to get presigned URL");
    const { presignedUrl, publicUrl, videoId } = await res.json();

    await uploadFileWithProgress({
      url: presignedUrl,
      file,
      contentType: file.type,
      onProgress: (uploadPercent) => {
        setProgress(5 + Math.round(uploadPercent * 0.8));
      },
    });

    // Signal upload complete — triggers transcoding
    if (videoId) {
      setProgress(85);
      await fetch(`/api/videos/${videoId}/upload-complete`, { method: "POST" });
      setVideoRecord({ id: videoId, status: "PROCESSING" });
    }
    
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
      toast.success("Lesson updated successfully!");
      router.push(`/creator/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error("Error saving lesson. Please check console.");
      }
      console.error(error);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const deleteLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/creator/courses/${courseId}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <Link 
          href={`/creator/courses/${courseId}`} 
          className="inline-flex items-center text-sm font-black uppercase tracking-widest hover:text-primary transition-all gap-2 group"
        >
          <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Abandon Editor
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10 font-bold rounded-full h-12 px-6 transition-all">
              <Trash2 size={18} className="mr-2" />
              Delete Lesson
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-card border-none rounded-[2rem] p-0 overflow-hidden max-w-md">
            <AlertDialogHeader className="p-8 pb-6 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trash2 className="text-destructive" size={32} />
                </div>
                <AlertDialogTitle className="text-2xl font-black tracking-tighter">TRASH LESSON?</AlertDialogTitle>
                <AlertDialogDescription className="text-base font-medium text-muted-foreground">
                  This action is irreversible. All student progress for this lesson will be lost.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="p-8 pt-0 flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="w-full rounded-full border-2 font-bold h-12">Abandon</AlertDialogCancel>
              <AlertDialogAction onClick={deleteLesson} className="w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold h-12 border-none">Confirm Destruction</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter leading-none">EDIT LESSON</h1>
        <p className="text-lg font-medium text-muted-foreground leading-relaxed">Refine your curriculum and enhance the student learning experience.</p>
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
                       placeholder="E.G. MASTERING CLOSURES"
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
                       placeholder="Provide a brief overview of this lesson..."
                    />
                  </div>
               </div>

               <div className="space-y-6">
                 <Label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Video Component</Label>
                 
                 <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Active Media</span>
                       {videoRecord?.status === "READY" && videoRecord?.id ? (
                       <div className="aspect-video rounded-[1.5rem] overflow-hidden shadow-2xl ring-1 ring-primary/10">
                          <HlsPlayer
                            videoId={videoRecord.id}
                            fallbackUrl={currentVideoUrl}
                          />
                       </div>
                       ) : videoRecord?.status === "PROCESSING" ? (
                       <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center rounded-[1.5rem] gap-4 border border-indigo-500/20">
                          <div className="relative">
                            <Loader2 size={48} className="animate-spin text-indigo-500" />
                            <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                          </div>
                          <Badge variant="secondary" className="bg-indigo-500 text-white border-none font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full shadow-lg shadow-indigo-500/20">
                            TRANSCODING MEDIA
                          </Badge>
                          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Processing Masterclass...</p>
                       </div>
                       ) : currentVideoUrl ? (
                       <div className="aspect-video bg-muted/30 relative group overflow-hidden rounded-[1.5rem] border border-primary/10 transition-all hover:ring-2 hover:ring-primary/20">
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                             <PlayCircle size={64} className="text-white drop-shadow-2xl" />
                          </div>
                          <div className="absolute top-4 right-4">
                             <Badge variant="secondary" className="bg-green-500 text-white border-none font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">Active</Badge>
                          </div>
                       </div>
                       ) : (
                       <div className="aspect-video bg-muted/20 flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-[1.5rem] gap-3">
                          <PlayCircle size={48} className="text-muted-foreground/20" />
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">No Media Assigned</span>
                       </div>
                       )}
                    </div>

                    <div className="space-y-3">
                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Replace Media</span>
                       <div className="aspect-video bg-primary/5 flex flex-col items-center justify-center relative hover:bg-primary/10 transition-all cursor-pointer border-2 border-dashed border-primary/20 rounded-[1.5rem] group overflow-hidden">
                       <input 
                          type="file" 
                          accept="video/*" 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={handleFileChange}
                       />
                       <div className="bg-background w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <UploadCloud size={32} className="text-primary" />
                       </div>
                       <div className="text-center px-6 mt-4 space-y-1">
                          <span className="block text-sm font-black uppercase tracking-widest text-foreground">
                             {file ? "File Selected" : "Click to Replace"}
                          </span>
                          <span className="block text-[10px] font-bold text-muted-foreground uppercase truncate max-w-[200px]">
                             {file ? file.name : "High-fidelity video only"}
                          </span>
                       </div>
                       </div>
                    </div>
                 </div>
               </div>

               {isUploading && (
               <div className="space-y-4 p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                     <span className="flex items-center gap-2">
                     <Loader2 size={14} className="animate-spin" /> 
                     Uploading Media Corridor...
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
               disabled={isSaving}
               className="w-full h-16 rounded-full font-black uppercase shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-lg tracking-widest"
               >
               {isSaving ? (
                  <>
                     <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                     Orchestrating Changes...
                  </>
               ) : (
                  <>
                     <Save className="mr-2 h-6 w-6" />
                     Save Lesson Masterpiece
                  </>
               )}
               </Button>
            </form>
         </CardContent>
      </Card>
    </div>
  );
}
