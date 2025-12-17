import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getYoutubeMetadata } from '@/lib/ytdlp'
import { randomBytes } from 'crypto'

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
    const existingSong = db.prepare('SELECT * FROM songs WHERE youtubeId = ?').get(metadata.id) as any

    if (existingSong) {
      console.log('[API] Song already exists:', existingSong.id)
      
      // If song was previously removed from library, restore it
      if (!existingSong.isInLibrary) {
        db.prepare('UPDATE songs SET isInLibrary = 1 WHERE id = ?').run(existingSong.id)
        const updatedSong = db.prepare('SELECT * FROM songs WHERE id = ?').get(existingSong.id)
        console.log('[API] Song restored to library:', existingSong.id)
        return NextResponse.json(updatedSong)
      }
      
      return NextResponse.json(existingSong)
    }

    // Create new song in database
    const songId = randomBytes(16).toString('hex')
    db.prepare(`
      INSERT INTO songs (id, youtubeId, title, channelName, thumbnail, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(songId, metadata.id, metadata.title, metadata.channel, metadata.thumbnail, metadata.duration)

    const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(songId)

    console.log('[API] Song created successfully:', songId)
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
    const songs = db.prepare('SELECT * FROM songs WHERE isInLibrary = 1 ORDER BY createdAt DESC').all()
    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}
