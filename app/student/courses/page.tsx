import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StudentCoursesList } from "@/components/student/student-courses-list";

function CoursesFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-muted-foreground" size={24} />
    </div>
  );
}

function getCourses() {
  return prisma.course.findMany({
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default function StudentCoursesPage() {
  const coursesPromise = getCourses();

  return (
    <Suspense fallback={<CoursesFallback />}>
      <StudentCoursesList coursesPromise={coursesPromise} />
    </Suspense>
  );
}
