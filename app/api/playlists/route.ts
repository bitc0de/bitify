import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const playlists = db.getPlaylists()

    // Get songs for each playlist
    const playlistsWithSongs = playlists.map(playlist => {
      const playlistSongs = db.getPlaylistSongs(playlist.id)
      return {
        ...playlist,
        playlistSongs
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

    const playlist = db.createPlaylist(name)

    console.log('[API] Playlist created:', playlist.id)
    return NextResponse.json(playlist)
  } catch (error) {
    console.error('[API] Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}
