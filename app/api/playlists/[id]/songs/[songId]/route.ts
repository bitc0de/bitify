import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    const { id, songId } = await params

    const db = getDb()
    db.prepare('DELETE FROM playlistSongs WHERE playlistId = ? AND songId = ?').run(id, songId)

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
