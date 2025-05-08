'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Popover } from '@/components/ui/popover'
import { AlertProvider } from '@/components/customPopOver'
import Authorizer from '@/components/Authorizer'
import Nav from '@/components/navigation/roleNav'
import { useAuth } from '@/components/AuthProvider'
import { useArtists } from '@/hooks/useArtist'
import ArtistUpdateDialog from '@/components/forms/updateArtist'
import { Button } from '@/components/ui/button'

const ArtistList = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Get page and limit from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const limitFromUrl = parseInt(searchParams.get('limit') || '10', 10)

  const [page, setPage] = useState(pageFromUrl)
  const [limit, setLimit] = useState(limitFromUrl)

  const { artists, deleteArtist, updateArtist } = useArtists({ page, limit })
  const { data, isLoading, isError } = artists;

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    params.set('limit', limit.toString())

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [page, limit])

  const handleNextPage = () => {
    if (data?.pagination?.currentPage! < data?.pagination?.totalPages!) {
      setPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // reset to page 1 on limit change
  }

  const handleNavigateToSongs = (artistId:number)=> router.push(`/songs/${artistId}`)

  if (isLoading) return <div>Loading...</div>

  return (
    <Authorizer  
      fallback={<div>You are not authorized to use this page.</div>}
      allowedRoles={["super_admin", 'artist_manager']}
    >
      <div className="container mx-auto p-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Artist List</h2>
          <Nav role={user?.role!}/>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">S.N.</th>
                <th className="py-2 px-4 border text-left">Name</th>
                <th className="py-2 px-4 border text-left">Date of Birth</th>
                <th className="py-2 px-4 border text-left">Gender</th>
                <th className="py-2 px-4 border text-left">Address</th>
                <th className="py-2 px-4 border text-left">First Release Year</th>
                <th className="py-2 px-4 border text-left">Albums Released</th>
                <th className="py-2 px-4 border text-left">Created At</th>
                <th className="py-2 px-4 border text-left">Updated At</th>
                <th className="py-2 px-4 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((artist, index) => (
                <tr key={artist.id} className="border-b">
                  <td className="py-2 px-4">{index+1}</td>
                  <td className="py-2 px-4">{artist.name}</td>
                  <td className="py-2 px-4">{artist.dob ? new Date(artist.dob)?.toLocaleDateString() : 'N/A'}</td>
                  <td className="py-2 px-4">{artist.gender ?? 'N/A'}</td>
                  <td className="py-2 px-4">{artist.address ?? 'N/A'}</td>
                  <td className="py-2 px-4">{artist.first_release_year ?? 'N/A'}</td>
                  <td className="py-2 px-4">{artist.no_of_album_released}</td>
                  <td className="py-2 px-4">{new Date(artist.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-4">{artist.updated_at ? new Date(artist.updated_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-2 px-4 flex">

                  <Button onClick={()=>handleNavigateToSongs(artist.id)}>See Songs</Button>
                  <ArtistUpdateDialog onUpdate={(artistData)=>updateArtist.mutateAsync(artistData)} artist={artist}  />

                    <AlertProvider
                      trigger={(
                        <button
                          disabled={deleteArtist.isPending}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                      onConfirm={() => deleteArtist.mutate(artist.id)}
                    />

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">Show:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border p-1 rounded"
            >
              {[1, 10, 20, 50].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="ml-2">entries</span>
          </div>

          <div className="flex items-center">
            <button
              onClick={handlePrevPage}
              className="bg-gray-300 py-1 px-3 rounded"
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="mx-3">{page}</span>
            <button
              onClick={handleNextPage}
              className="bg-gray-300 py-1 px-3 rounded"
              disabled={data?.pagination.currentPage == data?.pagination.totalPages!}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Authorizer>
  )
}

export default ArtistList;
