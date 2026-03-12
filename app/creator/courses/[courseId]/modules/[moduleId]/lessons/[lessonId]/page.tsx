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
      toast.success("Lesson updated successfully!");
      router.push(`/creator/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error((error as any).errors[0].message);
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
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
      <Link 
        href={`/creator/courses/${courseId}`} 
        className="inline-flex items-center text-sm font-black uppercase tracking-widest hover:text-blue-600 transition-all gap-1"
      >
        <ArrowLeft size={16} />
        ABANDON EDITOR
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">EDIT LESSON</h1>
          <p className="font-bold text-muted-foreground mt-2 text-sm uppercase tracking-widest">Update content and video</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="neo-btn rounded-none border-2 border-black bg-red-500 text-white font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all items-center gap-2 h-12">
              <Trash2 size={18} />
              DELETE LESSON
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="neo-box border-4 border-black rounded-none bg-white p-0 overflow-hidden text-black">
            <AlertDialogHeader className="bg-red-500 p-6 border-b-4 border-black text-white">
                <AlertDialogTitle className="font-black uppercase text-2xl tracking-tighter flex items-center gap-2"><Trash2 size={24} /> TRASH LESSON?</AlertDialogTitle>
                <AlertDialogDescription className="font-bold text-white/90 text-sm uppercase tracking-widest">
                  Warning: This will permanently eradicate this lesson.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="p-6 bg-gray-100">
              <AlertDialogCancel className="neo-btn rounded-none border-2 border-black font-black uppercase hover:bg-gray-200 text-black">ABANDON</AlertDialogCancel>
              <AlertDialogAction onClick={deleteLesson} className="neo-btn rounded-none border-2 border-black font-black uppercase bg-black text-white hover:opacity-80">CONFIRM DESTRUCTION</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none bg-white dark:bg-black">
         <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="space-y-6">
               <div className="grid gap-2">
                  <Label htmlFor="title" className="font-black uppercase text-xs tracking-widest">LESSON TITLE</Label>
                  <Input
                     id="title"
                     className="h-12 border-2 border-black rounded-none font-bold uppercase"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     placeholder="E.G. MASTERING CLOSURES"
                     required
                  />
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="description" className="font-black uppercase text-xs tracking-widest">DESCRIPTION (OPTIONAL)</Label>
                  <Textarea
                     id="description"
                     className="min-h-[160px] border-2 border-black rounded-none font-bold resize-y"
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     placeholder="Provide a brief overview of this lesson..."
                  />
               </div>
               </div>

               <div className="space-y-4">
               <Label className="font-black uppercase text-xs tracking-widest">VIDEO CONTENT</Label>
               
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">CURRENT VIDEO</span>
                     {currentVideoUrl ? (
                     <div className="aspect-video bg-muted relative group overflow-hidden border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                           <PlayCircle size={64} className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex justify-end">
                           <Badge className="bg-green-400 text-black border-2 border-black font-black uppercase tracking-widest text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none">ACTIVE VIDEO</Badge>
                        </div>
                     </div>
                     ) : (
                     <div className="aspect-video bg-gray-50 dark:bg-zinc-900 flex items-center justify-center border-4 border-dashed border-black/30 dark:border-white/30 rounded-none">
                        <span className="text-xs text-muted-foreground font-black uppercase tracking-widest">NO VIDEO ASSIGNED</span>
                     </div>
                     )}
                  </div>

                  <div className="space-y-2">
                     <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">REPLACE VIDEO</span>
                     <div className="aspect-video bg-yellow-400/10 flex flex-col items-center justify-center relative hover:bg-yellow-400/20 transition-colors cursor-pointer border-4 border-dashed border-black dark:border-white rounded-none">
                     <input 
                        type="file" 
                        accept="video/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                     />
                     <UploadCloud size={48} className="text-black dark:text-white" />
                     <span className="text-sm font-black uppercase tracking-widest mt-4 text-center px-4 text-black dark:text-white">
                        {file ? file.name : "CLICK OR DRAG TO REPLACE"}
                     </span>
                     </div>
                  </div>
               </div>
               </div>

               {isUploading && (
               <div className="space-y-4 p-4 rounded-none border-4 border-black bg-blue-100 dark:bg-blue-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-black dark:text-white tracking-widest">
                     <span className="flex items-center gap-2">
                     <Loader2 size={16} className="animate-spin" /> 
                     UPLOADING MEDIA...
                     </span>
                     <span>{progress}%</span>
                  </div>
                  <div className="h-4 w-full bg-white dark:bg-black border-2 border-black rounded-none overflow-hidden">
                     <div 
                     className="h-full bg-blue-500 transition-all duration-300" 
                     style={{ width: `${progress}%` }} 
                     />
                  </div>
               </div>
               )}

               <Button
               type="submit"
               disabled={isSaving}
               className="w-full h-14 neo-btn rounded-none border-2 border-black bg-yellow-400 text-black hover:bg-yellow-500 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all tracking-widest"
               >
               {isSaving ? (
                  <>
                     <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                     SAVING CHANGES...
                  </>
               ) : (
                  <>
                     <Save className="mr-2 h-6 w-6" />
                     SAVE LESSON
                  </>
               )}
               </Button>
            </form>
         </CardContent>
      </Card>
    </div>
  );
}
