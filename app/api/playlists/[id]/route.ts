import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    db.prepare('DELETE FROM playlists WHERE id = ?').run(id)

    console.log('[API] Playlist deleted:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id) as any

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    // Get songs for this playlist
    const songs = db.prepare(`
      SELECT s.*, ps.addedAt FROM songs s
      INNER JOIN playlistSongs ps ON s.id = ps.songId
      WHERE ps.playlistId = ?
      ORDER BY ps.addedAt ASC
    `).all(id)

    playlist.playlistSongs = songs.map((song: any) => ({ song }))

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('[API] Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}
