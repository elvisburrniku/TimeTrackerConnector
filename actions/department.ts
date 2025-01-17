"use server";

import { departmentService } from "@/services/DepartmentService";
import { EmployeeDepartmentRole } from "@prisma/client";

export const createDepartment = async (userId: string, name: string, info?: string) => {
  const department = await departmentService.createDepartment(userId, name, info);
  if (department) {
    return { success: "Department created successfully!" };
  } else {
    return { error: "Failed to create department." };
  }
};

export const deleteDepartment = async (userId: string, id: string) => {
  const department = await departmentService.deleteDepartment(userId, id);
  if (department) {
    return { success: "Department deleted successfully!" };
  } else {
    return { error: "Failed to delete department." };
  }
};

export const addEmployeeToDepartment = async (userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole, rate: number) => {
  const employee = await departmentService.addEmployeeToDepartment(userId, departmentId, employeeId, role, rate);
  if (employee) {
    return { success: "Employee added to department successfully!" };
  } else {
    return { error: "Failed to add employee to department." };
  }
};

export const removeEmployeeFromDepartment = async (userId: string, departmentId: string, employeeId: string) => {
  const employee = await departmentService.removeEmployeeFromDepartment(userId, departmentId, employeeId);
  if (employee) {
    return { success: "Employee removed from department successfully!" };
  } else {
    return { error: "Failed to remove employee from department." };
  }
};

export const getAllDepartments = async () => {
  const departments = await departmentService.getAllDepartments();
  if (departments) {
    return { success: departments };
  } else {
    return { error: "Failed to get departments." };
  }
}