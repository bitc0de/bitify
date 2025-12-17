import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { randomBytes } from 'crypto'

export async function GET() {
  try {
    const playlists = db.prepare('SELECT * FROM playlists ORDER BY createdAt DESC').all() as any[]

    // Get songs for each playlist
    const playlistsWithSongs = playlists.map(playlist => {
      const songs = db.prepare(`
        SELECT s.* FROM songs s
        INNER JOIN playlistSongs ps ON s.id = ps.songId
        WHERE ps.playlistId = ?
        ORDER BY ps.position
      `).all(playlist.id)

      return {
        ...playlist,
        playlistSongs: songs.map((song: any) => ({ song }))
      }
    })

    return NextResponse.json(playlistsWithSongs)
  } catch (error) {
    console.error('[API] Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const playlistId = randomBytes(16).toString('hex')
    db.prepare('INSERT INTO playlists (id, name) VALUES (?, ?)').run(playlistId, name)
    
    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(playlistId)

    console.log('[API] Playlist created:', playlistId)
    return NextResponse.json(playlist)
  } catch (error) {
    console.error('[API] Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}
