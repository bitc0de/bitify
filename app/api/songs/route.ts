import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getYoutubeMetadata } from '@/lib/ytdlp'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    console.log('[API] Adding song from URL:', url)

    // Get metadata from YouTube using yt-dlp
    const metadata = await getYoutubeMetadata(url)
    console.log('[API] Got metadata:', metadata)

    // Check if song already exists
    const existingSong = db.getSongByYoutubeId(metadata.id)

    if (existingSong) {
      console.log('[API] Song already exists:', existingSong.id)
      
      // If song was previously removed from library, restore it
      if (!existingSong.isInLibrary) {
        const updatedSong = db.updateSong(existingSong.id, { isInLibrary: true })
        console.log('[API] Song restored to library:', existingSong.id)
        return NextResponse.json(updatedSong)
      }
      
      return NextResponse.json(existingSong)
    }

    // Create new song in database
    const song = db.createSong({
      youtubeId: metadata.id,
      title: metadata.title,
      channelName: metadata.channel,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
    })

    console.log('[API] Song created successfully:', song.id)
    return NextResponse.json(song)
  } catch (error) {
    console.error('[API] Error adding song:', error)
    return NextResponse.json(
      { error: 'Failed to add song' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const songs = db.getSongs()
    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}
