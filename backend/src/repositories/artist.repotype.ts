export type Artist = {
    id: number
    name: string
    dob: Date | null
    gender: 'm' | 'f' | 'o' | null
    address: string | null
    first_release_year?: number | null
    no_of_album_released: number
    user_id: number
    created_at: Date
    updated_at: Date | null
  }
  
  export interface IArtistRepository {
    create(artist: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<number>
    findById(id: number): Promise<Artist | null>
    findAll(limit?: number, offset?: number): Promise<Artist[]>
    update(id: number, updates: Partial<Omit<Artist, 'id' | 'created_at' | 'updated_at'>>): Promise<void>
    delete(id: number): Promise<void>
  }
  