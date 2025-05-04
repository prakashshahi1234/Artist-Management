"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import Image from "next/image"
import Loading from "./(auth)/Loading"
import { useRouter } from "next/navigation"
import MainNav from "@/components/navigation/mainNav"
import LoginForm from "./(auth)/login/page"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if (user.role === "super_admin" || user.role === "artist_manager") {
        router.push("/users/all")
      } else {
        router.push("/songs/all")
      }
    }
  }, [user, router])

  if (isLoading) return <Loading />

  return (
    <>
      <MainNav />
      <LoginForm />
    </>
  )
}
