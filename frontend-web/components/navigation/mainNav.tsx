// components/MainNav.tsx
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "../AuthProvider"

export default function MainNav() {
  const {user} = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === "super_admin" || user.role === "artist_manager") {
        router.replace("/users/all")
      } else {
        router.replace("/songs/all")
      }
    }
  }, [user, router])

  if (!user) {
    return (
      <nav className="flex items-center justify-end gap-4 p-4 bg-white shadow">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/register">
          <Button variant="default">Register</Button>
        </Link>
        <Link href="/forgot-password">
          <Button variant="ghost">Forgot Password</Button>
        </Link>
      </nav>
    )
  }

  // Return null since redirect is handled
  return null
}
