# TimeClock

A comprehensive employee time management system built with Next.js 14 and TypeScript. Manage timesheets, schedules, departments, and leave requests with real-time updates.


## Live Demo

Check out the live demo at: [TimeClock Demo](https://timeclock.dineshchhantyal.com)

### Demo Credentials

```typescript
// Test accounts
Admin:     admin@timeclock.com / admin123
Employee:  john@timeclock.com / employee123  
Manager:   manager@timeclock.com / manager123
```

## Roles

### Super Admin
- Access to all departments and system settings
- Manage all users, departments, and configurations
- View system-wide analytics and reports

### Department Admin
- Manage specific department(s)
- Add/remove department employees
- Configure department settings
- View department reports

### Department Manager
- Oversee daily operations
- Approve timesheets and leave requests
- View department schedules
- Manage employee assignments

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
6. Open localhost:3000