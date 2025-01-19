'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format, startOfWeek } from 'date-fns'
import { useTimeEntry } from '@/_context/TimeEntryContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { submitAllForApproval } from '@/actions/time-entry'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from './ui/loading-spinner'

export function TimeEntryList() {
  const { recentEntries, departmentMap, submitAllForApproval: updateApproval } = useTimeEntry()
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const user = useCurrentUser()
  const { toast } = useToast()

  // Group entries by week
  const weeklyData = useMemo(() => {
    const weeks: { [key: string]: typeof recentEntries } = {}

    recentEntries.forEach(entry => {
      const weekStart = startOfWeek(new Date(entry.clockIn))
      const weekKey = format(weekStart, 'yyyy-MM-dd')

      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }
      weeks[weekKey].push(entry)
    })

    return weeks
  }, [recentEntries])

  // Prepare chart data
  const chartData = useMemo(() => {
    return Object.entries(weeklyData).map(([week, entries]) => {
      const totalHours = entries.reduce((acc, entry) => acc + Number(entry.hours), 0)
      return {
        week: format(new Date(week), 'MMM d'),
        hours: totalHours,
        overtime: Math.max(0, totalHours - 40),
        regular: Math.min(totalHours, 40)
      }
    })
  }, [weeklyData])

  const filteredEntries = useMemo(() => {
    return recentEntries.filter(entry =>
      entry.createdAt.toISOString().includes(search) ||
      entry.status.toLowerCase().includes(search.toLowerCase()) ||
      departmentMap[entry.departmentId]?.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [recentEntries, search, departmentMap])


  const handleTimeSheetVerificationSubmit = async () => {
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not found. Please login again.'
      })
      return
    }

    try {
      setLoading(true)
      const res = await submitAllForApproval(user.id)
      if (res.data) {
        toast({
          title: 'Success',
          description: `${res.data.length ?? 0} time entries submitted for approval successfully`
        })
        updateApproval()
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to submit time entries for approval'
        })
      }
    } catch (error) {
      console.error('Failed to submit time entries for approval:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit time entries for approval'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Time Entries</CardTitle>
          <div className="space-x-2">
            <Button
            disabled={loading}
             onClick={handleTimeSheetVerificationSubmit} className="bg-orange-500 hover:bg-orange-600">
              {loading ? <LoadingSpinner /> : null}
              Submit for Approval
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              Print
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-[200px] grid-cols-2 mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <TabsContent value="table" className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.clockIn), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{departmentMap[entry.departmentId]?.name}</TableCell>
                    <TableCell>{format(new Date(entry.clockIn), 'hh:mm a')}</TableCell>
                    <TableCell>
                      {entry.clockOut ? format(new Date(entry.clockOut), 'hh:mm a') : '-'}
                    </TableCell>
                    <TableCell>{Number(entry.hours).toFixed(2)}h</TableCell>
                    <TableCell>
                      <Badge variant={
                        entry.status === 'PENDING' ? 'default' :
                          entry.status === 'APPROVED' ? 'secondary' : 'destructive'
                      }>
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="graph" className="w-full">
            <div className="h-[700px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="regular" stackId="a" fill="#10B981" name="Regular Hours" />
                  <Bar dataKey="overtime" stackId="a" fill="#F97316" name="Overtime Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}