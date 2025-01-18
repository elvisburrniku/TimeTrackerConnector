'use client'

import { TimeEntryStatus, TimeEntry } from '@prisma/client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import Decimal from 'decimal.js'
import { getUserTimeEntries, clockIn as _clockIn, clockOut as _clockOut, getActiveTimeEntry } from '@/actions/time-entry'
import { currentUser } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

type TimeEntryContextType = {
  currentEntry: TimeEntry | null
  recentEntries: TimeEntry[]
  clockIn: (departmentId: string) => void
  clockOut: (timeEntryId: string) => void
  addEntry: (entry: TimeEntry) => void
}

const TimeEntryContext = createContext<TimeEntryContextType | undefined>(undefined)

export function TimeEntryProvider({ children }: { children: React.ReactNode }) {
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      const user = await currentUser()
      if (user && user.id) {
        const activeEntryResponse = await getActiveTimeEntry(user.id)
        const recentEntriesResponse = await getUserTimeEntries(user.id)
        setCurrentEntry(activeEntryResponse.data || null)
        setRecentEntries(recentEntriesResponse.data || [])
      }
    }
    fetchData()
  }, [])

  const clockIn = async (departmentId: string) => {
    const user = await currentUser()
    if (!user || !user.id) {
      toast({
        title: 'Error',
        description: 'User not found',
      })
      return
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      clockIn: new Date(),
      clockOut: null,
      hours: new Decimal(0),
      status: TimeEntryStatus.PENDING,
      departmentId: departmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedAt: null,
      userId: user.id,
      approvedById: null,
    }

    const response = await _clockIn(user.id, departmentId)
    if ('success' in response) {
      console.log(response.success)
      toast({
        title: 'Clocked in',
        description: 'You have successfully clocked in',
      })
      setCurrentEntry(newEntry)
    } else {
      console.error(response.error)
      toast({
        title: 'Error',
        description: 'Failed to clock in',
      })
    }
  }

  const clockOut = async (timeEntryId: string) => {
    const user = await currentUser()
    if (!user || !user.id) {
      console.error('User must be logged in to clock out')
      return
    }

    const response = await _clockOut(user.id, timeEntryId)
    if ('success' in response) {
      setCurrentEntry(null)
      console.log(response.success)
      toast({
        title: 'Clocked out',
        description: 'You have successfully clocked out',
      })
    } else {
      console.error(response.error)
      toast({
        title: 'Error',
        description: 'Failed to clock out',
      })
    }

    if (currentEntry) {
      const clockOutTime = new Date()
      const clockInTime = new Date(currentEntry.clockIn)
      const hours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)

      const completedEntry = {
        ...currentEntry,
        clockOut: clockOutTime,
        hours: new Decimal(hours.toFixed(2)),
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