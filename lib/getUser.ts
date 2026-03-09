import { Role } from "@/app/generated/prisma/enums";

export function getUser(req: Request) {
  return {
    userId: req.headers.get("x-user-id"),
    role: req.headers.get("x-user-role") as Role,
  };
}
