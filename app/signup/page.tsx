import { SignupForm } from "@/components/auth/signup-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/jwt";

export default async function Signup() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const decoded = token ? (await verifyToken(token) as any) : null;

    if (decoded) {
        if (decoded.role === "CREATOR") {
            redirect("/creator/courses");
        } else if (decoded.role === "STUDENT") {
            redirect("/student/dashboard");
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="relative z-10 w-full max-w-md">
                <SignupForm />
            </div>
        </div>
    );
}

