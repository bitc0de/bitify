import { spawn } from 'child_process'
import { join } from 'path'

// Detect yt-dlp command based on environment
const getYtDlpCommand = () => {
  // In development on Windows with venv
  if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
    return join(process.cwd(), '.venv', 'Scripts', 'yt-dlp.exe')
  }
  // In production or Unix systems
  return 'yt-dlp'
}

const YT_DLP = getYtDlpCommand()

// Helper function to execute yt-dlp with arguments
async function executeYtDlp(args: string[], timeout: number = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('[yt-dlp] Executing:', YT_DLP, 'with args:', args)
    const childProcess = spawn(YT_DLP, args)
    let stdout = ''
    let stderr = ''
    let isResolved = false

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.error('[yt-dlp] Timeout reached, killing process')
        childProcess.kill()
        reject(new Error('Process timeout after ' + timeout + 'ms'))
      }
    }, timeout)

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    childProcess.on('close', (code) => {
      if (isResolved) return
      isResolved = true
      clearTimeout(timeoutId)
      
      console.log('[yt-dlp] Exit code:', code)
      if (stderr) console.log('[yt-dlp] Stderr:', stderr)
      if (code === 0) {
        console.log('[yt-dlp] Success, output length:', stdout.length)
        resolve(stdout)
      } else {
        console.error('[yt-dlp] Error:', stderr || `Process exited with code ${code}`)
        reject(new Error(stderr || `Process exited with code ${code}`))
      }
    })

    childProcess.on('error', (error) => {
      if (isResolved) return
      isResolved = true
      clearTimeout(timeoutId)
      console.error('[yt-dlp] Spawn error:', error)
      reject(error)
    })
  })
}

export interface YtDlpMetadata {
  id: string
  title: string
  channel: string
  thumbnail: string
  duration: number
}

export async function getYoutubeMetadata(url: string): Promise<YtDlpMetadata> {
  try {
    console.log('[getYoutubeMetadata] Fetching metadata for URL:', url)
    const stdout = await executeYtDlp([
      '--dump-json',
      '--no-warnings',
      '--no-playlist',  // Only extract the video, not the playlist
      '--flat-playlist',  // Don't extract playlist info
      url
    ], 60000)  // 60 second timeout
    
    const data = JSON.parse(stdout)
    console.log('[getYoutubeMetadata] Successfully parsed metadata for:', data.title)
    console.log('[getYoutubeMetadata] Available thumbnails:', data.thumbnails?.length || 0)
    
    // Get best thumbnail URL - prefer high quality thumbnails
    let thumbnail = ''
    if (data.thumbnails && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
      // Find the highest quality thumbnail
      const bestThumbnail = data.thumbnails
        .filter((t: any) => t.url)
        .sort((a: any, b: any) => {
          const widthA = a.width || 0
          const widthB = b.width || 0
          return widthB - widthA
        })[0]
      thumbnail = bestThumbnail?.url || data.thumbnails[0]?.url || ''
    }
    
    // Fallback to standard YouTube thumbnail URLs
    if (!thumbnail && data.id) {
      thumbnail = `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`
    }
    
    console.log('[getYoutubeMetadata] Selected thumbnail URL:', thumbnail)
    
    return {
      id: data.id,
      title: data.title,
      channel: data.channel || data.uploader || 'Unknown',
      thumbnail,
      duration: data.duration || 0,
    }
  } catch (error) {
    console.error('[getYoutubeMetadata] Error:', error)
    throw new Error(`Failed to get metadata: ${error}`)
  }
}

export async function getStreamUrl(youtubeId: string): Promise<string> {
  try {
    const stdout = await executeYtDlp([
      '-g',
      '-f',
      'bestaudio',
      `https://www.youtube.com/watch?v=${youtubeId}`
    ])
    
    return stdout.trim()
  } catch (error) {
    throw new Error(`Failed to get stream URL: ${error}`)
  }
}

export async function updateYtDlp(): Promise<string> {
  try {
    const stdout = await executeYtDlp(['-U'])
    return stdout.trim()
  } catch (error) {
    throw new Error(`Failed to update yt-dlp: ${error}`)
  }
}

export async function getYoutubePlaylistMetadata(url: string): Promise<Array<{
  id: string
  title: string
  channel: string
  thumbnail: string
  duration: number
}>> {
  try {
    console.log('[getYoutubePlaylistMetadata] Fetching playlist metadata for URL:', url)
    const stdout = await executeYtDlp([
      '--dump-json',
      '--no-warnings',
      '--flat-playlist',  // Extract playlist info
      url
    ], 120000)  // 2 minute timeout for playlists
    
    // Split by newlines and parse each JSON object
    const lines = stdout.trim().split('\n')
    const videos = lines.map(line => JSON.parse(line)).filter((data: any) => data && data.id)
    
    console.log('[getYoutubePlaylistMetadata] Found', videos.length, 'videos in playlist')
    
    return videos.map((data: any) => {
      console.log('[getYoutubePlaylistMetadata] Processing video:', data.title)
      
      // Get best thumbnail URL
      let thumbnail = ''
      if (data.thumbnails && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
        const bestThumbnail = data.thumbnails
          .filter((t: any) => t.url)
          .sort((a: any, b: any) => {
            const widthA = a.width || 0
            const widthB = b.width || 0
            return widthB - widthA
          })[0]
        thumbnail = bestThumbnail?.url || data.thumbnails[0]?.url || ''
      }
      
      // Fallback to standard YouTube thumbnail URLs
      if (!thumbnail && data.id) {
        thumbnail = `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`
      }
      
      return {
        id: data.id,
        title: data.title,
        channel: data.channel || data.uploader || 'Unknown',
        thumbnail,
        duration: data.duration || 0,
      }
    })
  } catch (error) {
    console.error('[getYoutubePlaylistMetadata] Error:', error)
    throw new Error(`Failed to get playlist metadata: ${error}`)
  }
}

export async function searchYoutube(query: string, maxResults: number = 10): Promise<Array<{
  id: string
  title: string
  channel: string
  thumbnail: string
  duration: number
}>> {
  try {
    console.log('[searchYoutube] Searching for:', query)
    const stdout = await executeYtDlp([
      '--dump-json',
      '--no-warnings',
      '--flat-playlist',
      '--no-playlist',
      `ytsearch${maxResults}:${query}`
    ], 60000)  // 60 second timeout
    
    // Split by newlines and parse each JSON object
    const lines = stdout.trim().split('\n').filter(line => line.trim())
    const videos = lines.map(line => {
      try {
        return JSON.parse(line)
      } catch (e) {
        return null
      }
    }).filter((data: any) => data && data.id)
    
    console.log('[searchYoutube] Found', videos.length, 'results')
    
    return videos.map((data: any) => {
      // Get best thumbnail URL
      let thumbnail = ''
      if (data.thumbnails && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
        const bestThumbnail = data.thumbnails
          .filter((t: any) => t.url)
          .sort((a: any, b: any) => {
            const widthA = a.width || 0
            const widthB = b.width || 0
            return widthB - widthA
          })[0]
        thumbnail = bestThumbnail?.url || data.thumbnails[0]?.url || ''
      }
      
      // Fallback to standard YouTube thumbnail URLs
      if (!thumbnail && data.id) {
        thumbnail = `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg`
      }
      
      return {
        id: data.id,
        title: data.title,
        channel: data.channel || data.uploader || 'Unknown',
        thumbnail,
        duration: data.duration || 0,
      }
    })
  } catch (error) {
    console.error('[searchYoutube] Error:', error)
    throw new Error(`Failed to search YouTube: ${error}`)
  }
}

