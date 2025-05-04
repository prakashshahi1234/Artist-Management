// hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import * as z from 'zod'
import axiosClient from '@/config/axios'

export const useAuth = () => {
  const router = useRouter()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const response = await axiosClient.post('/user/login', values)
      return response.data
    },
    onSuccess: (data) => {
      toast.success("Login successful")
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }
      router.push('/dashboard')
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error?.response?.data?.message || "Invalid credentials"
      })
    }
  })

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        dob: format(values.dob, 'yyyy-MM-dd')
      }
      const response = await axiosClient.post('/user/register', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success("Registration successful! Please check your email to verify your account.")
      router.push('/login')
    },
    onError: (error: any) => {
      toast.error("Registration failed: " + (error?.response?.data?.message || "Please try again"))
    }
  })

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axiosClient.post('/user/forgot-password', { email })
      return response.data
    },
    onSuccess: () => {
      toast.success("Password reset link sent successfully")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        "Failed to send reset link. Please try again later."
      )
    }
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await axiosClient.post('/user/reset-password', { token, newPassword })
      return response.data
    },
    onSuccess: () => {
      toast.success("Password reset successfully")
      router.push('/login')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        "Failed to reset password. Please try again."
      )
    }
  })

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await axiosClient.get(`/user/verify-email?token=${token}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Email verified successfully")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        "Failed to verify email. Please try again."
      )
    }
  })

  return {
    login: {
      mutate: loginMutation.mutate,
      isPending: loginMutation.isPending,
    },
    register: {
      mutate: registerMutation.mutate,
      isPending: registerMutation.isPending,
      isSuccess: registerMutation.isSuccess,
    },
    forgotPassword: {
      mutate: forgotPasswordMutation.mutate,
      isPending: forgotPasswordMutation.isPending,
      isSuccess: forgotPasswordMutation.isSuccess,
    },
    resetPassword: {
      mutate: resetPasswordMutation.mutate,
      isPending: resetPasswordMutation.isPending,

    },
    verifyEmail: {
      mutate: verifyEmailMutation.mutate,
      isPending: verifyEmailMutation.isPending,
      isSuccess: verifyEmailMutation.isSuccess,
      isError:verifyEmailMutation.isError,
      error:verifyEmailMutation.error
    }
  }
}