"use client"

import UserRegistrationForm from "@/components/forms/register"
import { useAuth } from "@/hooks/useAuth";
import { useAuth as useContextProvider } from "@/components/AuthProvider"
import Loading from "../Loading";

export default function Page() {
  const {user, isLoading} = useContextProvider()
  const { register , registerAdmin} = useAuth()
  const { mutate:registerMutate, isPending } = register;
  const { mutate:registerAdminMutate, isPending:isAdminPending } = registerAdmin;


  if(isPending || isAdminPending || isLoading){
    return <Loading/>
  }


  const isUser = user

  return (
    <UserRegistrationForm
      hideRoleField={!isUser}
      defaultValues={!isUser ?{ role:  "super_admin" } :{}}
      onSubmitHandler={(data) =>isUser ? registerMutate(data) :registerAdminMutate(data)}
      successMessage="Welcome to the platform!"
    />
  )
}
