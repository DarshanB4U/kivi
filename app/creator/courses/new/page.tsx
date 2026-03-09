"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().int().nonnegative("Price must be a positive number"),
  thumbnail: z.string().optional(),
});

export default function NewCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", description: "", price: 0 });
  const [thumbnail, setThumbnail] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const { presignedUrl, publicUrl } = await res.json();
      await fetch(presignedUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setThumbnail(publicUrl);
    } catch { alert("Failed to upload thumbnail"); }
    finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const parsed = formSchema.parse({ ...formData, thumbnail });
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) { router.push("/creator/courses"); router.refresh(); }
      else { const d = await res.json(); alert(d.message || "Something went wrong"); }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const e: Record<string, string> = {};
        error.issues.forEach((err) => { if (err.path[0]) e[err.path[0].toString()] = err.message; });
        setErrors(e);
      }
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a new course</CardTitle>
          <CardDescription>Fill in the details to publish your course.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {thumbnail ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <Button variant="secondary" size="xs" className="absolute top-2 right-2" onClick={() => setThumbnail("")}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg border-2 border-dashed bg-muted/50 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                  {isUploading ? <Loader2 className="animate-spin text-muted-foreground" size={24} /> : (
                    <>
                      <UploadCloud className="text-muted-foreground" size={24} />
                      <span className="text-xs text-muted-foreground">Click to upload</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Advanced Next.js Patterns" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="What will students learn?" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min="0" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
