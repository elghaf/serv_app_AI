'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { useSignUp } from "@clerk/nextjs"
import { useAuth } from '@clerk/nextjs'

export default function SignUp() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useSignUp()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

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

      const result = await signUp.create({
        emailAddress: email,
        password,
      })

      await result.prepareEmailAddressVerification({ strategy: "email_code" })

      if (result.status === "missing_requirements") {
        toast.success('Please check your email for verification code')
        router.push('/verify-email')
      } else if (result.status === "complete") {
        toast.success('Account created successfully!')
        router.push('/dashboard')
      } else {
        toast.warning(`Status: ${result.status}. Please complete the sign up process.`)
      }
    } catch (error: any) {
      const errorMessage = error?.errors?.[0]?.message || 'Failed to create account'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white p-3 rounded-2xl inline-block">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-3xl font-bold">Create Account</h2>
          <p className="text-muted-foreground mt-2">Sign up for a new account</p>
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
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </Button>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link 
                  href="/sign-in" 
                  className="text-violet-500 hover:text-violet-400 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 