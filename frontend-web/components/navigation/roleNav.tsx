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

export const navConfig: Record<string, { label: string; href?: string; onClick?: () => void }[]> = {
  super_admin: [
    { label: "Register Artist Manager", href: "/register" },
  ],
  artist_manager: [
    { label: "Register Artist", href: "/register" },
    { label: "Export Artist" }, // handled below
    { label: "Import Artist" }, // handled below
  ],
}

export default function Nav({ role }: NavProps) {
  const links = navConfig[role] || []
  const { logout } = useAuth()
  const { mutate, isPending } = logout
  const { downloadCSV, importCSV } = useArtists()
  const { mutate: exportArtists, isPending: isExporting } = downloadCSV
  const { mutate: mutateImportCsv, isPending: isImporting } = importCSV;

  return (
    <nav className="flex items-center justify-between bg-white shadow px-4 py-3">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="space-x-2">
        {links.map((item, index) => {
          return (
            <NavItem
              key={index}
              item={item}
              exportArtists={exportArtists}
              isExporting={isExporting}
              importCSV={mutateImportCsv}
              isImporting={isImporting}
            />
          )
        })}

        <LogoutButton mutate={mutate} isPending={isPending} />
      </div>
    </nav>
  )
}

interface NavItemProps {
  item: { label: string; href?: string; onClick?: () => void }
  exportArtists: () => void
  isExporting: boolean
  importCSV: (file: File) => void
  isImporting: boolean
}

const NavItem = ({
  item,
  exportArtists,
  isExporting,
  importCSV,
  isImporting,
}: NavItemProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importCSV(file)
      e.target.value = "" // reset file input
    }
  }

  if (item.label === "Export Artist") {
    return (
      <Button onClick={() => exportArtists()} disabled={isExporting}>
        {isExporting ? "Exporting..." : "Export Artist"}
      </Button>
    )
  }

  if (item.label === "Import Artist") {
    return (
      <div className="inline-block">
        <Button onClick={handleImportClick} disabled={isImporting}>
          {isImporting ? "Importing..." : "Import Artist"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    )
  }

  if (item.href) {
    return (
      <Link href={item.href}>
        <Button variant="default">{item.label}</Button>
      </Link>
    )
  }

  return null
}

interface LogoutButtonProps {
  mutate: () => void
  isPending: boolean
}

const LogoutButton = ({ mutate, isPending }: LogoutButtonProps) => {
  return (
    <Button disabled={isPending} onClick={() => mutate()} variant="default">
      Log Out
    </Button>
  )
}
