"use client";


import { Clock, Users, Building2, CalendarDays, ChartBar, ShieldCheck } from 'lucide-react'
import { FeatureCard } from './FeatureCard'

export function FeaturesGrid() {
  const features = [
    {
      title: "Time Tracking",
      description: "Effortlessly track employee hours with our intuitive clock-in/out system",
      icon: Clock
    },
    {
      title: "Department Management",
      description: "Organize your workforce into departments and manage permissions",
      icon: Building2
    },
    {
      title: "Schedule Management",
      description: "Create and manage employee schedules with ease",
      icon: CalendarDays
    },
    {
      title: "Employee Management",
      description: "Handle employee information, roles, and permissions in one place",
      icon: Users
    },
    {
      title: "Reports & Analytics",
      description: "Get insights into attendance, hours worked, and labor costs",
      icon: ChartBar
    },
    {
      title: "Role-Based Access",
      description: "Secure access control with employee, manager, and admin roles",
      icon: ShieldCheck
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, idx) => (
        <FeatureCard key={feature.title} {...feature} delay={idx * 0.1} />
      ))}
    </div>
  )
}