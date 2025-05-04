'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import axiosClient from "@/config/axios"
import { useAuth } from "@/hooks/useAuth"

const formSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  })

  const {resetPassword} = useAuth()
  const {mutate, isPending} = resetPassword;

  function onSubmit(values: z.infer<typeof formSchema>) {
    if(token)
    mutate({token, newPassword:values.confirmPassword})
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center p-6">
        <h2 className="text-2xl font-semibold">Invalid Reset Link</h2>
        <p className="text-muted-foreground">
          The password reset link is missing the required token.
        </p>
        <Button onClick={() => router.push('/forgot-password')}>
          Request New Reset Link
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}