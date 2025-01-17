"use server";

import { departmentService } from "@/services/DepartmentService";
import { EmployeeDepartmentRole } from "@prisma/client";

export const createDepartment = async (userId: string, name: string, info?: string) => {
  const department = await departmentService.createDepartment(userId, name, info);
  if (department) {
    return { success: "Department created successfully!", department };
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
  const department = await departmentService.addEmployeeToDepartment(userId, departmentId, employeeId, role, rate);
  if (department) {
    return { success: "Employee added to department successfully!", department };
  } else {
    return { error: "Failed to add employee to department." };
  }
};

export const removeEmployeeFromDepartment = async (userId: string, departmentId: string, employeeId: string) => {
  const department = await departmentService.removeEmployeeFromDepartment(userId, departmentId, employeeId);
  if (department) {
    return { success: "Employee removed from department successfully!", department };
  } else {
    return { error: "Failed to remove employee from department." };
  }
};

export const getAllDepartments = async (userId: string) => {
  if (!userId){
    return { error: "User ID is required." };
  }
  const departments = await departmentService.getUserPermittedDepartments(userId);
  if (departments) {
    return { departments:departments, success: "Departments retrieved successfully!" };
  } else {
    return { error: "Failed to get departments." };
  }
}

