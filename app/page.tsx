import { Header } from '@/components/header/Header'
import { currentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserRole } from '@prisma/client'
import Link from 'next/link'
import { Clock, Users, Calendar, Settings, BarChart, UserCog } from 'lucide-react'
import { getPermittedDepartmentsInfo } from '@/actions/department'

const HomePage = async () => {
    const user = await currentUser()

    if (!user) {
        return (
                <main className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl mx-auto text-center space-y-4">
                        <h1 className="text-4xl font-bold text-primary">Welcome to TimeClock</h1>
                        <p className="text-xl text-muted-foreground">
                            Streamline your time tracking and management with our modern solution
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <Button asChild size="lg">
                                <Link href="/auth/login">Get Started</Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="/auth/login">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </main>
        )
    }
    if (!user.id) throw new Error("User ID is required");
    const permittedDepartments = await getPermittedDepartmentsInfo(user.id);
    const isAdmin = user.role === UserRole.ADMIN || (permittedDepartments.departments ?? []).length != 0;

    return (
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Welcome Section */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-primary">
                                Welcome back, {user.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Here's your workspace overview
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/dashboard">
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Time Clock
                                </CardTitle>
                                <CardDescription>
                                    Clock in/out and view your time entries
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <Link href="/time-clock">
                                        Manage Time
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule
                                </CardTitle>
                                <CardDescription>
                                    View and manage your work schedule
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <Link href="/schedule">
                                        View Schedule
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart className="h-5 w-5" />
                                    Time Sheets
                                </CardTitle>
                                <CardDescription>
                                    Review and submit time sheets
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" asChild>
                                    <Link href="/timesheet">
                                        Manage Timesheets
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Admin Section */}
                    {isAdmin && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold">Administrative Tools</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Department Management
                                        </CardTitle>
                                        <CardDescription>
                                            Manage departments and employees
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/dashboard?tab=departments">
                                                Manage Departments
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCog className="h-5 w-5" />
                                            Employee Management
                                        </CardTitle>
                                        <CardDescription>
                                            Manage user accounts and permissions
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full" asChild>
                                            <Link href="/admin/dashboard?tab=employees">
                                                Manage Employees
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>
    )
}

export default HomePage