import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import MainNav from "@/components/navigation/mainNav";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artist Management System",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center" richColors />
        <QueryProvider>
          <AuthProvider>
          <MainNav />
            <Suspense fallback={<>Error Occured.</>}>
            {children}
            </Suspense>

          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


