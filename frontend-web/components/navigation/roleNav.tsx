"use client"
import Link from "next/link"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useArtists } from "@/hooks/useArtist"

type Role = "super_admin" | "artist_manager" | "artist"

interface NavProps {
  role: Role
}

export default function Nav({ role }: NavProps) {
  // Hooks
  const { logout } = useAuth()
  const { downloadCSV, importCSV } = useArtists()
  
  // File input reference for CSV import
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importCSV.mutate(file)
      e.target.value = "" // Reset file input
    }
  }
  
  // Function to trigger file input click
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      
      <div className="flex items-center space-x-2">
        {/* Super Admin Links */}
        {role === "super_admin" && (
          <>
          <Link href="/register">
            <Button variant="default">Register Artist Manager</Button>
          </Link>
            <Link href="/users">
            <Button variant="default">Users</Button>
          </Link>
          <Link href="/artists">
            <Button variant="default">Artists</Button>
          </Link>
          </>
        )}
        
        {/* Artist Manager Links */}
        {role === "artist_manager" && (
          <>
            <Link href="/users">
              <Button variant="default">Users</Button>
            </Link>
            <Link href="/artists">
              <Button variant="default">Artists</Button>
            </Link>
            <Link href="/register">
              <Button variant="default">Register Artist</Button>
            </Link>
            
            <Button 
              onClick={() => downloadCSV.mutate()} 
              disabled={downloadCSV.isPending}
            >
              {downloadCSV.isPending ? "Exporting..." : "Export Artist"}
            </Button>
            
            <div className="inline-block">
              <Button 
                onClick={handleImportClick} 
                disabled={importCSV.isPending}
              >
                {importCSV.isPending ? "Importing..." : "Import Artist"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </>
        )}
        
        {/* Logout Button (always visible) */}
        <Button 
          onClick={() => logout.mutate()} 
          disabled={logout.isPending} 
          variant="outline"
        >
          {logout.isPending ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </nav>
  )
}