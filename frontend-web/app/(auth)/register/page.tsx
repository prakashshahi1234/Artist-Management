"use client";
import { useAuth as useAuthContextProvider } from "@/components/AuthProvider";
import UserRegistrationForm from "@/components/forms/register";
import { useAuth } from "@/hooks/useAuth";
import Loading from "../Loading";

export default function Page() {
  const { user, isLoading } = useAuthContextProvider();
  const { register, registerAdmin } = useAuth();
  const { mutate: registerMutate, isPending } = register;
  const { mutate: registerAdminMutate, isPending: isAdminPending } = registerAdmin;

  if (isPending || isAdminPending || isLoading) {
    return <Loading />;
  }

  let allowedRoles: string[] = [];
  let canRegister = true;
  let onSubmitHandler;
  let defaultRole = "";
  let hideRoles = false

  if (!user) {
    // Not logged in: can register super_admin
    allowedRoles = ["super_admin"];
    defaultRole = "super_admin";
    onSubmitHandler = registerAdminMutate;
    hideRoles=true;
  } else {
    const role = user.role;

    if (role === "super_admin") {
      allowedRoles = ["artist_manager", "artist"];
    } else if (role === "artist_manager") {
      allowedRoles = ["artist"];
    } else {
      canRegister = false;
    }

    defaultRole = allowedRoles[0];
    onSubmitHandler = registerMutate;
  }

  if (!canRegister) {
    return (
      <div className="flex justify-center items-center  px-4 py-8">
        <p className="text-center text-gray-500">You do not have permission to create users.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center  px-4 py-8">
      <div className="w-full max-w-md">
        <UserRegistrationForm
          hideRoleField={hideRoles}
          defaultValues={{ role: defaultRole }}
          onSubmitHandler={onSubmitHandler}
          successMessage="Welcome to the platform!"
          roleOptions={allowedRoles}
        />
      </div>
    </div>
  );
}
