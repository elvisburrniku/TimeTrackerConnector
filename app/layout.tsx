import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

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
  title: "Next Auth Template",
  description:
    "Next Auth Template using the Next Auth v5 (Auth.js), Prisma and much more",
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
          {children}
        </body>
      </SessionProvider>
    </html>
  )
}

