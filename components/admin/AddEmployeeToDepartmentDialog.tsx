import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Department, User, EmployeeDepartmentRole } from '@prisma/client';
import { addEmployeeToDepartment, removeEmployeeFromDepartment } from '@/actions/department';
import { searchUsers } from '@/data/user';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cx } from 'class-variance-authority';
import { Badge } from '../ui/badge';

interface AddEmployeeToDepartmentDialogProps {
    isOpen: boolean;
    department: Department;
    onOpenChange: (isOpen: boolean) => void;
}

interface HandleAddEmployeeParams {
    employeeId: string;
    role: EmployeeDepartmentRole;
    rate: number;
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


    const handleAddEmployee = async ({ employeeId, role, rate }: HandleAddEmployeeParams): Promise<void> => {
        if (!employeeId || !role || !rate) {
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
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to remove employee'
            })
        }
    }
    return (
        <div>
            <Dialog open={isOpen} onOpenChange={() => onOpenChange(false)} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Employee</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className='flex-1'>
                                <Label htmlFor="search" className="block mb-2">Search</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                    }}
                                    placeholder='email or name'
                                    className="w-full"
                                />
                            </div>
                            <Button onClick={() => handleSearch(search)} className='mt-5'
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                        {loading ? (
                            <div className="col-span-4 text-center">Loading...</div>
                        ) : (
                            <div className="col-span-4">
                                <h1
                                    className='text-lg font-semibold py-2'
                                >Users</h1>
                                <Separator />

                                {employees.length === 0 && <div className="text-center my-2">No employees found</div>}
                                {employees.map((employee) => (
                                    <div key={employee.id} className={cx("my-2 p-4 border rounded-lg shadow-sm", {
                                        'bg-gray-100': employee.departments.some((employeeDepartment) => employeeDepartment.departmentId === department.id),
                                        'bg-gray-200': employee.id === user?.id
                                    })}>
                                        <form key={employee.id} onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);

                                            handleAddEmployee({
                                                employeeId: employee.id,
                                                role: formData.get('role') as EmployeeDepartmentRole,
                                                rate: parseFloat(formData.get('rate') as string),
                                            });
                                        }}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <span className="font-medium text-lg">{employee.name}</span>
                                                    <br />
                                                    <span className="text-sm text-gray-500">{employee.email}</span>
                                                </div>
                                                <div className='flex gap-2'>
                                                {employee.departments.length > 0 && employee.departments.map((employeeDepartment) => (
                                                    <Badge key={employeeDepartment.id} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                                                        {employeeDepartment.departmentId === department.id ? 'Already in department' : 'In another department'}
                                                    </Badge>
                                                ))}

                                                {employee.id === user?.id && (
                                                    <Badge variant='destructive'>You</Badge>
                                                )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`role-${employee.id}`} className="block mb-1">Role</Label>
                                                        <select
                                                            id={`role-${employee.id}`}
                                                            name="role"
                                                            className="w-full p-2 border rounded-md"
                                                        >
                                                            {Object.values(EmployeeDepartmentRole).map((role) => (
                                                                <option key={role} value={role}>
                                                                    {role}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`rate-${employee.id}`} className="block mb-1">Rate</Label>
                                                        <Input
                                                            id={`rate-${employee.id}`}
                                                            name="rate"
                                                            type="number"
                                                            className="w-full p-2 border rounded-md"
                                                            step="0.01"
                                                            required
                                                            min={0}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    
                                                    {/* Remove from current department if exists */}
                                                    {employee.departments.some((employeeDepartment) => employeeDepartment.departmentId === department.id) ? (
                                                        <Button
                                                            onClick={() =>
                                                                handleRemoveEmployeeFromDepartment({
                                                                    employeeId: employee.id,
                                                                    departmentId: department.id,
                                                                })
                                                            }
                                                            className="ml-4"
                                                            variant={'destructive'}
                                                        >
                                                            Remove
                                                        </Button>
                                                    ) : <Button type="submit" className="ml-4">Add</Button>}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AddEmployeeToDepartmentDialog;
