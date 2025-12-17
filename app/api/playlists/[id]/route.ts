import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.playlist.delete({
      where: { id },
    })

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

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        playlistSongs: {
          include: {
            song: true,
          },
          orderBy: {
            addedAt: 'asc',
          },
        },
      },
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('[API] Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    )
  }
}
