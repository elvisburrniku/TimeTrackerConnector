"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeEntry } from '@/_context/TimeEntryContext';
import { Department } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { clockIn as _clockIn, clockOut as _clockOut } from '@/actions/time-entry';
import { useSpring, animated } from '@react-spring/web';
import { differenceInSeconds, format } from 'date-fns';

interface TimeClockProps {
  departments: Department[];
}

export function TimeClock({ departments }: TimeClockProps) {
  const { currentEntry, clockIn, clockOut } = useTimeEntry();
  const { data: user } = useSession();
  const { toast } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(departments.length > 0 ? departments[0] : null);
  const [time, setTime] = useState<string>('00:00:00');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentEntry) {
      timer = setInterval(() => {
        setTime(formatDuration(new Date(currentEntry.clockIn)));
      }, 1000);
    } else {
      setTime('00:00:00');
    }
    return () => clearInterval(timer);
  }, [currentEntry]);

  const handleClockInOut = async () => {
    if (currentEntry) {
      if (!user || !user.user || !user.user.id) {
        console.error('User must be logged in to clock out');
        return;
      }

      const response = await _clockOut(user.user.id, currentEntry.id);

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
        });
        return;
      } else if (response.data && response.success) {
        toast({
          title: 'Success',
          description: response.success,
        });

        clockOut(currentEntry.id);
      }
    } else {
      if (!selectedDepartment) return;

      if (!user || !user.user || !user.user.id) {
        console.error('User must be logged in to clock in');
        return;
      }

      const response = await _clockIn(user.user.id, selectedDepartment.id);

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
        });
        return;
      } else if (response.data && response.success) {
        toast({
          title: 'Success',
          description: response.success,
        });

        clockIn(response.data);
      }
    }
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diffInSeconds = differenceInSeconds(now, startTime);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')} hours, ${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds`;
    } else {
      return `${seconds.toString().padStart(2, '0')} seconds`;
    }
  };

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 170, friction: 26 },
  });

  return (
    <Card className="">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold">Employee Time Clock</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-6">
          {/* Department Selection Section */}
          {!currentEntry && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Department Selection</h3>
                <span className="text-sm text-gray-500">{departments.length} departments available</span>
              </div>
              {departments.length > 0 ? (
                <div className="space-y-4">
                  <Select 
                    value={selectedDepartment?.id} 
                    onValueChange={(id) => setSelectedDepartment(departments.find(dept => dept.id === id) || null)}
                  >
                    <SelectTrigger className="w-full h-12 text-lg bg-gray-50 border-2 hover:bg-gray-100 transition-colors">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept.id} 
                          value={dept.id}
                          className="py-3 text-base hover:bg-orange-50"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartment && (
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="font-medium text-orange-700">Selected: {selectedDepartment.name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">You are not assigned to any department</p>
                  <p className="text-sm text-gray-400 mt-2">Please contact your administrator</p>
                </div>
              )}
            </div>
          )}

          {/* Clock Status Section */}
          <div className="space-y-4">
            <div className="text-center p-6 rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">
                {currentEntry ? 'Currently Working' : 'Ready to Start'}
              </h3>
              {currentEntry && (
                <animated.div style={springProps} className="space-y-3">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span>Active Session</span>
                  </div>
                  <p className="text-lg text-gray-600">
                    Working in: {departments.find(dept => dept.id === currentEntry.departmentId)?.name}
                  </p>
                  <p className="text-3xl font-mono font-bold tracking-wider">{time}</p>
                  <p className="text-sm text-gray-500">
                    Started at: {format(new Date(currentEntry.clockIn), 'hh:mm a')}
                  </p>
                </animated.div>
              )}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleClockInOut}
              className={`w-full py-6 text-xl font-semibold transition-all duration-200 ${
                currentEntry 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              disabled={!currentEntry && !selectedDepartment}
            >
              {currentEntry ? 'End Shift (Clock Out)' : 'Start Shift (Clock In)'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}