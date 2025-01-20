'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { format, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { Department } from '@prisma/client'
import { getSchedule } from '@/actions/schedule'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { ScheduleWithDepartment } from './ScheduleView'
import { Badge } from '../ui/badge'
import { TimeOffRequestModal } from '../time-off/TimeOffRequestModal'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CombinedScheduleViewProps {
    departments: Department[]
    userId: string
}

type CalendarDay = {
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    status?: 'scheduled' | 'leave' | 'holiday'
}

export function CombinedScheduleView({ departments, userId }: CombinedScheduleViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { recentEntries } = useTimeEntry()
    const [schedules, setSchedules] = useState<ScheduleWithDepartment[]>([])
    const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false)
    const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])

    async function fetchSchedules() {
        if (!departments.length || !userId) return
        try {
            const results = await Promise.all(
                departments.map(async (dept) => {
                    const response = await getSchedule(userId, dept.id)
                    return response.data ? {
                        ...response.data,
                        department: { id: dept.id, name: dept.name }
                    } : null
                })
            )
            setSchedules(results.filter((s): s is ScheduleWithDepartment => s !== null))
        } catch (error) {
            console.error('Failed to fetch schedules:', error)
        }
    }

    // Fetch schedules effect
    useEffect(() => {
        fetchSchedules()
    }, [departments, userId])

    const getHoursWorked = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]
        return recentEntries
            .filter(entry => entry.clockIn.toISOString().split('T')[0] === dateStr)
            .reduce((total, entry) => total + Number(entry.hours), 0)
    }

    const getCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrevMonth = new Date(year, month, 0).getDate()
        const today = new Date()

        return [
            // Previous month
            ...Array.from({ length: firstDay }, (_, i) => ({
                date: new Date(year, month - 1, daysInPrevMonth - firstDay + i + 1),
                isCurrentMonth: false,
                isToday: false
            })),
            // Current month
            ...Array.from({ length: daysInMonth }, (_, i) => {
                const date = new Date(year, month, i + 1)
                const hasShifts = schedules.some(s =>
                    s.schedules.some(shift => shift.dayOfWeek === date.getDay())
                )
                return {
                    date,
                    isCurrentMonth: true,
                    isToday: isSameDay(date, today),
                    status: hasShifts ? 'scheduled' : undefined
                }
            }),
            // Next month
            ...Array.from({ length: 42 - (firstDay + daysInMonth) }, (_, i) => ({
                date: new Date(year, month + 1, i + 1),
                isCurrentMonth: false,
                isToday: false
            }))
        ]
    }

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg p-px">
                    {daysOfWeek.map(day => (
                        <div key={day} className="text-xs font-medium text-center py-2 bg-white">
                            {day}
                        </div>
                    ))}
                    {getCalendarDays().map((day) => {
                        const hasSchedule = schedules.some(s =>
                            s.schedules.some(shift => shift.dayOfWeek === day.date.getDay())
                        )

                        return (
                            <Dialog key={day.date.toISOString()}>
                                <DialogTrigger asChild>
                                    <div className={cn(
                                        "h-10 bg-white hover:bg-gray-50 cursor-pointer flex items-start justify-start",
                                        !day.isCurrentMonth && "text-gray-400",
                                        day.isToday && "bg-orange-200 border-orange-400",
                                        hasSchedule && "font-medium"
                                    )}>
                                        <span className="text-sm m-1 text-center">{format(day.date, 'd')}</span>
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{format(day.date, 'EEEE, MMMM d')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                        {schedules.length > 0 ? (
                                            schedules.some(({ schedules }) =>
                                                schedules.some(s => s.dayOfWeek === day.date.getDay())
                                            ) ? (
                                                schedules.map(({ department, schedules }) => (
                                                    <div>
                                                        <div key={department.id} className="space-y-2">
                                                            <h4 className="font-medium">{department.name}</h4>
                                                            {schedules.filter(s => s.dayOfWeek === day.date.getDay()).map(shift => (
                                                                <div key={shift.id} className="flex justify-between items-center text-sm bg-orange-50 p-2 rounded">
                                                                    <span>{format(new Date(shift.startTime), 'h:mm a')} - {format(new Date(shift.endTime), 'h:mm a')}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Time Off Request Section */}
                                                        {day.isCurrentMonth && day.date > new Date() && (
                                                            <div className="space-y-4 border-t pt-4">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="font-medium">Request Time Off</h4>
                                                                    <Badge variant="outline">
                                                                        {format(day.date, 'MMM d, yyyy')}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {departments.map(dept => (
                                                                        <Button
                                                                            key={dept.id}
                                                                            variant="outline"
                                                                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                                            onClick={() => {
                                                                                setSelectedDepartments([dept])
                                                                                setIsTimeOffModalOpen(true)
                                                                            }}
                                                                        >
                                                                            {dept.name}
                                                                        </Button>
                                                                    ))}
                                                                    <Button
                                                                        variant="outline"
                                                                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                                        onClick={() => {
                                                                            setSelectedDepartments(departments)
                                                                            setIsTimeOffModalOpen(true)
                                                                        }}
                                                                    >
                                                                        Request for All Departments
                                                                    </Button>
                                                                </div>

                                                                <TimeOffRequestModal
                                                                    isOpen={isTimeOffModalOpen}
                                                                    onClose={() => setIsTimeOffModalOpen(false)}
                                                                    selectedDepartments={selectedDepartments}
                                                                    userId={userId}
                                                                    defaultDate={day.date}
                                                                    onSuccess={fetchSchedules}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-gray-500 text-center py-2">
                                                    No schedule for this day
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-sm text-gray-500 text-center py-2">
                                                No schedules available
                                            </div>
                                        )}





                                        {day.isCurrentMonth && getHoursWorked(day.date) > 0 && (
                                            <div className="text-sm">
                                                <h4 className="font-medium mb-1">Hours Worked</h4>
                                                <p>{getHoursWorked(day.date).toFixed(2)} hours</p>
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    })}
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-400 border border-orange-500 rounded"></div>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-200 border-2 border-orange-400 rounded"></div>
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                        <span>Leave</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}