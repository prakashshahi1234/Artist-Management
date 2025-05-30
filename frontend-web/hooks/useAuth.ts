"use client"

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import * as z from 'zod'
import axiosClient from '@/config/axios'
import { useAuth as useAuthProvider } from '@/components/AuthProvider'
export const useAuth = () => {
  const router = useRouter();
  const {refetchUser} = useAuthProvider()
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const response = await axiosClient.post('/user/login', values)
      return response.data
    },
    onSuccess: async({data:user}) => {
      console.log(user)
      await refetchUser()
      if (user.role === "super_admin") {
        router.push("/users");
      } else if(user.role === "artist_manager"){
        router.push("/artists");
      }else if(user.role==='artist') {
        router.push(`/songs/${user.artistId}`);
      }
      else{
        toast.error("Your identity is removed.")
      }
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error?.response?.data?.message || "Invalid credentials"
      })
    }
  })

  // User Registration
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
      toast.success("Registration successful! Please check your email to verify your account.");
      router.push("/")
    },
    onError: (error: any) => {
      toast.error("Registration failed: " + (error?.response?.data?.message || "Please try again"))
    }
  })

  // ✅ Admin Registration
  const registerAdminMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        ...values,
        dob: format(values.dob, 'yyyy-MM-dd')
      }
      const response = await axiosClient.post('/user/register-admin', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success("Admin registered successfully!  Please check your email to verify your account.")
      router.push('/login')
    },
    onError: (error: any) => {
      toast.error("Admin registration failed: " + (error?.response?.data?.message || "Please try again"))
    }
  })

  // Forgot password
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await axiosClient.post('/user/forgot-password', { email })
      return response.data
    },
    onSuccess: () => {
      toast.success("Password reset link sent successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send reset link. Please try again later.")
    }
  })

  // Reset password
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
      toast.error(error?.response?.data?.message || "Failed to reset password. Please try again.")
    }
  })

  // Email verification
  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await axiosClient.get(`/user/verify-email?token=${token}`)
      return response.data
    },
    onSuccess: () => {
      toast.success("Email verified successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to verify email. Please try again.")
    }
  })


  // Logout mutation
const logoutMutation = useMutation({
  mutationFn: async () => {
    const response = await axiosClient.get('/user/logout')
    return response.data
  },
  onSuccess: () => {
    toast.success('Logged out successfully')
    router.push('/login');
    refetchUser()

  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.message || 'Logout failed')
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
    registerAdmin: {
      mutate: registerAdminMutation.mutate,
      isPending: registerAdminMutation.isPending,
      isSuccess: registerAdminMutation.isSuccess,
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
      isError: verifyEmailMutation.isError,
      error: verifyEmailMutation.error
    },
    logout: {
      mutate: logoutMutation.mutate,
      isPending: logoutMutation.isPending,
    }
    
  }
}
