'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Header from '@/components/Header'
import SongCard from '@/components/SongCard'
import { useToast } from '@/components/Toast'
import { usePlayer } from '@/components/PlayerContext'

interface Song {
  id: string
  youtubeId: string
  title: string
  channelName: string
  thumbnail: string
  duration: number
}

interface Playlist {
  id: string
  name: string
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const { playSong } = usePlayer()

  // Fetch songs and playlists on mount
  useEffect(() => {
    fetchSongs()
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs')
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  const handleAddSong = async (url: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        const newSong = await response.json()
        setSongs((prev) => [newSong, ...prev])
        showToast('Song added successfully', 'success')
      } else {
        showToast('Failed to add song. Please check the URL.', 'error')
      }
    } catch (error) {
      console.error('Error adding song:', error)
      showToast('An error occurred while adding the song.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaySong = (song: Song) => {
    const index = songs.findIndex((s) => s.id === song.id)
    playSong(song, index, songs, false)
  }

  const handleDeleteSong = async (songId: string) => {
    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove song from state
        setSongs((prev) => prev.filter((s) => s.id !== songId))
        showToast('Song deleted', 'success')
      } else {
        showToast('Error deleting song', 'error')
      }
    } catch (error) {
      console.error('Error deleting song:', error)
      showToast('Error deleting song', 'error')
    }
  }

  const handleAddToPlaylist = async (songId: string, playlistId: string) => {
    try {
      const response = await fetch(`/api/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId }),
      })

      if (response.ok) {
        showToast('Song added to playlist', 'success')
      } else {
        const data = await response.json()
        showToast(data.error || 'Error adding song to playlist', 'error')
      }
    } catch (error) {
      console.error('Error adding to playlist:', error)
      showToast('Error adding song to playlist', 'error')
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <Header onAddSong={handleAddSong} isLoading={isLoading} />
      
      <main className="flex-1 overflow-y-auto pb-36 sm:pb-32 p-3 sm:p-6">
          {songs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-400 mb-2">
                  No songs yet
                </h2>
                <p className="text-gray-500">
                  Add your first song by pasting a YouTube URL
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {songs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onPlay={handlePlaySong}
                  onDelete={handleDeleteSong}
                  playlists={playlists}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          )}
        </main>
    </div>
  )
}
