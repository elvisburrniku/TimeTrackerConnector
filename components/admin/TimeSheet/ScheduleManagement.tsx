'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { createSchedule, getSchedule } from '@/actions/schedule'
import { DepartmentSchedule, EmployeeDepartment } from '@prisma/client'
import { TimeGrid } from './TimeGrid'
import { DateRange } from 'react-day-picker'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { endOfWeek, format, startOfWeek } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ScheduleManagementProps {
    userId: string
    employeeDepartments: EmployeeDepartment[]
}

export default function ScheduleManagement({ userId, employeeDepartments }: ScheduleManagementProps) {
    const [selectedDepartment, setSelectedDepartment] = useState(employeeDepartments[0]?.departmentId)
    const [selectedWeek, setSelectedWeek] = useState<DateRange>({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date())
    })
    const [shifts, setShifts] = useState<any[]>([])
    const { toast } = useToast()
    const [existingSchedule, setExistingSchedule] = useState<DepartmentSchedule | null>(null)
    const [loading, setLoading] = useState(false)

    const { departmentMap } = useTimeEntry()


    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true)
            const response = await getSchedule(userId, selectedDepartment)
            if (response.data) {
                setExistingSchedule(response.data)
                setShifts(response.data.schedules || [])
                setSelectedWeek({
                    from: new Date(response.data.weekStart),
                    to: new Date(response.data.weekEnd)
                })
            }
            setLoading(false)
        }
        loadSchedule()
    }, [selectedDepartment])

    const handleWeekSelect = (range: DateRange | undefined) => {
        if (range?.from) {
            const weekStart = startOfWeek(range.from)
            const weekEnd = endOfWeek(weekStart)
            setSelectedWeek({ from: weekStart, to: weekEnd })
        }
    }

    const handleCreateSchedule = async () => {
        if (!selectedWeek.from || !selectedWeek.to) {
            toast({
                title: 'Error',
                description: 'Please select a week first',
                variant: 'destructive'
            })
            return
        }

        const response = await createSchedule(userId, selectedDepartment, {
            weekStart: selectedWeek.from,
            weekEnd: selectedWeek.to,
            shifts
        })

        if (response.conflicts) {
            toast({
                title: 'Schedule Conflicts Detected',
                description: 'There are overlapping schedules in other departments',
            })
        }

        if (response.error) {
            toast({
                title: 'Error',
                description: response.error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Success',
                description: response.success
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Schedule Management</CardTitle>
                        <CardDescription>
                            {selectedWeek.from && selectedWeek.to ? (
                                `Week of ${format(selectedWeek.from, 'MMM d')} - ${format(selectedWeek.to, 'MMM d, yyyy')}`
                            ) : (
                                'Select a week to manage schedule'
                            )}
                        </CardDescription>
                    </div>
                    {existingSchedule && (
                        <Badge variant="outline">
                            Current Schedule Active
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={selectedDepartment}       onValueChange={setSelectedDepartment}>
                    <TabsList>
                        {employeeDepartments.map(dept => (
                            <TabsTrigger key={dept.departmentId} value={dept.departmentId}>
                                {departmentMap[dept.departmentId]?.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="grid grid-cols-12 gap-4 mt-4">
            <div className="col-span-4">
              <Calendar
                mode="range"
                selected={selectedWeek}
                onSelect={handleWeekSelect}
                numberOfMonths={1}
                disabled={(date) => date < new Date()}
                defaultMonth={selectedWeek.from}
                showOutsideDays={false}
                fixedWeeks
              />
              {loading && (
                <div className="mt-4 text-center">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            <div className="col-span-8">
              <TimeGrid
                shifts={shifts}
                onChange={setShifts}
                disabled={loading}
                existingSchedule={existingSchedule}
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShifts(existingSchedule?.schedules || [])
                  }}
                >
                  Reset
                </Button>
                <Button
                  onClick={handleCreateSchedule}
                  disabled={!selectedWeek.from || !selectedWeek.to || loading}
                >
                  {existingSchedule ? 'Update Schedule' : 'Create Schedule'}
                </Button>
              </div>
            </div>
            </div>
                </Tabs>
            </CardContent>
        </Card >
    )
}