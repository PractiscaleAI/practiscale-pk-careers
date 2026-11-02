"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "./preloader";

export default function RoutePreloader() {
  const pathname = usePathname();
  const [showHomeIntro, setShowHomeIntro] = useState(pathname === "/");

  useEffect(() => {
    if (pathname !== "/") setShowHomeIntro(false);
  }, [pathname]);

  return pathname === "/" && showHomeIntro ? <Preloader /> : null;
}
