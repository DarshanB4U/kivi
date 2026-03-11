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
        <Button variant="outline" className="neo-btn gap-2 bg-yellow-400 text-black hover:bg-yellow-500">
          <Sparkles className="w-4 h-4" />
          AI COURSE ARCHITECT
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] neo-box rounded-none border-4 p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b-4 border-black dark:border-white bg-indigo-500 text-white">
          <DialogTitle className="flex items-center gap-2 text-3xl font-black uppercase italic tracking-tighter">
            <Sparkles className="w-8 h-8" />
            AI ARCHITECT
          </DialogTitle>
          <DialogDescription className="text-white/90 font-bold uppercase tracking-widest text-xs">
            Build your master syllabus in seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-black">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="topic" className="font-black uppercase text-xs tracking-widest">Master Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. ADVANCED REACT PATTERNS"
                className="border-2 border-black font-bold h-12"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audience" className="font-black uppercase text-xs tracking-widest">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g. SENIOR DEVELOPERS"
                className="border-2 border-black font-bold h-12"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateOutline} 
            disabled={isGenerating || !topic}
            className="w-full neo-btn h-14 bg-black text-white dark:bg-white dark:text-black font-black text-lg uppercase tracking-widest"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ARCHITECTING...
              </>
            ) : (
              "CONSTRUCT OUTLINE"
            )}
          </Button>

          {generatedOutline && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xl font-black uppercase italic border-b-4 border-black inline-block">Blueprint Found</h3>
              <div className="grid gap-6">
                {generatedOutline.modules.map((module, mIdx) => (
                  <div key={mIdx} className="neo-box p-4 border-2">
                    <h4 className="font-black text-lg flex items-center gap-2 uppercase tracking-tight">
                      <span className="flex items-center justify-center w-6 h-6 border-2 border-black bg-yellow-400 text-xs text-black">
                        {mIdx + 1}
                      </span>
                      {module.title}
                    </h4>
                    <div className="mt-4 space-y-2 border-l-2 border-black/10 pl-4 ml-3">
                      {module.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="text-sm font-bold opacity-70 flex items-start gap-2">
                          <span className="text-black/30">•</span>
                          {lesson.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t-4 border-black dark:border-white bg-muted/30">
          <Button variant="ghost" className="font-black uppercase text-xs underline" onClick={() => setIsOpen(false)}>
            ABANDON
          </Button>
          {generatedOutline && (
            <Button onClick={handleApply} className="neo-btn bg-green-400 text-black hover:bg-green-500 font-black uppercase tracking-widest">
              DEPLOY BLUEPRINT
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
