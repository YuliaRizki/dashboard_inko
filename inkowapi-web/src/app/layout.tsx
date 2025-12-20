import LayoutWrapper from "@/components/LayoutWrapper";
import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

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
      <body
        className={`${openSans.variable} ${montserrat.variable} antialiased overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-sans`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
