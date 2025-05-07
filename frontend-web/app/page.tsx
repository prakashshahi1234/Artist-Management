"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

import MainNav from "@/components/navigation/mainNav";
import LoginForm from "./(auth)/login/page";
import Loading from "./(auth)/Loading";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === "super_admin" || user.role === "artist_manager") {
        router.push("/users/all");
      } else {
        router.push("/songs/all");
      }
    }
  }, [user, router, isLoading]);

  if (isLoading) return <Loading />;

  if (!user) {
    return (
      <>
        <div className="flex justify-center items-center min-h-[80vh] px-4">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </>
    );
  }

  return null;
}
