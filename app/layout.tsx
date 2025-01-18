import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header/Header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TimeClock | Dinesh Chhantyal",
  description: "A time tracking application by Dinesh Chhantyal",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <html lang="en">
      <SessionProvider session={session}>

        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-yellow-50`}>
          <Toaster />
          <Header user={session?.user ?? null} />

          {children}
        </body>
      </SessionProvider>
    </html>
  )
}

