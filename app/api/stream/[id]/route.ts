import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStreamUrl } from '@/lib/ytdlp'
import { streamCache } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get song from database
    const song = db.getSongById(id)

    if (!song) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    // Check cache first
    let streamUrl = streamCache.get(song.youtubeId)
    
    if (!streamUrl) {
      console.log('[Stream] Cache miss for:', song.youtubeId)
      // Get dynamic stream URL using yt-dlp
      streamUrl = await getStreamUrl(song.youtubeId)
      // Cache the URL
      streamCache.set(song.youtubeId, streamUrl)
    } else {
      console.log('[Stream] Cache hit for:', song.youtubeId)
    }

    // Redirect to the stream URL
    return NextResponse.redirect(streamUrl)
  } catch (error) {
    console.error('Error streaming song:', error)
    return NextResponse.json(
      { error: 'Failed to get stream URL' },
      { status: 500 }
    )
  }
}
