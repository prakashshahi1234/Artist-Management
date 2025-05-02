// database-queries.ts
export const DatabaseQueries = {
  // User table queries
  CREATE_USER_TABLE: `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(500) NOT NULL,
  phone VARCHAR(20),
  dob DATETIME,
  gender ENUM('m', 'f', '0'),
  address VARCHAR(255),
  role ENUM('super_admin', 'artist_manager', 'artist') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`,

  // Artist table queries
  CREATE_ARTIST_TABLE: `
     CREATE TABLE IF NOT EXISTS artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATETIME,
  gender ENUM('m', 'f', '0'),
  address VARCHAR(255),
  first_release_year YEAR,
  no_of_album_released INT,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
   `,

  // Song table queries
  CREATE_SONG_TABLE: `CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  album_name VARCHAR(255),
  genre ENUM('rnb', 'country', 'rock', 'jazz', 'classic'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE
);
`,
};