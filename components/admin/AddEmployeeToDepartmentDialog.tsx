import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Department, User, EmployeeDepartmentRole } from '@prisma/client';
import { addEmployeeToDepartment, removeEmployeeFromDepartment } from '@/actions/department';
import { searchUsers } from '@/data/user';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '../ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput } from '../ui/command';
import { LoadingSpinner } from '../ui/loading-spinner';
import { SearchCheckIcon, UserMinus, UserPlus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDebouncedCallback } from 'use-debounce';

interface AddEmployeeToDepartmentDialogProps {
    isOpen: boolean;
    department: Department;
    onOpenChange: (isOpen: boolean) => void;
}

interface HandleAddEmployeeParams {
    employeeId: string;
    role: EmployeeDepartmentRole;
    rate: number;
    position?: string;
}

interface UserWithDepartments extends User {
    departments: {
        id: string;
        departmentId: string;
    }[];
}

const AddEmployeeToDepartmentDialog = ({ isOpen, department, onOpenChange }: AddEmployeeToDepartmentDialogProps) => {
    const [employees, setEmployees] = useState<UserWithDepartments[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();
    const user = useCurrentUser();



    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query.trim()) {
            setEmployees([])
            return
        }
        setLoading(true)
        try {
            const users = await searchUsers(query)
            setEmployees(users || [])
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to search employees'
            })
        } finally {
            setLoading(false)
        }
    }, 500)

    useEffect(() => {
        debouncedSearch(search)

    }, [search])


    const handleAddEmployee = async ({ employeeId, role, rate, position }: HandleAddEmployeeParams): Promise<void> => {
        if (!employeeId || !role || !rate || !position) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Please fill all fields',
            })
            return;
        }

        if (!user || !user.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to add an employee',
            })
            return;
        }

        const response = await addEmployeeToDepartment(user.id, department.id, employeeId, role, rate);
        if ('success' in response) {
            toast({
                title: 'Success',
                description: response.success,
            })
            onOpenChange(false);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: response.error,
            })
        }
    };

    const handleRemoveEmployeeFromDepartment = async ({ employeeId, departmentId }: { employeeId: string, departmentId: string }) => {
        if (!user || !user.id) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to remove an employee',
            })
            return;
        }

        try {
            const updatedDepartment = await removeEmployeeFromDepartment(user.id, departmentId, employeeId)
            if (updatedDepartment.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: updatedDepartment.error
                })

                return
            }

            if (updatedDepartment.success) {

                setEmployees(employees.filter((employee) => 
                    employee.id !== employeeId || 
                    !employee.departments.some((employeeDepartment) => employeeDepartment.departmentId === departmentId)
                ))
                toast({
                    title: 'Success',
                    description: updatedDepartment.success
                })
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to remove employee'
            })
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Employee to {department.name}</DialogTitle>
                    <DialogDescription>
                        Search employees by name or email
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                        {loading && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>

                    {search && (
                        <ScrollArea className="h-[400px] rounded-md border">
                            {employees.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No employees found
                                </div>
                            ) : (
                                <div className="p-2">
                                    {employees.map((employee) => (
                                        <EmployeeCard
                                            key={employee.id}
                                            employee={employee}
                                            department={department}
                                            onAdd={handleAddEmployee}
                                            onRemove={handleRemoveEmployeeFromDepartment}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    )}

                    {!search && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Enter a name or email to search
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

interface EmployeeCardProps {
    employee: UserWithDepartments;
    department: Department;
    onAdd: (params: HandleAddEmployeeParams) => void;
    onRemove: (params: { employeeId: string, departmentId: string }) => void;
}

// Separate Employee Card Component for better organization
const EmployeeCard = ({
    employee,
    department,
    onAdd,
    onRemove
}: EmployeeCardProps) => {
    const currentUser = useCurrentUser();

    return (
        <Card className="m-2">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {employee.departments.map((dept) => (
                            <Badge
                                key={dept.id}
                                variant={dept.departmentId === department.id ? "default" : "secondary"}
                            >
                                {dept.departmentId === department.id ? 'Employee' : 'Other Department'}
                            </Badge>
                        ))}
                        {employee.id === currentUser?.id && (
                            <Badge variant="destructive">You</Badge>
                        )}
                    </div>
                </div>

                <div className="mt-4 space-y-6">
                    {employee.departments.some(dept => dept.departmentId === department.id) ? (
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                            <div className="text-sm text-muted-foreground">
                                Already a member of this department
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => onRemove({ employeeId: employee.id, departmentId: department.id })}
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    ) : (
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault()
                                const formData = new FormData(e.currentTarget)
                                onAdd({
                                    employeeId: employee.id,
                                    role: formData.get('role') as EmployeeDepartmentRole,
                                    rate: parseFloat(formData.get('rate') as string),
                                    position: formData.get('position') as string
                                })
                            }}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <Select name="role" defaultValue={EmployeeDepartmentRole.EMPLOYEE}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(EmployeeDepartmentRole).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0) + role.slice(1).toLowerCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Position</label>
                                    <Input
                                        name="position"
                                        placeholder="e.g., Senior Developer"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium">Hourly Rate ($)</label>
                                    <Input
                                        name="rate"
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="w-full sm:w-auto">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add to Department
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default AddEmployeeToDepartmentDialog;