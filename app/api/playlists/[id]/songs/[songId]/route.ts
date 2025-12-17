import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    const { id, songId } = await params

    db.removeSongFromPlaylist(id, songId)

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
