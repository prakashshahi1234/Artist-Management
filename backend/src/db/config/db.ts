import mysql from 'mysql2/promise';
import { setTimeout } from 'timers/promises';
import { dbConfig } from './db.config';
import { DatabaseQueries } from '../queries/queries';
import { AppError } from '../../utils/errorhandler';

interface DatabaseOptions {
  connectionLimit?: number;
  connectTimeout?: number;
  idleTimeout?: number;
  retryInterval?: number;
  maxRetries?: number;
}

class Database {
  private static instance: Database;
  private serverPool: mysql.Pool;
  private dbPool: mysql.Pool | null = null;
  private currentDatabase: string | null = null;
  private isShuttingDown = false;
  private options: Required<DatabaseOptions>;
  private isInitialized = false;

  private constructor() {
    this.options = {
      connectionLimit: dbConfig.connectionLimit || 10,
      connectTimeout: 30000,
      idleTimeout: 60000,
      retryInterval: 5000,
      maxRetries: 3,
      ...dbConfig,
    };

    this.serverPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      waitForConnections: true,
      connectionLimit: this.options.connectionLimit,
    });

    this.verifyServerConnection();
  }

  private async verifyServerConnection() {
    try {
      const conn = await this.serverPool.getConnection();
      await conn.ping();
      conn.release();
      console.log('[DB] Connected to MySQL server');
    } catch (error) {
       throw new AppError("Database connection error.")
    }

  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async createDatabase(dbName: string): Promise<void> {
    await this.serverPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`[DB] Database "${dbName}" ensured`);
  }

  public async useDatabase(dbName: string): Promise<void> {
    if (this.dbPool && this.currentDatabase === dbName) return;

    if (this.dbPool) await this.dbPool.end();

    this.dbPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbName,
      port: dbConfig.port,
      waitForConnections: true,
      connectionLimit: this.options.connectionLimit,
      connectTimeout: this.options.connectTimeout,
    });

    this.currentDatabase = dbName;

    const conn = await this.dbPool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`[DB] Connected to database: ${dbName}`);
  }

  public async initializeTables(): Promise<void> {
    if (!this.dbPool) {
      throw new AppError('No database selected. Call useDatabase() first.', 500);
    }

    if (this.isInitialized) return;

    await this.query(DatabaseQueries.CREATE_USER_TABLE);
    await this.query(DatabaseQueries.CREATE_ARTIST_TABLE);
    await this.query(DatabaseQueries.CREATE_SONG_TABLE);

    this.isInitialized = true;
    console.log('[DB] Tables initialized successfully');
  }

  public async getCurrentDatabase(): Promise<string | null> {
    return this.currentDatabase;
  }

  public async query<T = any>(
    sql: string,
    params?: any[],
    options?: { retries?: number }
  ): Promise<T> {
    if (!this.dbPool) {
      throw new AppError('No database selected. Call useDatabase() first.', 500);
    }

    const maxRetries = options?.retries ?? this.options.maxRetries;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const [results] = await this.dbPool.query(sql, params);
        return results as T;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(
            `Query attempt ${attempt + 1} failed, retrying in ${this.options.retryInterval}ms`,
            { sql, error }
          );
          await setTimeout(this.options.retryInterval);
        }
      }
    }

    throw new AppError(
      `Query failed after ${maxRetries} retries for SQL: ${sql}`,
      500,
      true
    );
  }

  public async close(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    if (this.dbPool) {
      await this.dbPool.end();
    }

    await this.serverPool.end();
    console.log('[DB] Database connections closed');
    Database.instance = null as any;
  }
}

export default Database.getInstance();
