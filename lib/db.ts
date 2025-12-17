import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'bitify.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    youtubeId TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    channelName TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    duration INTEGER NOT NULL,
    isInLibrary INTEGER DEFAULT 1,
    createdAt INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS playlistSongs (
    id TEXT PRIMARY KEY,
    playlistId TEXT NOT NULL,
    songId TEXT NOT NULL,
    position INTEGER NOT NULL,
    addedAt INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (songId) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE(playlistId, songId)
  );

  CREATE INDEX IF NOT EXISTS idx_songs_youtubeId ON songs(youtubeId);
  CREATE INDEX IF NOT EXISTS idx_songs_isInLibrary ON songs(isInLibrary);
  CREATE INDEX IF NOT EXISTS idx_playlistSongs_playlistId ON playlistSongs(playlistId);
  CREATE INDEX IF NOT EXISTS idx_playlistSongs_songId ON playlistSongs(songId);
`)

export default db
