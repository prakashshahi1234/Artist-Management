// components/Nav.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

type Role = "super_admin" | "artist_manager" | "artist"

// navConfig.ts
export const navConfig: Record<string, { label: string; href: string }[]> = {
  super_admin: [
    { label: "Register Artist Manager", href: "/register" },
  ],
  artist_manager: [
    { label: "Register Artist", href: "/register/artist" },
    { label: "Export Artist", href: "/artist/export" },
    { label: "Import Artist", href: "/artist/import" },
  ],
}


interface NavProps {
  role: Role
}

export default function Nav({ role }: NavProps) {
  const links = navConfig[role] || []

  return (
    <nav className="flex items-center justify-between bg-white shadow px-4 py-3">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="space-x-2">
        {links.map((item, index) => (
          <Link key={index} href={item.href}>
            <Button variant="default">{item.label}</Button>
          </Link>
        ))}
        <Button variant="default">Log Out</Button>

      </div>
    </nav>
  )
}
