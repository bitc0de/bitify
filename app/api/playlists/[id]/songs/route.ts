import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const playlistSong = db.addSongToPlaylist(id, songId)

    if (!playlistSong) {
      return NextResponse.json(
        { error: 'Song already in playlist' },
        { status: 400 }
      )
    }

    console.log('[API] Song added to playlist:', playlistSong.id)
    return NextResponse.json(playlistSong)
  } catch (error) {
    console.error('[API] Error adding song to playlist:', error)
    return NextResponse.json(
      { error: 'Failed to add song to playlist' },
      { status: 500 }
    )
  }
}
