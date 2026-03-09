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
        <h1 className="text-2xl font-semibold tracking-tight">Enrolled Students</h1>
        <p className="text-sm text-muted-foreground mt-1">Students who have enrolled in this course.</p>
      </div>

      {students.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-2">
            <Users className="mx-auto text-muted-foreground/30" size={40} />
            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {students.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center gap-4 px-4 py-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{enrollment.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{enrollment.user.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail size={10} />{enrollment.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0 text-[10px]">
                    <Calendar size={10} className="mr-1" />
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
