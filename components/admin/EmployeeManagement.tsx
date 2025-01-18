'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Department, EmployeeDepartment, User, EmployeeDepartmentRole } from '@prisma/client'
import {  getEmployessByDepartmentIds, removeEmployeeFromDepartment } from '@/actions/employees'
import { useToast } from '@/hooks/use-toast'
import { useCurrentUser } from '@/hooks/use-current-user'
import { ReloadIcon } from '@radix-ui/react-icons'
import { Separator } from '../ui/separator'



export interface EmployeeViewInterface extends User {
  departments: (EmployeeDepartment)[]
}

interface EmployeeManagementProps {
  employees: EmployeeViewInterface[]
  departments: Department[]
}

export function EmployeeManagement({ employees: _e, departments: _d }: EmployeeManagementProps) {
  const [employees, setEmployees] = useState(_e)
  const [departments] = useState(_d.map(dept => ({ ...dept, [dept.id]: dept })))
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const user = useCurrentUser()
  const [loading, setLoading] = useState(false)
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(search.toLowerCase()) ||
    employee.departments.some(dept => departments.find(d => d.id === dept.departmentId)?.name.toLowerCase().includes(search.toLowerCase()))
  )

 

  const reloadEmployee = async () => {
    if (!user || !user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add an employee',
      })

      return;
    }

    setLoading(true)
    const response = await getEmployessByDepartmentIds(user.id, departments.map(d => d.id))
    if ('employees' in response) {
      setEmployees(response.employees ?? [])
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      })
    }
    setLoading(false)
  }

  const handleRemoveEmployee = async (employeeId: string, departmentId: string) => {
    if (!user || !user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to remove an employee',
      })
      return
    }

    const response = await removeEmployeeFromDepartment(user.id, departmentId, employeeId.toString())
    if ('success' in response) {
      toast({
        title: 'Success',
        description: response.success,
      })
      setEmployees(employees.filter(emp => emp.id !== employeeId))
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      })
    }
  }

  const handleChangePay = async (employeeId: string, departmentId: string, pay: string, role: EmployeeDepartmentRole) => {
    if (!user || !user.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update an employee',
      })
    }

    console.log(employeeId, departmentId, pay, role)
  }

  console.log(employees)
  console.log(departments)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <Input
            placeholder="Search employees"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={reloadEmployee} variant={'outline'} disabled={loading}>
            {loading ? (
              <>
                <ReloadIcon />
                {' Reloading...'}
              </>
            ) : (
              <>
                <ReloadIcon />
                {' Reload Employees'}
              </>
            )}
          </Button>

        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role($Pay)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            )}

            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>{employee.name}</div>
                  <div
                    className='text-gray-500 text-xs'
                  >{employee.email}</div>
                </TableCell>
                <TableCell>{employee.departments.map(dept => departments.find(d => d.id === dept.departmentId)?.name).join(', ')}</TableCell>
                <TableCell>
                  {employee.departments.map(dept => (
                    <div key={dept.departmentId} className="mb-2 flex flex-col">
                      <Select
                        value={dept.role}
                      >
                        <SelectTrigger>
                          <SelectValue>{dept.role}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(EmployeeDepartmentRole).map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={Number(dept.hourlyRate).toString()}
                        onChange={(e) => handleChangePay(employee.id, dept.departmentId, e.target.value, dept.role)}
                        className="w-24"
                      />
                    </div>
                  ))}
                </TableCell>
                <TableCell className='flex flex-col space-y-2'>
                  {employee.departments.map(dept => (
                    <div key={dept.departmentId} className="mb-2 flex flex-col space-y-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveEmployee(employee.id, dept.departmentId)}
                      >
                        Remove from {departments.find(d => d.id === dept.departmentId)?.name}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangePay(employee.id, dept.departmentId, dept.hourlyRate.toString(), dept.role)}
                      >
                        Update Role at {departments.find(d => d.id === dept.departmentId)?.name}
                      </Button>

                    </div>
                  ))}
                  <Separator />
                  <div className='flex space-x-2 mt-2'>
                    <Button>View Schedule</Button>
                    <Button>View Weekly Timesheet</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}