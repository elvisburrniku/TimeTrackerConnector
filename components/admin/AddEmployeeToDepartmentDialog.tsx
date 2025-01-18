import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Department, User, EmployeeDepartmentRole, UserRole } from '@prisma/client';
import { addEmployeeToDepartment, removeEmployeeFromDepartment } from '@/actions/department';
import { searchUsers } from '@/data/user';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Badge } from '../ui/badge';
import { Command, CommandEmpty, CommandInput } from '../ui/command';
import { LoadingSpinner } from '../ui/loading-spinner';
import { SearchCheckIcon, UserMinus, UserPlus } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

    const handleSearch = async (query: string) => {
        setLoading(true);
        // Replace with your actual search logic
        const response = await searchUsers(query);
        console.log(response);

        setEmployees(response ?? []);
        setLoading(false);
    };





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

                setEmployees(employees.filter((employee) => employee.id !== employeeId && employee.departments.some((employeeDepartment) => employeeDepartment.departmentId !== departmentId)))
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
            <DialogPortal>
                <DialogOverlay className="bg-background/80 backdrop-blur-sm" />
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Employee to {department.name}</DialogTitle>
                        <DialogDescription>
                            Search and add employees to this department
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Command className="rounded-lg border shadow-md">
                            <CommandInput
                                placeholder="Search employees..."
                                value={search}
                                onValueChange={setSearch}
                            />
                            <CommandEmpty>No employees found</CommandEmpty>
                            <Button
                                size="sm"
                                onClick={() => handleSearch(search)}
                                disabled={loading}
                                className="mx-4 my-2"
                            >
                                {loading ? (
                                    <LoadingSpinner/>
                                ) : (
                                    <SearchCheckIcon className="mr-2 h-4 w-4" />
                                )}
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </Command>

                        <ScrollArea className="h-[400px] rounded-md border">
                            {employees.map((employee) => (
                                <EmployeeCard
                                    key={employee.id}
                                    employee={employee}
                                    department={department}
                                    onAdd={handleAddEmployee}
                                    onRemove={handleRemoveEmployeeFromDepartment}
                                />
                            ))}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </DialogPortal>
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
                                {dept.departmentId === department.id ? 'Current' : 'Other'}
                            </Badge>
                        ))}
                        {employee.id === currentUser?.id && (
                            <Badge variant="destructive">You</Badge>
                        )}
                    </div>
                </div>

                <form
                    className="mt-4"
                    onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        onAdd({
                            employeeId: employee.id,
                            role: formData.get('role') as EmployeeDepartmentRole,
                            rate: parseFloat(formData.get('rate') as string)
                        })
                    }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Select name="role" defaultValue={EmployeeDepartmentRole.EMPLOYEE}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(EmployeeDepartmentRole).map((role) => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            name="rate"
                            type="number"
                            placeholder="Hourly rate"
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        {employee.departments.some(dept => dept.departmentId === department.id) ? (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => onRemove({ employeeId: employee.id, departmentId: department.id })}
                            >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        ) : (
                            <Button type="submit">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add to Department
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default AddEmployeeToDepartmentDialog;
