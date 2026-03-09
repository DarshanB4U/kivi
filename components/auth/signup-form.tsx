"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export function SignupForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"STUDENT" | "CREATOR">("STUDENT");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Signup failed");
                return;
            }

            alert("Signup successful!");
            if (data.user?.role === "CREATOR") {
                router.push("/creator/courses");
            } else {
                router.push("/student/dashboard");
            }
            router.refresh();
        } catch (error) {
            alert("An error occurred during signup");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-background/60 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight">Create an account</CardTitle>
                <CardDescription>
                    Enter your email below to create your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="role">I am a...</Label>
                        <Tabs defaultValue="STUDENT" onValueChange={(v) => setRole(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="STUDENT">Student</TabsTrigger>
                                <TabsTrigger value="CREATOR">Creator</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-muted/50 border-none focus-visible:ring-primary"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-muted/50 border-none focus-visible:ring-primary"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full h-11 text-lg font-medium transition-all hover:scale-[1.02]" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => router.push("/signin")}>
                            Sign in
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
