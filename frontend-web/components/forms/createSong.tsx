"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const songFormSchema = z.object({
  artist_id: z.number(),
  title: z.string().min(1, { message: "Title is required" }),
  album_name: z.string().optional(),
  genre: z.enum(["rnb", "country", "rock", "jazz", "classic"]).optional(),
})

export type CreateSongData = z.infer<typeof songFormSchema>

type CreateSongProps = {
  onCreate: (songData: CreateSongData) => Promise<void> | void;
  artistId:number;
}

export function CreateSongForm({ onCreate ,artistId }: CreateSongProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<CreateSongData>({
    resolver: zodResolver(songFormSchema),
    defaultValues: {
      artist_id:artistId,
      title: "",
      album_name: "",
    },
  })
  
  async function handleSubmit(values: CreateSongData) {
    try {
      setIsSubmitting(true)
      await onCreate(values)
      form.reset() // Clear form after successful submission
    } catch (error) {
      console.error("Failed to create song:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Artist ID */}
        {/* <FormField
          name="artist_id"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist ID</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter Artist ID"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        {/* Song Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Song Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter song title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Album Name */}
        <FormField
          name="album_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Album Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter album name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Genre */}
        <FormField
          name="genre"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="rnb">R&B</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="jazz">Jazz</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Song"}
        </Button>
      </form>
    </Form>
  )
}

export function CreateSongPopover({ onCreate, artistId }: CreateSongProps) {
  const [isOpen, setIsOpen] = useState(false)
  console.log(artistId, "here is the artist id")
  const handleCreate = async (data: CreateSongData) => {
    await onCreate(data)
    setIsOpen(false) // Close popover after successful creation
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Create Song</Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 bg-white rounded-md shadow-md">
        <h3 className="text-lg font-medium mb-4">Create New Song</h3>
        <CreateSongForm artistId={artistId} onCreate={handleCreate} />
      </PopoverContent>
    </Popover>
  )
}