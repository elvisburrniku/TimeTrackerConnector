'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const mockEmployees = [
  { id: 1, name: 'John Doe', department: 'Engineering', pay: '$25/hr' },
  { id: 2, name: 'Jane Smith', department: 'Marketing', pay: '$22/hr' },
  { id: 3, name: 'Bob Johnson', department: 'Sales', pay: '$20/hr' },
]

export function EmployeeManagement() {
  const [employees, setEmployees] = useState(mockEmployees)
  const [search, setSearch] = useState('')
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', pay: '' })

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(search.toLowerCase()) || 
    employee.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddEmployee = () => {
    setEmployees([...employees, { ...newEmployee, id: employees.length + 1 }])
    setNewEmployee({ name: '', department: '', pay: '' })
  }

  const handleRemoveEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  const handleChangePay = (id: number, newPay: string) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, pay: newPay } : emp))
  }

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
          <Dialog>
            <DialogTrigger asChild>
              <Button style={{backgroundColor: 'rgb(254, 159, 43)'}}>Add Employee</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    value={newEmployee.name} 
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Department</Label>
                  <Select 
                    onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pay" className="text-right">Pay Rate</Label>
                  <Input 
                    id="pay" 
                    value={newEmployee.pay} 
                    onChange={(e) => setNewEmployee({...newEmployee, pay: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g. $20/hr"
                  />
                </div>
              </div>
              <Button onClick={handleAddEmployee} style={{backgroundColor: 'rgb(254, 159, 43)'}}>Add Employee</Button>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Pay</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <Input 
                    value={employee.pay} 
                    onChange={(e) => handleChangePay(employee.id, e.target.value)}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveEmployee(employee.id)}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

