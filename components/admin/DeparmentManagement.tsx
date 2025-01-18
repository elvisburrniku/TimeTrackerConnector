'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle,  } from '@/components/ui/dialog'
import {  deleteDepartment,  getAllDepartments } from '@/actions/department'
import { Department } from '@prisma/client'
import { useCurrentUser } from '@/hooks/use-current-user'
import AddEmployeeToDepartmentDialog from './AddEmployeeToDepartmentDialog'
import { AddDepartmentDialog } from './AddDepartmentDialog'
import { useToast } from '@/hooks/use-toast'
import { ReloadIcon } from '@radix-ui/react-icons'

interface DepartmentManagementProps {
    departments: DepartmentViewInterface[]
}

export function DepartmentManagement({ departments: d }: DepartmentManagementProps) {
    const [departments, setDepartments] = useState(d);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
    const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false)
    const [isAddDepartmentDialogOpen, setIsAddDepartmentDialogOpen] = useState(false)
    const { toast } = useToast()
    const user = useCurrentUser()

   
    const filteredDepartments = departments.filter(department =>
        department.name.toLowerCase().includes(search.toLowerCase())
    )

    const reloadDepartments = async () => {
        if (!user || !user.id) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a department' })
            return
        }
    
        setLoading(true)
        const updatedDepartments = await getAllDepartments(user.id);
        setDepartments(updatedDepartments.departments ?? [])
        setLoading(false)
    }

    const handleRemoveDepartment = async (id: string) => {
        if (!user || user.id === undefined) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to remove a department'
            })
            return
        }
        try {
            const message = await deleteDepartment(user.id, id)
            if (message.error) {
                toast({ variant: 'destructive', title: 'Error', description: message.error })
                return
            }

            setDepartments(departments.filter(dept => dept.id !== id.toString()))
            setIsRemoveDialogOpen(false)
            toast({ title: 'Success', description: message.success })
        } catch {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove department' })
        }
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
                    <div className='flex gap-4'>
                    <Button onClick={reloadDepartments} variant={'outline'}><ReloadIcon /></Button>
                    <Button onClick={() => setIsAddDepartmentDialogOpen(true)}>Add Department</Button>
                    <AddDepartmentDialog
                        isOpen={isAddDepartmentDialogOpen}
                        setDepartments={setDepartments}
                        onClose={() => setIsAddDepartmentDialogOpen(false)}
                    />
                    </div>
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
                        {
                        loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className='text-center'>Loading...</TableCell>
                            </TableRow>
                        ) :
                        filteredDepartments.length === 0 ? (
                            <TableRow className=''>
                                <TableCell colSpan={5} className="text-center pt-4">No departments found</TableCell>
                            </TableRow>
                        ) :
                        filteredDepartments.map((department) => (
                            <TableRow key={department.id}>
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.employeeCount}</TableCell>
                                <TableCell>${department.totalCost.toString()}</TableCell>
                                <TableCell>{department.info}</TableCell>
                                <TableCell className='flex gap-4'>
                                    <Button size="sm" onClick={() => {setSelectedDepartment(department); setIsAddEmployeeDialogOpen(true)}}>Add Employee</Button>
                                    <Button variant="destructive" size="sm" onClick={() => { setSelectedDepartment(department); setIsRemoveDialogOpen(true); }}>Delete</Button>
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
                        <p>Are you sure you want to remove the department &quot;{selectedDepartment.name}&quot;?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleRemoveDepartment(selectedDepartment.id)}>Remove</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {selectedDepartment && (
                <AddEmployeeToDepartmentDialog department={selectedDepartment} isOpen={isAddEmployeeDialogOpen} onOpenChange={val => {
                    setIsAddEmployeeDialogOpen(val);
                    reloadDepartments();
                }
                } />
            )}
        </Card>
    )
}

export default DepartmentManagement;


export interface DepartmentViewInterface extends Department {
    employeeCount: number,
    totalCost: number
}