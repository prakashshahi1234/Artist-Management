// repositories/user.repository.ts
import { RowDataPacket } from 'mysql2';

// Define the User type
export interface User extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  dob: Date | null;
  gender: 'm' | 'f' | 'o';
  address: string;
  role: 'super_admin' | 'artist_manager' | 'artist';
  created_at: Date;
  updated_at: Date;
  verification_token?:string | null;
}

// Define the UserRepository interface specifically for User operations
export interface IUserRepository {
  create(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    dob: Date | null,
    gender: 'm' | 'f' | 'o',
    address: string,
    role: User['role']
  ): Promise<number>;

  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findAll(limit: number, offset: number): Promise<User[]>;

  update(
    id: number,
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void>;

  delete(id: number): Promise<void>;
}
