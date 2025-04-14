import type { Metadata } from "next";
import "./globals.css";
import logo from "@/assets/logo.png";
import { Bot } from "lucide-react";
import { SparklesCore } from "@/components/sparkles";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import Link from "next/link";


export const metadata: Metadata = {
  title: "PromptAI",
  description: "Created with v0",
  generator: "v0.dev",
  icons: {
    icon: "../public/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />
        </div> */}

        <main className="h-full bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
          {/* Navbar */}
          <Link
            href="/"
            className="flex gap-2 items-center px-4 text-white bg-transparent w-fit p-2" 
          >
            <Bot className="w-8 h-8 text-purple-500" />
            <span className="text-white font-medium text-xl">PromptAI</span>
          </Link>
          {/* Background Sparkles */}
          <div className="h-full w-full absolute inset-0 z-1">
            <SparklesCore
              id="tsparticlesfullpage"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full ">
            {/* Ensure content starts below navbar */}
            {children}
            <Toaster richColors position="top-center" />
          </div>
        </main>
      </body>
    </html>
  );
}
