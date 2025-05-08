'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axiosClient from '@/config/axios'

export interface Song {
  id: number
  title: string
  artist_id: number
  genre?: "rnb"| "country" | "rock" | "jazz" | "classic";
  album_name?: string
  created_at: string
  updated_at: string
}

interface SongsResponse {
  data: Song[]
  pagination: {
    perPage: number
    currentPage: number
    totalSongs: number
    totalPages: number
  }
}

interface UseSongsOptions {
  page?: number
  limit?: number
  artistId: number
}

export const useSongs = (options?: UseSongsOptions) => {
  const { page = 1, limit = 10, artistId } = options || { artistId: 0 }
  const queryClient = useQueryClient()
  
  // Make sure artistId is included in the query key
  const queryKey = ['songs', artistId, page, limit]
  
  const songsQuery = useQuery<SongsResponse>({
    queryKey,
    queryFn: async () => {
      // Skip the query or handle invalid artistId
      if (!artistId) {
        throw new Error('Artist ID is required')
      }
      
      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('limit', String(limit))
      
      try {
        const response = await axiosClient.get(`/song/artist/${artistId}?${params.toString()}`)
        return response.data
      } catch (error: any) {
        console.error(`Error fetching songs for artist ${artistId}:`, error)
        throw new Error(error?.response?.data?.message || error?.message || 'Failed to fetch songs')
      }
    },
    enabled: Boolean(artistId), // Only run when artistId is truthy
    retry: 1 // Limit retries on failure
  })

  // Helper to safely invalidate queries with the correct artistId
  const invalidateSongsQueries = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['songs', artistId] // Only invalidate queries for this specific artist
    })
  }

  const deleteSong = useMutation({
    mutationFn: async (songId: number) => {
      const res = await axiosClient.delete(`/song/${songId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Song deleted successfully')
      invalidateSongsQueries()
    },
    onError: (err: any) => {
      toast.error('Failed to delete song: ' + (err?.response?.data?.message || 'Please try again'))
    }
  })

  const updateSong = useMutation({
    mutationFn: async (song: Partial<Song>) => {
      const { id, ...rest } = song
      const res = await axiosClient.patch(`/song/${id}`, rest)
      return res.data
    },
    onSuccess: () => {
      toast.success('Song updated successfully')
      invalidateSongsQueries()
    },
    onError: (err: any) => {
      toast.error('Failed to update song: ' + (err?.response?.data?.message || 'Please try again'))
    }
  })

  const addSong = useMutation({
    mutationFn: async (song: Omit<Song, 'id' | 'created_at' | 'updated_at'>) => {
      const res = await axiosClient.post(`/song`, song)
      return res.data
    },
    onSuccess: () => {
      toast.success('Song added successfully')
      invalidateSongsQueries()
    },
    onError: (err: any) => {
      toast.error('Failed to add song: ' + (err?.response?.data?.message || 'Please try again'))
    }
  })

  return {
    songs: songsQuery,
    deleteSong,
    updateSong,
    addSong,
  }
}