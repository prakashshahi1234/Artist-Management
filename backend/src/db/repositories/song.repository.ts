import type { OkPacket } from 'mysql2';
import db from '../config/db';
import { Song } from '../../repositories/song.repotype';



export interface ISongRepository {
  create(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number>;
  findById(id: number): Promise<Song | null>;
  update(id: number, updates: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>): Promise<void>;
  delete(id: number): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<Song[]>;
  findByArtist(artistId: number): Promise<Song[]>;
}

export class SongRepository implements ISongRepository {
  async create(song: Omit<Song, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await db.query<OkPacket>(
      `INSERT INTO songs (artist_id, title, album_name, genre) VALUES (?, ?, ?, ?)`,
      [song.artist_id, song.title, song.album_name, song.genre]
    );
    return result.insertId;
  }

  async findById(id: number): Promise<Song | null> {
    const [songs] = await db.query<Song[]>(
      'SELECT * FROM songs WHERE id = ? LIMIT 1',
      [id]
    );
    return songs;
  }

  async update(id: number, updates: Partial<Omit<Song, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    values.push(id);

    await db.query(
      `UPDATE songs SET ${setClause} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM songs WHERE id = ?', [id]);
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<Song[]> {
    const songs = await db.query<Song[]>(
      'SELECT * FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return songs;
  }

  async findByArtist(artistId: number, limit: number = 10, offset: number = 0): Promise<Song[]> {
    const songs = await db.query<Song[]>(
      'SELECT * FROM songs WHERE artist_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [artistId, limit, offset]
    );
    return songs;
  }


  async countByArtist(artistId: number): Promise<number> {
    const result = await db.query<{ count: number }[]>(
      'SELECT COUNT(*) AS count FROM songs WHERE artist_id = ?',
      [artistId]
    );
    return result[0]?.count ?? 0; 
  }
  
}
