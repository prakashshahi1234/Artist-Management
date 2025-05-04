import type { OkPacket, RowDataPacket } from 'mysql2';
import db from '../config/db';
import { IUserRepository, User } from '../../repositories/user.repotype';

export class UserRepository implements IUserRepository {
  async create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    dob: Date | null,
    gender: 'm' | 'f' | '0',
    address: string,
    role: User['role'],
    verification_token: string | null = null
  ): Promise<number> {
    const result = await db.query<OkPacket>(
      `INSERT INTO users 
       (first_name, last_name, email, password, phone, dob, gender, address, role, verification_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, password, phone, dob, gender, address, role, verification_token]
    );
    return result.insertId;
  }

  async findById(id: number): Promise<User | null> {
    const [users] = await db.query<User[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return users || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [users] = await db.query<User[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return users || null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const users = await db.query<User[]>(
      'SELECT * FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return users;
  }

  async update(
    id: number,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    const fields = Object.keys(updates);
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);
    values.push(id);

    await db.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );
  }

  async updateVerificationStatus(
    id: number,
    isVerified: boolean,
    verificationToken: string | null = null
  ): Promise<void> {
    await db.query(
      'UPDATE users SET is_verified = ?, verification_token = ? WHERE id = ?',
      [isVerified, verificationToken, id]
    );
  }

  async delete(id: number): Promise<void> {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  }

  async findByVerificationToken(token: string): Promise<User | null>{
    const [users] = await db.query<User[]>(
      'SELECT * FROM users WHERE verification_token = ? LIMIT 1',
      [token]
    );
    return users || null;
  }
}
