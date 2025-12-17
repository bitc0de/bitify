import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const existing = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId: songId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Song already in playlist' },
        { status: 400 }
      )
    }

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId: id,
        songId: songId,
      },
    })

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
