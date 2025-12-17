import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const existingSong = await prisma.song.findUnique({
      where: { youtubeId: metadata.id },
    })

    if (existingSong) {
      console.log('[API] Song already exists:', existingSong.id)
      
      // If song was previously removed from library, restore it
      if (!existingSong.isInLibrary) {
        const updatedSong = await prisma.song.update({
          where: { id: existingSong.id },
          data: { isInLibrary: true },
        })
        console.log('[API] Song restored to library:', updatedSong.id)
        return NextResponse.json(updatedSong)
      }
      
      return NextResponse.json(existingSong)
    }

    // Create new song in database
    const song = await prisma.song.create({
      data: {
        youtubeId: metadata.id,
        title: metadata.title,
        channelName: metadata.channel,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
      },
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
    const songs = await prisma.song.findMany({
      where: { isInLibrary: true },
      orderBy: { addedAt: 'desc' },
    })

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}
