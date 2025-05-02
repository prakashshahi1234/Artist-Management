import { config } from "dotenv";
config();
interface DbConfig {
    host: string;
    user: string;
    password: string;
    port: number;
    connectionLimit?: number;
    waitForConnections?: boolean;
    queueLimit?: number;
  }
  

export const dbConfig: DbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'my_strong_password',
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  };