import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeManagement } from '@/components/admin/EmployeeManagement'
import { TimesheetApproval } from '@/components/admin/TimesheetApproval'
import DepartmentManagement from '@/components/admin/DeparmentManagement'
import { currentUser } from '@/lib/auth'
import { getAllDepartments } from '@/actions/department'

export default async function SupervisorDashboard() {
  const user  = await currentUser();
  const departments = await getAllDepartments(user?.id ?? '');

  return (
    <div className="space-y-6 my-6 container mx-auto">
      <Card className="bg-gradient-to-r from-orange-400 to-pink-500">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Welcome, {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white">You have supervisor access. Manage your team efficiently.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments">Department Management</TabsTrigger>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheet Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentManagement departments={departments.departments ?? []} />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeeManagement />
        </TabsContent>
        <TabsContent value="timesheets">
          <TimesheetApproval />
        </TabsContent>
      </Tabs>
    </div>
  )
}

