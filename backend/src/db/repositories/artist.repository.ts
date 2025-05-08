
import type { OkPacket } from 'mysql2'
import db from '../config/db'
import { Artist, IArtistRepository } from '../../repositories/artist.repotype'

export class ArtistRepository implements IArtistRepository {
  async create(artist: Omit<Artist, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const {
      name,
      dob,
      gender,
      address,
      first_release_year,
      no_of_album_released,
      user_id
    } = artist

    const result = await db.query<OkPacket>(
      `INSERT INTO artists 
      (name, dob, gender, address, first_release_year, no_of_album_released, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, dob, gender, address, first_release_year, no_of_album_released, user_id]
    )

    return result.insertId
  }

  async findById(id: number): Promise<Artist | null> {
    const [rows] = await db.query<Artist[]>(
      'SELECT * FROM artists WHERE id = ? LIMIT 1',
      [id]
    )
    return rows
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<Artist[]> {
    const artists = await db.query<Artist[]>(
      'SELECT * FROM artists ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    )
    return artists
  }

  async update(id: number, updates: Partial<Omit<Artist, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const fields = Object.keys(updates)
    if (fields.length === 0) return

    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const values = fields.map(field => (updates as any)[field])
    values.push(id)

    await db.query(
      `UPDATE artists SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    )
  }

  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM artists WHERE id = ?', [id])
  }

  async countAllArtists(): Promise<number> {
    const [rows] = await db.query<{ count: number }[]>(
      'SELECT COUNT(*) AS count FROM artists'
    )
    return rows.count
  }

  async getArtistByUserId(userId:number){
    console.log(userId)
   const artist =  (await db.query('select * FROM artists WHERE user_id = ?', [userId]))[0]
   console.log(artist)
   return artist;
  }
  
}
