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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5">
      <div className="w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center p-8 text-center">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white p-3 rounded-2xl inline-block mx-auto">
                <UserPlus className="w-10 h-10" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                Join AI Platform
              </h2>
              <p className="text-muted-foreground text-lg">
                Start your journey with cutting-edge AI technology
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="lg:p-8">
            <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
              <form onSubmit={handleSubmit}>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                        disabled={isLoading}
                        className="h-12 text-base bg-white/5 border-white/10 focus-visible:ring-violet-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        disabled={isLoading}
                        className="h-12 text-base bg-white/5 border-white/10 focus-visible:ring-violet-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        required
                        disabled={isLoading}
                        className="h-12 text-base bg-white/5 border-white/10 focus-visible:ring-violet-500"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-5 pb-8">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
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
                    <span className="text-muted-foreground">Already have an account?</span>
                    <Link 
                      href="/login" 
                      className="text-violet-500 hover:text-violet-400 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}