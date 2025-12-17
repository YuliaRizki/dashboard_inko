import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InkoWapi Dashboard",
  description: "Financial Control Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)]">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
