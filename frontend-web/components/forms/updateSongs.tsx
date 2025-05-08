'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Song } from '@/hooks/useSong'

const formSchema = z.object({
  id: z.number(),
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  genre: z.enum(["rnb", "country", "rock", "jazz", "classic"]).optional(),
  album_name: z.string().optional(),
})

type SongFormData = z.infer<typeof formSchema>

type SongUpdateDialogProps = {
  song: Song
  onUpdate: (songData: SongFormData) => Promise<void> | void
}

export default function SongUpdateDialog({ song, onUpdate }: SongUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<SongFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: song.id,
      title: song.title,
      genre: song.genre,
      album_name: song.album_name || '',
    },
  })
  
  const handleSubmit = async (values: SongFormData) => {
    try {
      setIsSubmitting(true)
      await onUpdate(values)
      setOpen(false)
    } catch (error) {
      console.error("Failed to update song:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white px-2 py-1 rounded">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Song</DialogTitle>
          <DialogDescription>Make changes to the song and click save.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
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
            <FormField name="album_name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Album Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}