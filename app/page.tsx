import { Header } from '@/components/header/Header'
import { currentUser } from '@/lib/auth'
import React from 'react'

const HomePage = async () => {
    const user = await currentUser()
    return (
        <div className="min-h-screen">

            <Header user={user ?? null}/>
            <main className="container mx-auto px-4 py-8">
                {user ? (
                    <h1 className="text-3xl font-bold text-primary">Welcome back, {user.name}</h1>
                ) : (
                    <h1 className="text-3xl font-bold text-primary">Welcome to TimeClock</h1>
                )}
                <h1 className="text-3xl font-bold text-primary">Welcome to TimeClock</h1>
                <p className="text-gray-600 mt-2">This is a simple time tracking application built with Next.js, Prisma, and much more.</p>
            </main>
        </div>
    )
}

export default HomePage