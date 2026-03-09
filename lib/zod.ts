import { z } from "zod";

export const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["STUDENT", "CREATOR"]),
});

export const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  price: z.number().int().nonnegative(),
});
