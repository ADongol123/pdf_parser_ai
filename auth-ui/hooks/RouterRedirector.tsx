// hooks/RouterRedirector.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const RouteRedirector = ({ children }: Props) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Delay execution to ensure localStorage is available
    const checkAuth = () => {
      const fileId = localStorage.getItem("fileId");
      const token = localStorage.getItem("access_token");

    //   if (fileId) {
    //     router.replace("/chat");
    //   } else if (token) {
    //     router.replace("/uploads");
    //   } else {
    //     setReady(true);
    //   }
    if(token){
        router.replace("/uploads");
    }
    };

    checkAuth();
  }, [router]);

  if (!ready) return null;

  return <>{children}</>;
};

export default RouteRedirector;
