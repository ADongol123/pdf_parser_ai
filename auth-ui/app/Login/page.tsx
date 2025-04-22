"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { LoginCredentials } from "@/lib/auth";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import { SparklesCore } from "@/components/sparkles";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials: LoginCredentials = { username, password };
      const { access_token, user_id } = await login(credentials);

      // Save the token if needed
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("userId", user_id);
      toast.success("🎉 Login Successfull");
      // Redirect on success
      router.push("/chat");
    } catch (error: any) {
      setStatus(error.message);
    }
  };

  return (
    <Card className="border-white bg-transparent ">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="border-black/20 focus-visible:ring-black"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Button
                type="button"
                variant="link"
                className="px-0 text-xs text-black/70 font-normal"
              >
                Forgot password?
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="border-black/20 focus-visible:ring-black pr-10"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2  border border-white bg-transparent rounded-r-md !text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-transparent cursor-pointer text-white hover:bg-white hover:text-black border border-white"
          >
            Sign in
          </Button>
        </CardFooter>
      </form> 
    </Card>
  );
}
