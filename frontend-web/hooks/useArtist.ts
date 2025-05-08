import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/config/axios'
export type Artist = {
    id: number
    name: string
    dob: Date | null
    gender: 'm' | 'f' | 'o' | null
    address: string | null
    first_release_year?: number | null
    no_of_album_released: number
    user_id: number
    created_at: Date
    updated_at: Date | null
  }

interface ArtistsResponse {
  data: Artist[]
  pagination: {
    perPage: number
    currentPage: number
    totalArtists: number
    totalPages: number
  }
}

interface UseArtistsOptions {
  limit?: number
  page?: number
}

export const useArtists = (options?: UseArtistsOptions) => {
  const queryClient = useQueryClient()
  const { limit, page } = options || {}

  // Fetch artists, optionally with pagination
  const artistsQuery = useQuery<ArtistsResponse>({
    queryKey: ['artists', limit, page],
    queryFn: async () => {
      const query = new URLSearchParams()
      if (limit) query.append('limit', String(limit))
      if (page) query.append('page', String(page))
      const res = await axiosClient.get(`/artists?${query.toString()}`)
      return res.data
    }
  })

  // Delete artist
  const deleteArtist = useMutation({
    mutationFn: async (artistId: number) => {
      const res = await axiosClient.delete(`/artists/${artistId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Artist deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
    onError: (error: any) => {
      toast.error('Failed to delete artist: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  // Update artist
  const updateArtist = useMutation({
    mutationFn: async (artist: Partial<Artist>) => {
      const { id, ...rest } = artist
      const res = await axiosClient.patch(`/artists/${id}`, rest)
      return res.data
    },
    onSuccess: () => {
      toast.success('Artist updated successfully')
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
    onError: (error: any) => {
      toast.error('Failed to update artist: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  // Add new artist
  const addArtist = useMutation({
    mutationFn: async (artist: Artist) => {
      const res = await axiosClient.post(`/artists`, artist)
      return res.data
    },
    onSuccess: () => {
      toast.success('Artist added successfully')
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
    onError: (error: any) => {
      toast.error('Failed to add artist: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  // Download CSV
const downloadCSV = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.get('/artists/download/csv', {
        responseType: 'blob', // important for file downloads
      })
  
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'artists.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    onSuccess: () => {
      toast.success('Artists CSV downloaded successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to download CSV: ' + (error?.response?.data?.message || 'Please try again'))
    }
  })

  const importCSV = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosClient.post('/artists/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    },
    onSuccess: () => {
      toast.success('Artists imported successfully')
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
    onError: (error: any) => {
      toast.error('Failed to import CSV: ' + (error?.response?.data?.message || 'Please try again'))
    },
  })
  

  return {
    artists: artistsQuery,
    importCSV,
    deleteArtist,
    updateArtist,
    addArtist,
    downloadCSV
  }
}
