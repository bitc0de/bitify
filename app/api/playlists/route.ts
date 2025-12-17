import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        playlistSongs: {
          include: {
            song: true,
          },
        },
      },
    })

    return NextResponse.json(playlists)
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

    const playlist = await prisma.playlist.create({
      data: { name },
    })

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
