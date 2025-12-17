import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomBytes } from 'crypto'

interface Song {
  id: string
  youtubeId: string
  title: string
  channelName: string
  thumbnail: string
  duration: number
  isInLibrary: boolean
  createdAt: number
}

interface Playlist {
  id: string
  name: string
  createdAt: number
}

interface PlaylistSong {
  id: string
  playlistId: string
  songId: string
  position: number
  addedAt: number
}

interface Database {
  songs: Song[]
  playlists: Playlist[]
  playlistSongs: PlaylistSong[]
}

const dataDir = join(process.cwd(), 'data')
const dbPath = join(dataDir, 'db.json')

function ensureDataDir() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

function readDb(): Database {
  ensureDataDir()
  
  if (!existsSync(dbPath)) {
    const initialDb: Database = {
      songs: [],
      playlists: [],
      playlistSongs: []
    }
    writeFileSync(dbPath, JSON.stringify(initialDb, null, 2))
    return initialDb
  }
  
  return JSON.parse(readFileSync(dbPath, 'utf-8'))
}

function writeDb(db: Database) {
  ensureDataDir()
  writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export const db = {
  // Songs
  getSongs: () => {
    const data = readDb()
    return data.songs.filter(s => s.isInLibrary).sort((a, b) => b.createdAt - a.createdAt)
  },
  
  getSongById: (id: string) => {
    const data = readDb()
    return data.songs.find(s => s.id === id)
  },
  
  getSongByYoutubeId: (youtubeId: string) => {
    const data = readDb()
    return data.songs.find(s => s.youtubeId === youtubeId)
  },
  
  createSong: (song: Omit<Song, 'id' | 'createdAt' | 'isInLibrary'>) => {
    const data = readDb()
    const newSong: Song = {
      ...song,
      id: randomBytes(16).toString('hex'),
      isInLibrary: true,
      createdAt: Date.now()
    }
    data.songs.push(newSong)
    writeDb(data)
    return newSong
  },
  
  updateSong: (id: string, updates: Partial<Song>) => {
    const data = readDb()
    const index = data.songs.findIndex(s => s.id === id)
    if (index !== -1) {
      data.songs[index] = { ...data.songs[index], ...updates }
      writeDb(data)
      return data.songs[index]
    }
    return null
  },
  
  // Playlists
  getPlaylists: () => {
    const data = readDb()
    return data.playlists.sort((a, b) => b.createdAt - a.createdAt)
  },
  
  getPlaylistById: (id: string) => {
    const data = readDb()
    return data.playlists.find(p => p.id === id)
  },
  
  createPlaylist: (name: string) => {
    const data = readDb()
    const newPlaylist: Playlist = {
      id: randomBytes(16).toString('hex'),
      name,
      createdAt: Date.now()
    }
    data.playlists.push(newPlaylist)
    writeDb(data)
    return newPlaylist
  },
  
  deletePlaylist: (id: string) => {
    const data = readDb()
    data.playlists = data.playlists.filter(p => p.id !== id)
    data.playlistSongs = data.playlistSongs.filter(ps => ps.playlistId !== id)
    writeDb(data)
  },
  
  // Playlist Songs
  getPlaylistSongs: (playlistId: string) => {
    const data = readDb()
    const playlistSongs = data.playlistSongs
      .filter(ps => ps.playlistId === playlistId)
      .sort((a, b) => a.position - b.position)
    
    return playlistSongs.map(ps => {
      const song = data.songs.find(s => s.id === ps.songId)
      return { ...ps, song }
    }).filter(ps => ps.song)
  },
  
  addSongToPlaylist: (playlistId: string, songId: string) => {
    const data = readDb()
    
    // Check if already exists
    if (data.playlistSongs.find(ps => ps.playlistId === playlistId && ps.songId === songId)) {
      return null
    }
    
    // Get next position
    const playlistSongs = data.playlistSongs.filter(ps => ps.playlistId === playlistId)
    const maxPosition = playlistSongs.length > 0 ? Math.max(...playlistSongs.map(ps => ps.position)) : -1
    
    const newPlaylistSong: PlaylistSong = {
      id: randomBytes(16).toString('hex'),
      playlistId,
      songId,
      position: maxPosition + 1,
      addedAt: Date.now()
    }
    
    data.playlistSongs.push(newPlaylistSong)
    writeDb(data)
    return newPlaylistSong
  },
  
  removeSongFromPlaylist: (playlistId: string, songId: string) => {
    const data = readDb()
    data.playlistSongs = data.playlistSongs.filter(
      ps => !(ps.playlistId === playlistId && ps.songId === songId)
    )
    writeDb(data)
  }
}
