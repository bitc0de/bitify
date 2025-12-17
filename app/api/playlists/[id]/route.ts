import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    db.deletePlaylist(id)

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

    const playlist = db.getPlaylistById(id)

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    // Get songs for this playlist
    const playlistSongs = db.getPlaylistSongs(id)
    const playlistWithSongs = {
      ...playlist,
      playlistSongs
    }

    return NextResponse.json(playlistWithSongs)
  } catch (error) {
    console.error('[API] Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}
