"use client"

import { ReactNode } from "react"
import { useAuth } from "./AuthProvider"

type AuthorizerProps = {
  allowedRoles: ("artist_manager" | "artist" | "super_admin")[]
  children: ReactNode
  fallback?: ReactNode
}

export default function Authorizer({ allowedRoles, children, fallback = null }: AuthorizerProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback
  }

  return <>{children}</>
}
