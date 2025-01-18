import { db } from '@/lib/db'
import { TimeEntry, Department, EmployeeDepartment } from '@prisma/client'
import { startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns'


export interface WorkStats {
  weeklyHours: number
  overtimeHours: number
  expectedPay: number
  departmentStats: DepartmentStats[]
  currentEntry?: TimeEntry | null
  lastClockIn?: Date | null
  scheduleAdherence: number
}

interface DepartmentStats {
  departmentId: string
  departmentName: string
  hours: number
  pay: number
  rate: number
}

export class WorkStatsService {
  async getWeeklyStats(userId: string, date: Date = new Date()): Promise<WorkStats> {
    const weekStart = startOfWeek(date)
    const weekEnd = endOfWeek(date)

    const [timeEntries, departments, currentEntry] = await Promise.all([
      db.timeEntry.findMany({
        where: {
          userId,
          clockIn: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      }),
      db.employeeDepartment.findMany({
        where: { userId },
        include: { department: true }
      }),
      db.timeEntry.findFirst({
        where: {
          userId,
          clockOut: null
        },
        orderBy: { clockIn: 'desc' }
      })
    ])

    const departmentStats = await this.calculateDepartmentStats(timeEntries, departments)
    const weeklyHours = this.calculateTotalHours(timeEntries)
    const overtimeHours = Math.max(weeklyHours - 40, 0)
    const expectedPay = departmentStats.reduce((total, dept) => total + dept.pay, 0)
    const lastClockIn = timeEntries[0]?.clockIn

    const scheduleAdherence = await this.calculateScheduleAdherence(userId, timeEntries, weekStart)

    return {
      weeklyHours,
      overtimeHours,
      expectedPay,
      departmentStats,
      currentEntry,
      lastClockIn,
      scheduleAdherence
    }
  }

  private async calculateDepartmentStats(
    entries: TimeEntry[],
    departments: (EmployeeDepartment & { department: Department })[]
  ): Promise<DepartmentStats[]> {
    return departments.map(dept => {
      const deptEntries = entries.filter(entry => entry.departmentId === dept.departmentId)
      const hours = this.calculateTotalHours(deptEntries)
      const regularHours = Math.min(hours, 40)
      const overtimeHours = Math.max(hours - 40, 0)
      const pay = (regularHours * Number(dept.hourlyRate)) + (overtimeHours * Number(dept.hourlyRate) * 1.5)

      return {
        departmentId: dept.departmentId,
        departmentName: dept.department.name,
        hours,
        pay,
        rate: Number(dept.hourlyRate)
      }
    })
  }

  private calculateTotalHours(entries: TimeEntry[]): number {
    return entries.reduce((total, entry) => {
      const end = entry.clockOut || new Date()
      const hours = differenceInMinutes(end, entry.clockIn) / 60
      return total + hours
    }, 0)
  }

  private async calculateScheduleAdherence(
    userId: string,
    timeEntries: TimeEntry[],
    weekStart: Date
  ): Promise<number> {
    const schedule = await db.departmentSchedule.findMany({
      where: {
        userId,
        weekStart: {
          gte: weekStart
        }
      },
      include: {
        schedules: true
      }
    })

    if (!schedule.length) return 100

    // Calculate adherence based on scheduled vs actual hours
    // Implementation depends on your schedule structure
    return 95 // Placeholder
  }
}

export const workStatsService = new WorkStatsService()