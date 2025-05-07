"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "../AuthProvider";

export default function MainNav() {
  const { user } = useAuth();
  const router = useRouter();


  if (!user) {
    return (
      <nav className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white shadow-md border-b">
        <h1 className="text-xl font-bold text-gray-800">🎵 Artist Management</h1>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="default">Register</Button>
          </Link>
        </div>
      </nav>
    );
  }

  return null; 
}
