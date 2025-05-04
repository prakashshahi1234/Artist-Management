import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/config/axios'
import { User } from '@/types/user'

interface UsersResponse {
  data: User[]
  pagination: {
    perPage: number
    currentPage:number;
    totalUsers: number
    totalPages: number
  }
}

interface UseUsersOptions {
  limit?: number
  page?: number
}

export const useUsers = (options?: UseUsersOptions) => {
  const queryClient = useQueryClient()
  const { limit, page } = options || {}

  // Fetch users, optionally with pagination
  const usersQuery = useQuery<UsersResponse>({
    queryKey: ['users', limit, page],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (limit) query.append('limit', String(limit))
      if (page) query.append('page', String(page))
      const res = await axiosClient.get(`/user?${query.toString()}`)
      return res.data
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const res = await axiosClient.delete(`/user/remove/${userId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error('Failed to delete user: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  const updateUser = useMutation({
    mutationFn: async (user: User) => {
      const {id, ...rest} = user;
      const res = await axiosClient.patch(`/user/update/${user.id}`, rest)
      return res.data
    },
    onSuccess: () => {
      toast.success('User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error('Failed to update user: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  const addUser = useMutation({
    mutationFn: async (user: User) => {
      const res = await axiosClient.post(`/user`, user)
      return res.data
    },
    onSuccess: () => {
      toast.success('User added successfully')
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      toast.error('Failed to add user: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  return {
    users: usersQuery,
    deleteUser,
    updateUser,
    addUser
  }
}
