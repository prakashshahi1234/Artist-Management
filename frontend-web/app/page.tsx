"use client"
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";
import Loading from "./(auth)/Loading";
import { useRouter } from "next/navigation";

export default function Home() {
  
  const {user, isLoading} = useAuth();
  const router = useRouter()

  if(isLoading) return <Loading/>

  if(!user){
     router.push("/login")
     return;
  }


  return (
      <div>
        <p className="">{user.email}</p>
      </div>
  );
}
