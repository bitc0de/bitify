import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Instead of deleting, mark as not in library
    // This keeps the song in playlists but removes it from main library
    db.updateSong(id, { isInLibrary: false })

    console.log('[API] Song removed from library:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error removing song from library:', error)
    return NextResponse.json(
      { error: 'Failed to remove song from library' },
      { status: 500 }
    )
  }
}
