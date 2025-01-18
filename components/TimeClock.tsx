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
    return `${hours.toString().padStart(2, '0')} hours, ${minutes.toString().padStart(2, '0')} minutes, ${seconds.toString().padStart(2, '0')} seconds`;
  };

  const springProps = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 170, friction: 26 },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Clock</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentEntry && (
          departments.length > 0 ? (
            <Select value={selectedDepartment?.id} onValueChange={(id) => setSelectedDepartment(departments.find(dept => dept.id === id) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p>You are not involved in any department</p>
          )
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
            <animated.div style={springProps} className="clock-container">
              <p>Department: {departments.find(dept => dept.id === currentEntry.departmentId)?.name}</p>
              <p>Today's worked hours: {time}</p>
            </animated.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
