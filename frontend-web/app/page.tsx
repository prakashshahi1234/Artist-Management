"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

import MainNav from "@/components/navigation/mainNav";
import LoginForm from "./(auth)/login/page";
import Loading from "./(auth)/Loading";
import Page from "./(auth)/register/page";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  console.log("home page rendered")
  useEffect(() => {
    if (user) {
      if (user.role === "super_admin" ) {
        router.push("/users");
      }else if( user.role === "artist_manager"){
        router.push("/artists");
      }
    }
  }, [user, router, isLoading]);

  if (isLoading) return <Loading />;

  if (!user) {
    return (
      <>
        <div className="flex justify-center items-center min-h-[80vh] px-4">
          <div className="w-full max-w-md">
            <Page />
          </div>
        </div>
      </>
    );
  }

  return null;
}
