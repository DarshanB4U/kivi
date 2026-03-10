"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface Lesson {
  title: string;
  description: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface AICourseArchitectProps {
  onApply: (data: { title: string; description: string; modules: Module[] }) => void;
}

export function AICourseArchitect({ onApply }: AICourseArchitectProps) {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<{ modules: Module[] } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateOutline = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setGeneratedOutline(null);

    try {
      const res = await fetch("/api/ai/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      setGeneratedOutline(data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate course outline. Please check your API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedOutline) return;
    
    // Simple description generation from topic/audience
    const description = `This course covers ${topic} for ${audience || "all levels"}.`;
    
    onApply({
      title: topic,
      description,
      modules: generatedOutline.modules,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 hover:border-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Course Architect
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Course Architect
          </DialogTitle>
          <DialogDescription>
            Generate a full course structure in seconds. Just tell us what you want to teach.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic">What is the course about?</Label>
            <Input
              id="topic"
              placeholder="e.g. Master Next.js 15 & Server Components"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="audience">Who is it for? (Optional)</Label>
            <Input
              id="audience"
              placeholder="e.g. JavaScript developers looking to learn Next.js"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateOutline} 
            disabled={isGenerating || !topic}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Architecting your course...
              </>
            ) : (
              "Generate Outline"
            )}
          </Button>

          {generatedOutline && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <ScrollArea className="h-[400px] w-full p-4">
                <div className="space-y-6">
                  {generatedOutline.modules.map((module, mIdx) => (
                    <div key={mIdx} className="space-y-3">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs">
                          {mIdx + 1}
                        </span>
                        {module.title}
                      </h3>
                      <div className="grid gap-2 pl-8">
                        {module.lessons.map((lesson, lIdx) => (
                          <Card key={lIdx} className="bg-muted/30 border-none shadow-none">
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm">{lesson.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.description}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 bg-muted/50 border-t flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setGeneratedOutline(null)}>
                  Clear
                </Button>
                <Button onClick={handleApply}>
                  Use This Outline
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
