import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session as any).role !== "CREATOR") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const lesson = await prisma.lesson.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session || (session as any).role !== "CREATOR") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.lesson.delete({
    where: { id }
  });

  return NextResponse.json({ message: "Lesson deleted successfully" });
}
