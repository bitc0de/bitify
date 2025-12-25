import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getYoutubePlaylistMetadata } from '@/lib/ytdlp'

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
    const { name, youtubeUrl } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const playlist = db.createPlaylist(name)
    let addedSongs = 0

    // If YouTube URL is provided, fetch and add songs from the playlist
    if (youtubeUrl) {
      try {
        console.log('[API] Fetching YouTube playlist:', youtubeUrl)
        const playlistSongs = await getYoutubePlaylistMetadata(youtubeUrl)
        
        for (const songData of playlistSongs) {
          try {
            // Check if song already exists
            let song = db.getSongByYoutubeId(songData.id)
            
            if (!song) {
              // Create new song
              song = db.createSong({
                youtubeId: songData.id,
                title: songData.title,
                channelName: songData.channel,
                thumbnail: songData.thumbnail,
                duration: songData.duration,
              })
              console.log('[API] Created song:', song.id)
            }
            
            // Add song to playlist
            const playlistSong = db.addSongToPlaylist(playlist.id, song.id)
            if (playlistSong) {
              addedSongs++
              console.log('[API] Added song to playlist:', playlistSong.id)
            }
          } catch (songError) {
            console.error('[API] Error adding song to playlist:', songError)
            // Continue with other songs
          }
        }
        
        console.log(`[API] Added ${addedSongs} songs to playlist`)
      } catch (playlistError) {
        console.error('[API] Error fetching YouTube playlist:', playlistError)
        // Don't fail the entire request, just log the error
      }
    }

    console.log('[API] Playlist created:', playlist.id)
    return NextResponse.json({
      playlist: {
        ...playlist,
        playlistSongs: addedSongs > 0 ? db.getPlaylistSongs(playlist.id) : []
      },
      addedSongs
    })
  } catch (error) {
    console.error('[API] Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    )
  }
}
