import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  // If user is authenticated, always redirect to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  // If not authenticated, redirect to sign in
  redirect('/sign-in')
}
