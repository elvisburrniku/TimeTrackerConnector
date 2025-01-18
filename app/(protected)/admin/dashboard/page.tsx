import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeeViewInterface, EmployeeManagement } from '@/components/admin/EmployeeManagement'
import DepartmentManagement, { DepartmentViewInterface } from '@/components/admin/DeparmentManagement'
import { currentUser } from '@/lib/auth'
import { getAllDepartments } from '@/actions/department'
import { getEmployessByDepartmentIds } from '@/actions/employees'

export default async function SupervisorDashboard() {
  const user  = await currentUser();
  let departments: DepartmentViewInterface[] = [];
  let employees: EmployeeViewInterface[] = [];


  if (user && user.id) {
    const departments_resp = await getAllDepartments(user.id);
    if (departments_resp && departments_resp.departments) {
      departments = departments_resp.departments;
    }
  }
  if (departments && departments.length > 0) {
    const employees_resp = (await getEmployessByDepartmentIds(user?.id ?? '', departments.map(department => department.id)));
    if (employees_resp && employees_resp.employees) {
      employees = employees_resp.employees;
    }    
  }


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
        </TabsList>

        <TabsContent value="departments">
          <DepartmentManagement departments={departments ?? []} />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeeManagement employees={employees} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

