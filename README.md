# TimeClock

A comprehensive employee time management system built with Next.js 14 and TypeScript. Manage timesheets, schedules, departments, and leave requests with real-time updates.

## Features

### Authentication & Security
- Email/Password and Google OAuth authentication
- Email verification via Resend
- Protected routes and role-based access

### Department Management
- Create and manage departments
- Assign managers and employees
- Set hourly rates and positions

### Time Tracking
- Clock in/out functionality
- Overtime calculations
- Multiple department assignments

### Timesheet Management
- Weekly timesheet submissions
- Manager approval workflow
- Department-wise reports
- Pay calculation

### Notifications
- Schedule updates
- Timesheet approval status
- Clock in/out confirmations

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Auth.js v5
- **Email**: Resend
- **State Management**: React Context + Hooks
- **Real-time**: Server Actions
- **Deployment**: Vercel

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/dineshchhantyal/TimeClock
   cd TimeClock
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables for authentication providers and database connection:

   - Google OAuth
   - PostgreSQL connection string
   - Resend API key for email services

4. Run Prisma migration:

   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```
