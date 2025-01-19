import { currentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { getEmployeePermittedDepartmentsInfo, getPermittedDepartmentsInfo } from '@/actions/department'
import { AdminSectionSkeleton, QuickActionsGridSkeleton, StatsCardSkeleton } from '@/components/skeleton/components/HomePageSkeleton'
import { StatsSection } from '@/components/home/StatsSection'
import { QuickActions } from '@/components/home/QuickActions'
import { AdminSection } from '@/components/home/AdminSection'

const HomePage = async () => {
    const user = await currentUser()

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
                <main className="container mx-auto px-4 py-24">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="inline-block p-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                            ⚡️ Simple Time Management Solution
                        </div>
                        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                            Welcome to <span className="text-orange-600">TimeClock</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">

                            Manage your team&apos;s time tracking, attendance, and work schedules all in one place.
                        </p>
                        <div className="flex justify-center gap-4 pt-6">
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                                <Link href="/auth/login">Get Started</Link>
                            </Button>
                            <Button variant="outline" size="lg">
                                <Link href="/auth/login">Learn More</Link>
                            </Button>
                        </div>

                        <div className="mt-12 text-sm text-gray-500">
                            <p>Created by{' '}
                                <a href="https://www.dineshchhantyal.com" 
                                   className="text-orange-600 hover:text-orange-700 font-medium"
                                   target="_blank" 
                                   rel="noopener noreferrer">
                                    Dinesh Chhantyal
                                </a>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (!user.id) throw new Error("User ID is required");

    const [employeePermittedDepartments, permittedDepartments] = await Promise.all([
        getEmployeePermittedDepartmentsInfo(user.id, user.id),
        getPermittedDepartmentsInfo(user.id),
    ]);


    const isAdmin = user.role === UserRole.ADMIN || (permittedDepartments.departments ?? []).length != 0;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    <Suspense fallback={<StatsCardSkeleton />}>
                        {/* Welcome Section with Stats */}
                       <StatsSection 
    
                            employeePermittedDepartments={employeePermittedDepartments.departments ?? []}
                            username={user.name ?? ''}
                            userId={user.id}
                       />
                    </Suspense>

                    <Suspense fallback={<QuickActionsGridSkeleton />}>
                        {/* Quick Actions Grid */}
                        <QuickActions 
                            employeePermittedDepartments={employeePermittedDepartments.departments ?? []}
                        />
                    </Suspense>

                    {isAdmin && (
                        <Suspense fallback={<AdminSectionSkeleton />}>
                            {/* Admin Section */}
                           <AdminSection />
                        </Suspense>
                    )}
                </div>
            </main>
        </div>
    )
}

export default HomePage