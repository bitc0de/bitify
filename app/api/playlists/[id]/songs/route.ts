import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { songId } = await request.json()

    if (!songId) {
      return NextResponse.json(
        { error: 'songId is required' },
        { status: 400 }
      )
    }

    // Check if already in playlist
    const existing = db.prepare('SELECT * FROM playlistSongs WHERE playlistId = ? AND songId = ?').get(id, songId)

    if (existing) {
      return NextResponse.json(
        { error: 'Song already in playlist' },
        { status: 400 }
      )
    }

    // Get next position
    const maxPosition = db.prepare('SELECT MAX(position) as max FROM playlistSongs WHERE playlistId = ?').get(id) as any
    const position = (maxPosition?.max ?? -1) + 1

    const playlistSongId = randomBytes(16).toString('hex')
    db.prepare(`
      INSERT INTO playlistSongs (id, playlistId, songId, position)
      VALUES (?, ?, ?, ?)
    `).run(playlistSongId, id, songId, position)

    const playlistSong = db.prepare('SELECT * FROM playlistSongs WHERE id = ?').get(playlistSongId)

    console.log('[API] Song added to playlist:', playlistSongId)
    return NextResponse.json(playlistSong)
  } catch (error) {
    console.error('[API] Error adding song to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add song to playlist' },
      { status: 500 }
    )
  }
}
