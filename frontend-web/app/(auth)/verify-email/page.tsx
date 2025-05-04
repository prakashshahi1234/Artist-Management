'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'


export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { verifyEmail} = useAuth()
  const {mutate,isPending, isSuccess, isError, error} = verifyEmail;

  useEffect(() => {
    if (token) {
      mutate(token)
    }
  }, [token, mutate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-sm">
        {isPending && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <h1 className="text-2xl font-bold">Verifying Email...</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address
            </p>
          </div>
        )}

        {isSuccess && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold">Email Verified!</h1>
            <p className="text-center text-muted-foreground">
              Your email has been successfully verified. You can now access all features.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-center text-muted-foreground">
              {error instanceof Error ? error.message : 'Invalid or expired verification link'}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild>
                <Link href="/resend-verification">Resend Verification</Link>
              </Button>
            </div>
          </div>
        )}

        {!token && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <h1 className="text-2xl font-bold">Missing Token</h1>
            <p className="text-center text-muted-foreground">
              The verification link appears to be incomplete. Please check your email again.
            </p>
            <Button asChild className="mt-4">
              <Link href="/resend-verification">Resend Verification Email</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}