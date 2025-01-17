'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const mockTimesheets = [
  { id: 1, employeeName: 'John Doe', date: '2023-05-15', hoursWorked: 8, status: 'Pending' },
  { id: 2, employeeName: 'Jane Smith', date: '2023-05-16', hoursWorked: 7.5, status: 'Pending' },
  { id: 3, employeeName: 'Bob Johnson', date: '2023-05-17', hoursWorked: 8.5, status: 'Pending' },
]

export function TimesheetApproval() {
  const [timesheets, setTimesheets] = useState(mockTimesheets)
  const [search, setSearch] = useState('')
  const [selectedTimesheet, setSelectedTimesheet] = useState<typeof mockTimesheets[0] | null>(null)
  const [disapprovalReason, setDisapprovalReason] = useState('')

  const filteredTimesheets = timesheets.filter(timesheet => 
    timesheet.employeeName.toLowerCase().includes(search.toLowerCase()) || 
    timesheet.date.includes(search)
  )

  const handleApprove = (id: number) => {
    setTimesheets(timesheets.map(ts => ts.id === id ? { ...ts, status: 'Approved' } : ts))
  }

  const handleDisapprove = (id: number) => {
    setTimesheets(timesheets.map(ts => ts.id === id ? { ...ts, status: 'Disapproved' } : ts))
    setSelectedTimesheet(null)
    setDisapprovalReason('')
  }

  const handleEditTime = (id: number, newDate: string, newHours: number) => {
    setTimesheets(timesheets.map(ts => ts.id === id ? { ...ts, date: newDate, hoursWorked: newHours } : ts))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet Approval</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input 
            placeholder="Search by employee name or date" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimesheets.map((timesheet) => (
              <TableRow key={timesheet.id}>
                <TableCell>{timesheet.employeeName}</TableCell>
                <TableCell>
                  <Input 
                    type="date" 
                    value={timesheet.date} 
                    onChange={(e) => handleEditTime(timesheet.id, e.target.value, timesheet.hoursWorked)}
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    value={timesheet.hoursWorked} 
                    onChange={(e) => handleEditTime(timesheet.id, timesheet.date, Number(e.target.value))}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>{timesheet.status}</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleApprove(timesheet.id)} 
                    className="mr-2"
                    style={{backgroundColor: 'rgb(254, 159, 43)'}}
                    disabled={timesheet.status !== 'Pending'}
                  >
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        onClick={() => setSelectedTimesheet(timesheet)}
                        disabled={timesheet.status !== 'Pending'}
                      >
                        Disapprove
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disapprove Timesheet</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="reason" className="text-right">Reason</Label>
                          <Textarea 
                            id="reason" 
                            value={disapprovalReason} 
                            onChange={(e) => setDisapprovalReason(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <Button onClick={() => handleDisapprove(selectedTimesheet!.id)} variant="destructive">Send Disapproval</Button>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

