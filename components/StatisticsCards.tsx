import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeEntry } from '@prisma/client';

interface CardProps {
  entries: TimeEntry[];
}

export function StatisticsCards({}: CardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Hours This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">32.5</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overtime Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">2.5</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">15 days</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Next Pay Date</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">May 31, 2023</p>
          <p className="text-sm text-gray-500">Estimated: $1,250.00</p>
        </CardContent>
      </Card>
    </div>
  )
}

