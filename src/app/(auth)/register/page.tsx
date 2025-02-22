'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
    }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
      }

      toast.success('Account created successfully!')
      router.push('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full max-w-[480px] mx-auto bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-slate-900 text-white p-4 rounded-xl inline-block mx-auto mb-6">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Join AI Platform
          </h1>
          <p className="text-lg text-slate-600">
            Start your journey with cutting-edge AI technology
          </p>
        </div>

        {/* Form */}
        <Card className="border border-slate-200 bg-white">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-8 pb-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-900">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className="h-11 text-base bg-white border-slate-200 focus-visible:ring-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-900">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className="h-11 text-base bg-white border-slate-200 focus-visible:ring-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-900">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    disabled={isLoading}
                    className="h-11 text-base bg-white border-slate-200 focus-visible:ring-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pb-8">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors"
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
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm text-slate-600">Already have an account?</span>
                <Link 
                  href="/login" 
                  className="text-sm text-slate-900 hover:text-slate-700 font-medium transition-colors"
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