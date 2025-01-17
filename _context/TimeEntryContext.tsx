'use client'

import { Status, TimeEntry } from '@prisma/client'
import React, { createContext, useContext, useState } from 'react'
import Decimal from 'decimal.js'


type TimeEntryContextType = {
  currentEntry: TimeEntry | null
  recentEntries: TimeEntry[]
  clockIn: (department: string) => void
  clockOut: () => void
  addEntry: (entry: TimeEntry) => void
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined)

export function TimeEntryProvider({ children }: { children: React.ReactNode }) {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([])

  const clockIn = (department: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      clockIn: new Date(),
      clockOut: new Date(),
      hours: new Decimal(0),
      status: Status.PENDING,
      departmentId: department,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      userId: 'user-id-placeholder',
      approvedById: null,
    }
    setCurrentEntry(newEntry)
  }

  const clockOut = () => {
    if (currentEntry) {
      const clockOutTime = new Date()
      const clockInTime = new Date(currentEntry.clockIn)
      const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      
      const completedEntry = {
        ...currentEntry,
        clockOut: clockOutTime,
        hours: new Decimal(hours.toFixed(2))
      }
      setRecentEntries([completedEntry, ...recentEntries])
      setCurrentEntry(null)
    }
  }

  const addEntry = (entry: TimeEntry) => {
    setRecentEntries([entry, ...recentEntries])
  }

  return (
    <TimeEntryContext.Provider value={{ currentEntry, recentEntries, clockIn, clockOut, addEntry }}>
      {children}
    </TimeEntryContext.Provider>
  )
}

export function useTimeEntry() {
  const context = useContext(TimeEntryContext)
  if (context === undefined) {
    throw new Error('useTimeEntry must be used within a TimeEntryProvider')
  }
  return context
}

