"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import React from "react";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/auth";

  if (isAuthPage) {
    return (
      <main className="w-full h-full min-h-screen bg-[var(--bg-main)]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen w-full relative">
      <Sidebar />
      <main className="flex-1 ml-80 mr-4 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
