import { NextRequest, NextResponse } from 'next/server'
import { searchYoutube } from '@/lib/ytdlp'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const results = await searchYoutube(query, 10)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 })
  }
}
