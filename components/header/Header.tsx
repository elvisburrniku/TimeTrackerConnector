import { Bell,  Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExtendedUser } from '@/next-auth'
import { LoginButton } from '../auth/login-button'
import { RegisterButton } from '../auth/register-button'
import Link from 'next/link'
import { UserButton } from '../auth/user-button'
import AdminSubNavbar from './AdminSubNavbar'

interface HeaderProps {
  user: ExtendedUser | null
}

const LINKS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Timesheets',
    href: '/timesheets',
  },
  {
    label: 'Leave Requests',
    href: '/leave-requests',
  },
  {
    label: 'Reports',
    href: '/reports',
  },
]

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <h1 className="text-xl font-bold text-primary">TimeClock </h1>
            <p className='text-sm text-gray-500'>
              by Dinesh Chhantyal
            </p>
          </Link>
          <nav className="hidden md:flex space-x-4">
            {LINKS.map((link) => (

              <Link href={link.href}  key={link.href} className='text-gray-600 hover:text-primary transition-colors duration-300 ease-in-out'>
                {link.label}
              </Link>

            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <UserButton />
            </>
          ) : (
            <>
              <LoginButton>
                <Button variant="ghost">Login</Button>
              </LoginButton>
              <RegisterButton>
                <Button variant="ghost">Register</Button>
              </RegisterButton>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <AdminSubNavbar />
    </header>
  )
}
