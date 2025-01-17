# TimeClock

This project is a time management website, featuring functionalities for employees and managers to manage all employee timesheets, approvals, seek leave, etc.


## Features

- **Authentication Providers**:
  - Credentials
  - OAuth (Google)
- **Two-Factor Authentication (2FA)**
- **Email Verification** using [Resend](https://resend.com/) for sending mails
- **Protected Routes**: Restrict access to specific parts of the app to authenticated users
- **User Session Management**: Efficient session handling to manage user login states
- **PostgreSQL Integration** with **Prisma ORM**

## Technologies Used

- **Next.js** (App Router)
- **Auth.js v5**
- **PostgreSQL** (with Prisma ORM)
- **Resend** (for email services)
- **TypeScript**
- **Tailwind CSS** (for styling)

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
