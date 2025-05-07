"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { useAuth } from "@/hooks/useAuth"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
})

export default function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  const { forgotPassword } = useAuth()
  const { mutate, isPending, isSuccess } = forgotPassword

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values.email)
  }

  return (
    <div className=" flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8">
        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-green-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to{" "}
              <span className="font-medium text-primary">
                {form.getValues("email")}
              </span>
              . Please check your inbox.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Forgot Password</h2>
                <p className="text-muted-foreground">
                  Enter your email to receive a password reset link.
                </p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
               Send Reset Link
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
