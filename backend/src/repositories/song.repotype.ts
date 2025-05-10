export type Song = {
    id: number;
    artist_id: number;
    title: string;
    album_name?: string | null;
    genre?: 'rnb' | 'country' | 'rock' | 'jazz' | 'classic' | null;
    created_at: Date;
    updated_at: Date;
  };

  

  export interface ISongRepository  {
    create(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
    findById(id: number): Promise<Song | null>;
    update(id: number, updates: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>): Promise<void>;
    delete(id: number): Promise<void>;
    findAll(limit?: number, offset?: number): Promise<Song[]>;
    findByArtist(artistId: number): Promise<Song[]>;
  }