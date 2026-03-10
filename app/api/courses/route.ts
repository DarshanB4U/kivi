import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  thumbnail: z.string().optional(),
  modules: z.array(
    z.object({
      title: z.string(),
      lessons: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
        })
      ),
    })
  ).optional(),
});

export async function GET() {
  const courses = await prisma.course.findMany({
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

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || (session as any).role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, price, thumbnail, modules } = courseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price,
        thumbnail,
        creatorId: (session as any).id,
        modules: modules ? {
          create: modules.map((module, mIdx) => ({
            title: module.title,
            order: mIdx,
            lessons: {
              create: module.lessons.map((lesson, lIdx) => ({
                title: lesson.title,
                description: lesson.description,
                order: lIdx,
                videoUrl: "", // Placeholder for AI generated outline
              })),
            },
          })),
        } : undefined,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("Course Creation Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
