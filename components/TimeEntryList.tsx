'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TimeEntry } from '@prisma/client'
import { format } from 'date-fns'

interface TimeEntryListProps {
  entries: TimeEntry[]
}

export function TimeEntryList({ entries }: TimeEntryListProps) {
  const [search, setSearch] = useState('')

  const filteredEntries = entries.filter(entry => 
    entry.createdAt.toISOString().includes(search) || 
    entry.status.toLowerCase().includes(search.toLowerCase()) ||
    entry.departmentId.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmitTimesheet = () => {
    // Logic to submit timesheet
    console.log('Submitting timesheet')
  }

  const handlePrintTimesheet = () => {
    // Logic to print timesheet
    window.print()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Time Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between">
          <Input 
            placeholder="Search by date, status, or department" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div>
            <Button onClick={handleSubmitTimesheet} className="mr-2" style={{backgroundColor: 'rgb(254, 159, 43)'}}>Submit Biweekly Timesheet</Button>
            <Button onClick={handlePrintTimesheet} variant="outline">Print Timesheet</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.createdAt.toISOString().split('T')[0]}</TableCell>
                <TableCell>{entry.departmentId}</TableCell>

                <TableCell>{format(new Date(entry.clockIn), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell>{entry.clockOut ? format(new Date(entry.clockOut), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}</TableCell>
                <TableCell>{entry.hours.toFixed(2)}</TableCell>
                <TableCell>{entry.status}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

