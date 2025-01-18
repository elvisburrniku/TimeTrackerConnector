"use server";

import { TimeClock } from '@/components/TimeClock'
import { Calendar } from '@/components/Calendar'
import { TimeEntryList } from '@/components/TimeEntryList'
import { StatisticsCards } from '@/components/StatisticsCards'
import { getEmployeePermittedDepartmentsInfo } from '@/actions/department'
import { currentUser } from '@/lib/auth'
import { Department } from '@prisma/client'

async function Dashboard() {
  const user = await currentUser();
  let departments: Department[] = [];

  if (user && user.id) {
    try {
      const data = await getEmployeePermittedDepartmentsInfo(user.id, user.id);

      if (data && data.departments)
        departments = data.departments;
    } catch (error) {
      console.error('Failed to fetch permitted departments:', error);
    }
  }

  return (
    <div className="space-y-6 my-6 container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <TimeClock departments={departments}/>
      </div>
      <Calendar />
      </div>
      <StatisticsCards />
      <TimeEntryList />
    </div>
  )
}

export default Dashboard