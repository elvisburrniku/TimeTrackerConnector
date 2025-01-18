import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import { Header } from "@/components/header/Header";
import { TimeEntryProvider } from "@/_context/TimeEntryContext";
import { Toaster } from "@/components/ui/toaster";
import { getActiveTimeEntry, getUserTimeEntries } from "@/actions/time-entry";
import { Department, TimeEntry } from "@prisma/client";
import { getAllDepartmentsInfo, getPermittedDepartmentsInfo } from "@/actions/department";



interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth();
  const user = await currentUser();
  let currentEntry = null;
  let recentEntries: TimeEntry[] = [];
  let departments: Department[] = [];
  let permittedDepartments: Department[] = [];


  if (user && user.id) {
    await getActiveTimeEntry(user.id).then((entry) => {
      if (entry.data)
        currentEntry = entry.data;
    }
    );

    await getUserTimeEntries(user.id).then((entries) => {
      if (entries.data)
        recentEntries = entries.data
    });

    await getAllDepartmentsInfo().then((departments_resp) => {
      if (departments_resp && departments_resp.departments) {
        departments = departments_resp.departments;
      }
    });

    await getPermittedDepartmentsInfo(user.id).then((data) => {
      if (data && data.departments) {
        permittedDepartments = data.departments;
      }
    }
    );
  }

  return (
    <SessionProvider session={session}>
      <TimeEntryProvider currentEntry={currentEntry} recentEntries={recentEntries} departments={departments} permittedDepartments={permittedDepartments}>
        <body className="antialiased bg-yellow-50">
          <Header user={user ?? null} />
          {children}
        </body>
        <Toaster />
      </TimeEntryProvider>

    </SessionProvider>
  );
}
