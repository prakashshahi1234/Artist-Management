"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle2 } from "lucide-react"
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
import { useArtists } from "@/hooks/useArtist"

const formSchema = z.object({
  id:z.coerce.number(),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dob: z.coerce.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["m", "f", "o"], { required_error: "Please select gender" }),
  address: z.string().min(10, { message: "Address must be at least 10 characters" }),
  first_release_year: z.coerce.number().optional().nullable(),
  no_of_album_released: z.coerce.number().min(0, { message: "Number of albums must be a positive number" }),
  user_id: z.coerce.number().min(1, { message: "User ID is required" }),
})

type ArtistUpdateFormProps = {
  defaultValues?: Partial<z.infer<typeof formSchema>>
  onSubmitHandler?: (data: z.infer<typeof formSchema>) => void
  successMessage?: string
}

export default function ArtistUpdateDialog({
  defaultValues,
  onSubmitHandler,
  successMessage = "Artist Updated Successfully!",
}: ArtistUpdateFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      no_of_album_released: 0,
      user_id: 1, // example user ID, you can pass this dynamically
      ...defaultValues,
    },
  })

  const {updateArtist} = useArtists()

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateArtist.mutate({...values, dob:new Date(values.dob)})
  }

 

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-500 text-white px-2 py-1 rounded ml-2">
          Update Artist
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        selected={field.value}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Textarea placeholder="Artist Address" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* First Release Year */}
            <FormField name="first_release_year" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>First Release Year</FormLabel>
                <FormControl><Input type="number" placeholder="2000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Number of Albums Released */}
            <FormField name="no_of_album_released" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Albums Released</FormLabel>
                <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full" >
              { "Update Artist"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
