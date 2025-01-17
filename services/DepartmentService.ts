import { currentRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Department, EmployeeDepartment, EmployeeDepartmentRole, UserRole } from "@prisma/client";

import { Decimal } from "@prisma/client/runtime/library";

class DepartmentService {
  async createDepartment(userId: string, name: string, info?: string): Promise<Department | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      console.error("Permission denied: Only ADMIN can create a department.");
      return null;
    }

    try {
      const department = await db.department.create({
        data: { name, info },
      });
      return department;
    } catch (error) {
      console.error("Error creating department:", error);
      return null;
    }
  }

  async updateDepartment(userId: string, id: string, name: string): Promise<Department | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
        where: {
            userId,
            departmentId: id,
        },
        });
        
    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can update a department.");
      return null;
    }

    try {
      const department = await db.department.update({
        where: { id },
        data: { name },
      });
      return department;
    } catch (error) {
      console.error("Error updating department:", error);
      return null;
    }
  }

  async deleteDepartment(userId: string, id: string): Promise<Department | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      console.error("Permission denied: Only ADMIN can delete a department.");
      return null;
    }

    try {
      const department = await db.department.delete({ where: { id } });
      return department;
    } catch (error) {
      console.error("Error deleting department:", error);
      return null;
    }
  }

  async addEmployeeToDepartment(userId: string, departmentId: string, employeeId: string, role: EmployeeDepartmentRole, rate: number): Promise<EmployeeDepartment | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
        where: {
            userId,
            departmentId,
        },
        });

    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can add an employee to a department.");
      return null;
    }

    try {
      const employee = await db.employeeDepartment.create({
        data: {
          departmentId,
          userId: employeeId,
          role,
          hourlyRate: new Decimal(rate),
        },
      });
      return employee;
    } catch (error) {
      console.error("Error adding employee to department:", error);
      return null;
    }
  }

  async removeEmployeeFromDepartment(userId: string, departmentId: string, employeeId: string): Promise<EmployeeDepartment | null> {
    const user = await db.user.findUnique({ where: { id: userId } });
    const userDeparmentRole = await db.employeeDepartment.findFirst({
        where: {
            userId,
            departmentId,
        },
        });

    if (!user || (user.role !== UserRole.ADMIN && userDeparmentRole?.role !== EmployeeDepartmentRole.MANAGER)) {
      console.error("Permission denied: Only ADMIN or MANAGER can remove an employee from a department.");
      return null;
    }

    try {
      const employee = await db.employeeDepartment.delete({
        where: {
          userId_departmentId: {
            departmentId,
            userId: employeeId,
          },
        },
      });
      return employee;
    } catch (error) {
      console.error("Error removing employee from department:", error);
      return null;
    }
  }

  async getTotalEmployeeCount(departmentId: string): Promise<number> {
    try {
      const count = await db.employeeDepartment.count({
        where: { departmentId },
      });
      return count;
    } catch (error) {
      console.error("Error getting total employee count:", error);
      return 0;
    }
  }

  async getEmployeeCost(departmentId: string): Promise<Decimal> {
    try {
      const employees = await db.employeeDepartment.findMany({
        where: { departmentId },
        select: { hourlyRate: true },
      });
      const totalCost = employees.reduce((acc, emp) => acc.plus(emp.hourlyRate), new Decimal(0));
      return totalCost;
    } catch (error) {
      console.error("Error getting employee cost:", error);
      return new Decimal(0);
    }
  }

  async getAllDepartments(): Promise<Department[] | null> {
    try {
      const departments = await db.department.findMany();
      return departments;
    } catch (error) {
      console.error("Error getting all departments:", error);
      return null;
    }
  }

  async getUserPermittedDepartments(userId: string): Promise<Department[] | null> {
    const role = await currentRole();

    if (role === UserRole.ADMIN) {
      return this.getAllDepartments();
    }

    try {
      const departments = await db.employeeDepartment.findMany({
        where: {
          userId,
        },
      });

      const depertmentsInfo = await db.department.findMany({
        where: {
          id: { in: departments.map((dep) => dep.departmentId) },
        },
      });

      return depertmentsInfo;
    } catch (error) {
      console.error("Error getting permitted departments:", error);
      return null;
    }
  }
}

export const departmentService = new DepartmentService();