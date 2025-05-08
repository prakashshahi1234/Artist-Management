'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { AlertProvider } from '@/components/customPopOver'
import { useAuth } from '@/components/AuthProvider'
import Nav from '@/components/navigation/roleNav'
import Authorizer from '@/components/Authorizer'
import { useSongs } from '@/hooks/useSong'
import { CreateSongPopover } from '@/components/forms/createSong'
import SongUpdateDialog from '@/components/forms/updateSongs'



const SongList = ({ params }: { params?: { artistId?: string } }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const limitFromUrl = parseInt(searchParams.get('limit') || '10', 10)

  const artistId = params?.artistId
    ? parseInt(params.artistId, 10)
    : parseInt(searchParams.get("artistId") || '0', 10)

  const [page, setPage] = useState(pageFromUrl)
  const [limit, setLimit] = useState(limitFromUrl)

  const { songs, deleteSong, updateSong, addSong } = useSongs({ page, limit, artistId })
  const { data, isLoading, isError } = songs

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [page, limit, pathname, router, searchParams])

  if (isLoading) return <div>Loading songs...</div>
  if (isError) return <div>Error loading songs</div>
  if (!artistId) return <div>No artist selected</div>

  return (
    <Authorizer
      fallback={<div>You are not authorized to view this page.</div>}
      allowedRoles={['super_admin', 'artist_manager', "artist"]}
    >
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Song List for Artist #{artistId}</h2>
         
          <div className='bg-white flex w-full items-center border-b-2'>
            <div className='flex-1'>
            <Nav role={user?.role!} />
            </div>
        
            <CreateSongPopover artistId={artistId} onCreate={(song) => addSong.mutateAsync(song)} />
          </div>

        </div>

        {data?.data.length === 0 ? (
          <div className="text-center py-8">No songs available for this artist</div>
        ) : (
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">S. N.</th>
                <th className="py-2 px-4 border">Title</th>
                <th className="py-2 px-4 border">Genre</th>
                <th className="py-2 px-4 border">Album</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((song, index) => (
                <tr key={song.id} className="border-b">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{song.title}</td>
                  <td className="py-2 px-4">{song.genre || 'N/A'}</td>
                  <td className="py-2 px-4">{song.album_name || 'N/A'}</td>
                  <td className="py-2 px-4 flex space-x-2">

                    <AlertProvider
                      trigger={(
                        <button
                          disabled={deleteSong.isPending}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                      onConfirm={() => deleteSong.mutate(song.id)}

                    />
                    <SongUpdateDialog song={song} onUpdate={(songData) => updateSong.mutateAsync(songData)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 flex justify-between">
          <div>
            <label>
              Show:{' '}
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="border rounded px-2 py-1"
              >
                {[1, 10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>{' '}
              entries
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-gray-200 rounded"
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {data?.pagination.totalPages || 1}</span>
            <button
              onClick={() =>
                setPage((p) =>
                  p < (data?.pagination.totalPages || 1) ? p + 1 : p
                )
              }
              className="px-3 py-1 bg-gray-200 rounded"
              disabled={page === data?.pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Authorizer>
  )
}

export default SongList