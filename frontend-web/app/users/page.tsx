"use client"
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'
import { Popover } from '@/components/ui/popover'
import { AlertProvider } from '@/components/customPopOver'
import { UserUpdateDialog } from '@/components/UpdateUser'
import Authorizer from '@/components/Authorizer'
import Nav from '@/components/navigation/roleNav'
import { useAuth } from '@/components/AuthProvider'

const UserList = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {user} =useAuth()
  // Get page and limit from URL
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const limitFromUrl = parseInt(searchParams.get('limit') || '10', 10)

  const [page, setPage] = useState(pageFromUrl)
  const [limit, setLimit] = useState(limitFromUrl)

  const { users, deleteUser, updateUser } = useUsers({ page, limit })
  const { data, isLoading, isError } = users

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

  if (isLoading) return <div>Loading...</div>

  return (
    <Authorizer  
     fallback={<div>You are not authorized to use this page.</div>}
     allowedRoles={["super_admin", 'artist_manager']}

     >
    <div className="container mx-auto p-4">
      <div>
        <h2 className="text-xl font-semibold mb-4">User List</h2>
         <Nav role={user?.role!}/>
      </div>
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border text-left">ID</th>
            <th className="py-2 px-4 border text-left">First Name</th>
            <th className="py-2 px-4 border text-left">Last Name</th>
            <th className="py-2 px-4 border text-left">Email</th>
            <th className="py-2 px-4 border text-left">Phone</th>
            <th className="py-2 px-4 border text-left">Gender</th>
            <th className="py-2 px-4 border text-left">Role</th>
            <th className="py-2 px-4 border text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map(user => (
            <tr key={user.id} className="border-b">
              <td className="py-2 px-4">{user.id}</td>
              <td className="py-2 px-4">{user.first_name}</td>
              <td className="py-2 px-4">{user.last_name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.phone}</td>
              <td className="py-2 px-4">{user.gender}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">

                <AlertProvider
                  trigger={(<button
                    disabled={deleteUser.isPending}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>)}
                  onConfirm={() => deleteUser.mutate(user.id)}
                />

                <UserUpdateDialog user={user} updateUser={updateUser} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <div className="flex items-center">
          <span className="mr-2">Show:</span>
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {[3, 10, 20, 50].map(option => (
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

export default UserList
