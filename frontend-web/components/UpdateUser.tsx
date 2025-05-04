"use client"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useEffect } from "react"
import { useAuth } from "./AuthProvider"

const formSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  gender: z.enum(["m", "f", "o"]),
  address: z.string().min(10),
  role: z.enum(["super_admin", "artist_manager", "artist"]),
})

type FormValues = z.infer<typeof formSchema>

type UserUpdateFormProps = {
  user: {
    id: string | number;
    first_name: string
    last_name: string
    gender: "m" | "f" | "o"
    address: string
    role: "super_admin" | "artist_manager" | "artist"
  }
  updateUser: {
    mutate: (data: any) => void
    isPending: boolean
  }
}

export function UserUpdateDialog({ user, updateUser }: UserUpdateFormProps) {


   const {user:currentUser} = useAuth()

    const roleOptions =
    currentUser?.role === "super_admin"
      ? [
          { label: "Super Admin", value: "super_admin" },
          { label: "Artist Manager", value: "artist_manager" },
          { label: "Artist", value: "artist" },
        ]
      : currentUser?.role === "artist_manager"
      ? [{ label: "Artist", value: "artist" }]
      : []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      gender: user.gender,
      address: user.address,
      role: user.role,
    },
  })

  useEffect(() => {
    form.reset(user)
  }, [user])

  const onSubmit = (values: FormValues) => {
    updateUser.mutate({ id: user.id, ...values })
  }

  return (
    <Dialog >
      <DialogTrigger asChild>
        <Button   className="bg-blue-500 text-white px-2 py-1 rounded ml-2"  variant="outline">Update User</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update User Details</DialogTitle>
          <DialogDescription>
            Make changes to the user details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                      <SelectItem value="o">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

<FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" disabled={updateUser.isPending} className="w-full">
              {updateUser.isPending ? "Updating..." : "Update User"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
