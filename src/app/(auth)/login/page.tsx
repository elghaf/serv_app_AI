'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import Link from 'next/link'
import { LockKeyhole } from 'lucide-react'
import { useSignIn, useAuth } from "@clerk/nextjs"

export default function Login() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, isLoaded } = useSignIn()
  const { signOut, isSignedIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    try {
      if (!isLoaded) {
        toast.error('Authentication system is not ready')
        return
      }

      // If already signed in, sign out first
      if (isSignedIn) {
        await signOut()
      }

      const result = await signIn.create({
        identifier: email,
        password,
      })

      console.log('Sign in status:', result.status)

      if (result.status === "complete") {
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        toast.warning(`Status: ${result.status}. Please complete the sign in process.`)
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      if (error.message?.includes('single session mode')) {
        toast.error('Please sign out of your current account first')
      } else {
        const errorMessage = error?.errors?.[0]?.message || 'Invalid credentials'
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {isSignedIn && (
          <div className="text-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="mb-4"
            >
              Sign out of current account
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white p-3 rounded-2xl inline-block">
            <LockKeyhole className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-3xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link 
                  href="/register" 
                  className="text-violet-500 hover:text-violet-400 font-medium"
                >
                  Create account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
