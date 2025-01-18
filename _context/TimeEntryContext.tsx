'use client'

import { Department, TimeEntry } from '@prisma/client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import Decimal from 'decimal.js'

type TimeEntryContextType = {
  currentEntry: TimeEntry | null
  recentEntries: TimeEntry[]
  clockIn: (newEntry: TimeEntry) => void
  clockOut: (timeEntryId: string) => void
  addEntry: (entry: TimeEntry) => void
  departments: Department[]
  departmentMap: { [key: string]: Department }
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined)

export function TimeEntryProvider({ children,
  currentEntry: currentEntryProp,
  recentEntries: recentEntriesProp,
  departments: departmentsProp
}: {
    children: React.ReactNode,

    currentEntry: TimeEntry | null,
    recentEntries: TimeEntry[],
    departments: Department[]
  }) {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(currentEntryProp)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>(recentEntriesProp)
  const [departments, setDepartments] = useState<Department[]>(departmentsProp)
  const [departmentMap, setDepartmentMap] = useState<{ [key: string]: Department }>({})
  useEffect(() => {
    setDepartmentMap(departmentsProp.reduce((acc, dept) => {
      return { ...acc, [dept.id]: dept }
    }, {}))
  }, [departmentsProp])


  const clockIn = async (newEntry: TimeEntry) => {
    setCurrentEntry(newEntry)
  }

  const clockOut = async (timeEntryId: string) => {


    if (currentEntry) {
      const clockOutTime = new Date()
      const clockInTime = new Date(currentEntry.clockIn)
      const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      const completedEntry = {
        ...currentEntry,
        clockOut: clockOutTime,
        hours: new Decimal(hours.toFixed(2)),
      }

      setRecentEntries(prev => prev.map(entry => 
        entry.id === timeEntryId ? completedEntry : entry
      ))
      setCurrentEntry(null)
    }
  }

  const addEntry = (entry: TimeEntry) => {
    setRecentEntries([entry, ...recentEntries])
  }

  return (
    <TimeEntryContext.Provider value={{ currentEntry, recentEntries, clockIn, clockOut, addEntry, departments, departmentMap }}>
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