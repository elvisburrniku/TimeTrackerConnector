"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeEntry } from '@/_context/TimeEntryContext';
import { startOfWeek, endOfWeek, differenceInSeconds, format } from 'date-fns';
import { ArrowUpIcon, ClockIcon, DollarSignIcon, CalendarIcon } from 'lucide-react';

export function StatisticsCards() {
  const { recentEntries, currentEntry } = useTimeEntry();
  
  // Calculate weekly statistics
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const weeklyHours = recentEntries
    .filter(entry => {
      const entryDate = new Date(entry.clockIn);
      return entryDate >= weekStart && entryDate <= weekEnd;
    })
    .reduce((total, entry) => {
      const seconds = entry.clockOut 
        ? differenceInSeconds(new Date(entry.clockOut), new Date(entry.clockIn))
        : 0;
      return total + (seconds / 3600);
    }, 0);

  const overtimeHours = Math.max(0, weeklyHours - 40);
  const regularHours = weeklyHours - overtimeHours;
  
  // Estimate pay (example rates)
  const regularRate = 15;
  const overtimeRate = regularRate * 1.5;
  const estimatedPay = (regularHours * regularRate) + (overtimeHours * overtimeRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{weeklyHours.toFixed(1)}h</div>
            <div className="flex items-center pt-1">
              <div className="h-2 flex rounded-full overflow-hidden bg-gray-200 w-full">
                <div 
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min((weeklyHours / 40) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 ml-2">{((weeklyHours / 40) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Overtime</CardTitle>
          <ArrowUpIcon className={`h-4 w-4 ${overtimeHours > 0 ? 'text-orange-500' : 'text-gray-500'}`} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{overtimeHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Rate: ${overtimeRate.toFixed(2)}/hr
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Expected Pay</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">${estimatedPay.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Next pay date: {format(weekEnd, 'MMM dd, yyyy')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              {currentEntry ? (
                <span className="text-green-500">On Duty</span>
              ) : (
                <span className="text-gray-500">Off Duty</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentEntry 
                ? `Started: ${format(new Date(currentEntry.clockIn), 'hh:mm a')}`
                : 'Not clocked in'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}