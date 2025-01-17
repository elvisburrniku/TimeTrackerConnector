'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/use-current-user'
import { EmployeeManagement } from '@/components/EmployeeManagement'
import { TimesheetApproval } from '@/components/TimesheetApproval'

export default function SupervisorDashboard() {
  const user  = useCurrentUser()

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

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheet Approval</TabsTrigger>
        </TabsList>
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

