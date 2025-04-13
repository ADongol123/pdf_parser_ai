"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { RegisterCredentials } from "@/lib/auth";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type RegisterFormProps = {
  onSuccess?: () => void;
};
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials: RegisterCredentials = { username, password, email };
      const { message } = await register(credentials);
      toast.success("🎉 Registered successfully!");
      // Redirect on success
      onSuccess?.();
    } catch (error: any) {
      setStatus(error.message);
    }
  };

  return (
    <Card className="border-white bg-transparent ">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              className="border-black/20 focus-visible:ring-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email" className="text-white">
              Email
            </Label>
            <Input
              id="register-email"
              type="email"
              placeholder="name@example.com"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="border-black/20 focus-visible:ring-black"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password" className="text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border-black/20 focus-visible:ring-black pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-black/70"
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
            Create account
          </Button>
          <p className="text-xs text-center text-gray-500">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
