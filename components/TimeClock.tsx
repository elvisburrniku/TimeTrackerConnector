'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTimeEntry } from '@/_context/TimeEntryContext'

const departments = ['Engineering', 'Marketing', 'Sales', 'Human Resources']

export function TimeClock() {
  const { currentEntry, clockIn, clockOut } = useTimeEntry()
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])

  const handleClockInOut = () => {
    if (currentEntry) {
      clockOut()
    } else {
      clockIn(selectedDepartment)
    }
  }

  const formatDuration = (startTime: Date) => {
    const start = startTime
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Clock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentEntry && (
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          onClick={handleClockInOut}
          className="w-full h-16 text-xl"
          variant={currentEntry ? "destructive" : "default"}
          style={{ backgroundColor: currentEntry ? undefined : 'rgb(254, 159, 43)' }}
        >
          {currentEntry ? 'Clock Out' : 'Clock In'}
        </Button>
        <div className="text-center">
          <p className="text-2xl font-semibold">{currentEntry ? 'Clocked In' : 'Clocked Out'}</p>
          {currentEntry && (
            <>
              <p>Department: {currentEntry.departmentId}</p>
              <p>Today&apos;s worked hours: {formatDuration(currentEntry.clockIn)}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

