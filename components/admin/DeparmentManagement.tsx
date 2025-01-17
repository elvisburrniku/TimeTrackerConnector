'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Department {
    id: number;
    name: string;
    totalEmployees: number;
    budget: number;
    otherInfo: string;
}

const mockDepartments: Department[] = [
    { id: 1, name: 'HR', totalEmployees: 10, budget: 50000, otherInfo: 'Handles recruitment and employee relations' },
    { id: 2, name: 'Engineering', totalEmployees: 25, budget: 200000, otherInfo: 'Develops and maintains products' },
    { id: 3, name: 'Sales', totalEmployees: 15, budget: 100000, otherInfo: 'Manages client relationships and sales' },
];

export function DepartmentManagement() {
    const [departments, setDepartments] = useState(mockDepartments)
    const [search, setSearch] = useState('')
    const [newDepartment, setNewDepartment] = useState({ name: '', totalEmployees: 0, budget: 0, otherInfo: '' })
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

    const filteredDepartments = departments.filter(department => 
        department.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddDepartment = () => {
        setDepartments([...departments, { ...newDepartment, id: departments.length + 1 }])
        setNewDepartment({ name: '', totalEmployees: 0, budget: 0, otherInfo: '' })
    }

    const handleRemoveDepartment = (id: number) => {
        setDepartments(departments.filter(dept => dept.id !== id))
        setIsRemoveDialogOpen(false)
    }

    const handleAddEmployee = (id: number) => {
        setDepartments(departments.map(dept => 
            dept.id === id ? { ...dept, totalEmployees: dept.totalEmployees + 1 } : dept
        ))
    }

    const handleRemoveEmployee = (id: number) => {
        setDepartments(departments.map(dept => 
            dept.id === id ? { ...dept, totalEmployees: dept.totalEmployees - 1 } : dept
        ))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Department Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex justify-between">
                    <Input 
                        placeholder="Search departments" 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button style={{backgroundColor: 'rgb(254, 159, 43)'}}>Add Department</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Department</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input 
                                        id="name" 
                                        value={newDepartment.name} 
                                        onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="totalEmployees" className="text-right">Total Employees</Label>
                                    <Input 
                                        id="totalEmployees" 
                                        type="number"
                                        value={newDepartment.totalEmployees} 
                                        onChange={(e) => setNewDepartment({...newDepartment, totalEmployees: parseInt(e.target.value)})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="budget" className="text-right">Budget</Label>
                                    <Input 
                                        id="budget" 
                                        type="number"
                                        value={newDepartment.budget} 
                                        onChange={(e) => setNewDepartment({...newDepartment, budget: parseInt(e.target.value)})}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="otherInfo" className="text-right">Other Info</Label>
                                    <Input 
                                        id="otherInfo" 
                                        value={newDepartment.otherInfo} 
                                        onChange={(e) => setNewDepartment({...newDepartment, otherInfo: e.target.value})}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddDepartment} style={{backgroundColor: 'rgb(254, 159, 43)'}}>Add Department</Button>
                        </DialogContent>
                    </Dialog>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Total Employees</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Other Info</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDepartments.map((department) => (
                            <TableRow key={department.id}>
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.totalEmployees}</TableCell>
                                <TableCell>${department.budget}</TableCell>
                                <TableCell>{department.otherInfo}</TableCell>
                                <TableCell className='flex gap-4'>
                                   <Button size="sm" onClick={() => handleRemoveEmployee(department.id)}>View/RemoveEmployee</Button>
                                    <Button variant="destructive" size="sm" onClick={() => { setSelectedDepartment(department); setIsRemoveDialogOpen(true); }}>Delete</Button>
                                    <Button size="sm" onClick={() => handleAddEmployee(department.id)}>Add Employee</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            {selectedDepartment && (
                <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Remove</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to remove the department "{selectedDepartment.name}"?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleRemoveDepartment(selectedDepartment.id)}>Remove</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    )
}

export default DepartmentManagement;