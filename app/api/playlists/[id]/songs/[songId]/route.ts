import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    const { id, songId } = await params

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId: id,
          songId: songId,
        },
      },
    })

    console.log('[API] Song removed from playlist')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error removing song from playlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove song from playlist' },
      { status: 500 }
    )
  }
}
