'use client'

import { createContext, useContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/config/axios'
import { useRouter } from 'next/navigation'

type UserRole = 'super_admin' | 'artist_manager' | 'artist'
type UserGender = 'm' | 'f' | 'o' // male, female, other

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  dob: string // ISO date string
  gender: UserGender
  address: string
  role: UserRole
}

interface AuthContextType {
  user?: User | null
  isLoading: boolean
  isError: boolean
  refetchUser: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await axiosClient.get('/user/profile')
        if (response.status === 200) {
          return response.data.data as User
        }
        return null
      } catch (error) {
        console.error('Failed to fetch user', error)
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1,
  })

  const refetchUser = async () => {
    await queryClient.invalidateQueries({ queryKey: ['currentUser'] })
  }

  const isAdmin = user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isError,
      refetchUser,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}