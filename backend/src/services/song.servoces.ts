import { SongRepository } from '../db/repositories/song.repository';
import { Song } from '../repositories/song.repotype';
import { AppError } from '../utils/errorhandler';

export class SongService {
  constructor(private songRepository: SongRepository) {}

  async createSong(songData: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!songData.title || !songData.artist_id) {
      throw new AppError('Title and artist_id are required');
    }
    return await this.songRepository.create(songData);
  }

  async getSongById(id: number): Promise<Song> {
    const song = await this.songRepository.findById(id);
    if (!song) throw new AppError('Song not found', 404);
    return song;
  }

  async updateSong(
    id: number,
    updates: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    const existing = await this.songRepository.findById(id);
    if (!existing) throw new AppError('Song not found', 404);
    await this.songRepository.update(id, updates);
  }

  async deleteSong(id: number): Promise<void> {
    const existing = await this.songRepository.findById(id);
    if (!existing) throw new AppError('Song not found', 404);
    await this.songRepository.delete(id);
  }

  async listSongs(limit: number = 10, offset: number = 0): Promise<Song[]> {
    return await this.songRepository.findAll(limit, offset);
  }

  async getSongsByArtist(
    artistId: number,
    limit: number = 10,
    offset: number = 0
  ): Promise<{
    songs: Song[];
    pagination: {
      totalSongs: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    // Fetch songs with pagination
    const songs = await this.songRepository.findByArtist(artistId, limit, offset);
  
    // Total number of songs
    const totalSongs = await this.songRepository.countByArtist(artistId);
  
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(totalSongs / limit);
  
    return {
      songs,
      pagination: {
        totalSongs,
        totalPages,
        currentPage,
        perPage: limit,
      },
    };
  }
  
  

}
