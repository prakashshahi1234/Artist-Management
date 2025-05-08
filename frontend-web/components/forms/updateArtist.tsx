"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

const formSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dob: z.coerce.date({ required_error: "Date of birth is required" }).nullable(),
  gender: z.enum(["m", "f", "o"], { required_error: "Please select gender" }).nullable(),
  address: z.string().min(10, { message: "Address must be at least 10 characters" }).nullable(),
  first_release_year: z.coerce.number().optional().nullable(),
  no_of_album_released: z.coerce.number().min(0, { message: "Number of albums must be a positive number" }),
  user_id: z.coerce.number().min(1, { message: "User ID is required" }),
})

export type ArtistFormData = z.infer<typeof formSchema>

type ArtistUpdateDialogProps = {
  artist: ArtistFormData
  onUpdate: (artistData: ArtistFormData) => Promise<void> | void
  buttonText?: string
  buttonClassName?: string
}

export default function ArtistUpdateDialog({
  artist,
  onUpdate,
  buttonText = "Update Artist",
  buttonClassName = "bg-blue-500 text-white px-2 py-1 rounded ml-2"
}: ArtistUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ArtistFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: artist.id,
      name: artist.name || "",
      dob: artist.dob || new Date(),
      gender: artist.gender || "m",
      address: artist.address || "",
      first_release_year: artist.first_release_year || null,
      no_of_album_released: artist.no_of_album_released || 0,
      user_id: artist.user_id || 1,
    },
  })

  async function handleSubmit(values: ArtistFormData) {
    try {
      setIsSubmitting(true)
      await onUpdate({
        ...values,
        dob: values.dob && new Date(values.dob)
      })
      setOpen(false)
    } catch (error) {
      console.error("Failed to update artist:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  console.log(form.watch("dob"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={buttonClassName}>
          {buttonText}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Artist Details</DialogTitle>
          <DialogDescription>
            Make changes to the artist details and click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Hidden ID field */}
            <input type="hidden" {...form.register("id")} />
            
            {/* Name */}
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Artist Name</FormLabel>
                <FormControl><Input placeholder="Artist Name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* DOB & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="dob" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        // selected={field.value && field.value}
                        selected={field.value ? new Date(field.value):new Date()}
                        onSelect={field.onChange}
                        fromYear={1900}
                        toYear={2020}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="gender" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "Select gender"}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="m">Male</SelectItem>
                      <SelectItem value="f">Female</SelectItem>
                      <SelectItem value="o">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Address */}
            <FormField name="address" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Artist Address" className="resize-none" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* First Release Year */}
            <FormField name="first_release_year" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>First Release Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2000" 
                    {...field} 
                    value={field.value || ""} 
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Number of Albums Released */}
            <FormField name="no_of_album_released" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Albums Released</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* User ID */}
            {/* <FormField name="user_id" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} /> */}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Artist"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}