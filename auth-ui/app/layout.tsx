import type { Metadata } from "next";
import "./globals.css";
import logo from "@/assets/logo.png";
import { Bot } from "lucide-react";
import { SparklesCore } from "@/components/sparkles";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
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
        <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
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
          <div className="relative z-10 top-0 left-0">
            <Navbar />
            {children}
            <Toaster richColors position="top-center" />
          </div>
        </main>
      </body>
    </html>
  );
}
