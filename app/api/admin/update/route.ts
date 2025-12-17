import { NextRequest, NextResponse } from 'next/server'
import { updateYtDlp } from '@/lib/ytdlp'

export async function POST(request: NextRequest) {
  try {
    const result = await updateYtDlp()

    return NextResponse.json({ 
      success: true, 
      message: result 
    })
  } catch (error) {
    console.error('Error updating yt-dlp:', error)
    return NextResponse.json(
      { error: 'Failed to update yt-dlp' },
      { status: 500 }
    )
  }
}
