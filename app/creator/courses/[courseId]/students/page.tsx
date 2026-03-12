"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, Mail, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function EnrolledStudentsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(`/api/courses/${courseId}/students`);
        if (res.ok) setStudents(await res.json());
      } catch { console.error("Failed to fetch students"); }
      finally { setIsLoading(false); }
    }
    fetchStudents();
  }, [courseId]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">ENROLLED STUDENTS</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">Students who have enrolled in this course.</p>
      </div>

      {students.length === 0 ? (
        <Card className="border-4 border-dashed border-black dark:border-white rounded-none bg-gray-50 dark:bg-zinc-900 mt-8">
          <CardContent className="py-16 text-center space-y-4">
            <Users className="mx-auto text-black/30 dark:text-white/30" size={60} />
            <p className="text-xl font-black uppercase tracking-widest text-muted-foreground">NO STUDENTS ENROLLED YET.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-black mt-8">
          <CardContent className="p-0">
            <div className="divide-y-4 divide-black dark:divide-white">
              {students.map((enrollment: any) => (
                <div key={enrollment.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-6 hover:bg-yellow-400/10 dark:hover:bg-yellow-400/5 transition-colors">
                  <Avatar className="h-12 w-12 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-yellow-400">
                    <AvatarFallback className="text-lg font-black uppercase bg-yellow-400 text-black rounded-none">{enrollment.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-black uppercase truncate">{enrollment.user.name || "Anonymous"}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground truncate flex items-center gap-2 mt-1">
                      <Mail size={14} />{enrollment.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 text-[10px] rounded-none border-2 border-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-1.5 bg-white text-black sm:self-auto self-start mt-2 sm:mt-0">
                    <Calendar size={14} className="mr-2" />
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
