import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const moduleSchema = z.object({
  title: z.string().min(3),
  courseId: z.string(),
  order: z.number().int().min(0),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "CREATOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = moduleSchema.parse(body);

    const module = await prisma.module.create({
      data,
    });

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
