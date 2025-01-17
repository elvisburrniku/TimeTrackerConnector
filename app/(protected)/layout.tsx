import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import { Header } from "@/components/header/Header";
import { TimeEntryProvider } from "@/_context/TimeEntryContext";


interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();
  const user = await currentUser();


  return (
    <SessionProvider session={session}>
      <TimeEntryProvider>
        <body className="antialiased bg-yellow-50">
          <Header user={user ?? null} />
          {children}
        </body>
      </TimeEntryProvider>

    </SessionProvider>
  );
}
