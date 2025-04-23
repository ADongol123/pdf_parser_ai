"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/app/Login/page";
import { RegisterForm } from "@/app/Register/page";

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState("login");


  useEffect(() =>{
    if (localStorage.getItem("access_token")) {
      router.replace("/upload");
    }
    else{
      router.replace("/")
    }
  },[])
  return (
    
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-sm text-white">
            Sign in to your account or create a new one
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border border-white">
            <TabsTrigger
              className="text-white data-[state=active]:text-black"
              value="login"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              className="text-white data-[state=active]:text-black"
              value="register"
            >
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onSuccess={() => setTab("login")} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
