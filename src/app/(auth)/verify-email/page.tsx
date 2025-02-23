'use client'

import { useState } from 'react'
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { MailCheck } from 'lucide-react'

export default function VerifyEmail() {
  const { signUp, isLoaded } = useSignUp()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isLoaded || !signUp) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === "complete") {
        toast.success("Email verified! Redirecting to login...")
        router.push("/login")
      } else {
        toast.error("Verification failed. Please try again.")
      }
    } catch (error: any) {
      const errorMessage = error?.errors?.[0]?.message || "Verification failed"
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
            <MailCheck className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-3xl font-bold">Verify your email</h2>
          <p className="text-muted-foreground mt-2">
            We sent you a verification code. Please check your email.
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 