"use client";

import { Button } from "@/components/ui/button";
import { Bot, Menu } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const showButton = ["/", "/login ", "/register"].includes(pathname);
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">PromptAI</span>
      </Link>

      {showButton && (
        <div className="hidden md:flex items-center space-x-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Get Started
          </Button>
        </div>
      )}

      <Button variant="ghost" size="icon" className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  );
}
