import { AppError } from '../utils/errorhandler';
import { ArtistRepository } from '../db/repositories/artist.repository';
import { Artist } from '../repositories/artist.repotype';

export class ArtistService {
  constructor(private artistRepository: ArtistRepository) {}

  async createArtist(data: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<number> {

    // if (!data.name || !data.user_id) {
    //   throw new AppError('Name and User ID are required to create an artist', 400);
    // }

    return await this.artistRepository.create(data);
  }

  async getArtistById(id: number): Promise<Artist> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) {
      throw new AppError(`Artist not found with id ${id}`, 404);
    }
    return artist;
  }

  async getAllArtists(limit: number = 10, offset: number = 0): Promise<Artist[]> {
    return await this.artistRepository.findAll(limit, offset);
  }

  async updateArtist(
    id: number,
    updates: Partial<Omit<Artist, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Artist> {
    const existingArtist = await this.artistRepository.findById(id);
    if (!existingArtist) {
      throw new AppError(`Artist not found with id ${id}`, 404);
    }

   

    await this.artistRepository.update(id, updates);
    return { ...existingArtist, ...updates };
  }

  async deleteArtist(id: number): Promise<void> {
    const artist = await this.artistRepository.findById(id);
    if (!artist) {
      throw new AppError(`Artist not found with id ${id}`, 404);
    }

    await this.artistRepository.delete(id);
  }

  async countAllArtist(){
    return await this.artistRepository.countAllArtists()
  }

  async getArtistByUserId(userId:number){
    return await this.artistRepository.getArtistByUserId(userId)
  }
}
