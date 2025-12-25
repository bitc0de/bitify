'use client'

import { useState, useEffect } from 'react'
import { Trash2, CheckSquare, Square, X } from 'lucide-react'
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
  playlists?: Playlist[]
}

interface Playlist {
  id: string
  name: string
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
  const [isDeletingSelected, setIsDeletingSelected] = useState(false)
  const { showToast } = useToast()
  const { playSong } = usePlayer()

  // Fetch songs and playlists on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchSongs(), fetchPlaylists()])
  }

  const fetchPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists')
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
        // Update songs with playlist information
        updateSongsWithPlaylists(data)
      }
    } catch (error) {
      console.error('Error fetching playlists:', error)
    }
  }

  const updateSongsWithPlaylists = (playlistData: any[]) => {
    setSongs(prevSongs => 
      prevSongs.map(song => {
        const songPlaylists = playlistData
          .filter(playlist => 
            playlist.playlistSongs?.some((ps: any) => ps.song.id === song.id)
          )
          .map(playlist => ({ id: playlist.id, name: playlist.name }))
        
        return {
          ...song,
          playlists: songPlaylists
        }
      })
    )
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

  // Selection mode functions
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    setSelectedSongs(new Set())
  }

  const toggleSongSelection = (songId: string) => {
    const newSelected = new Set(selectedSongs)
    if (newSelected.has(songId)) {
      newSelected.delete(songId)
    } else {
      newSelected.add(songId)
    }
    setSelectedSongs(newSelected)
  }

  const selectAllSongs = () => {
    if (selectedSongs.size === songs.length) {
      setSelectedSongs(new Set())
    } else {
      setSelectedSongs(new Set(songs.map(song => song.id)))
    }
  }

  const deleteSelectedSongs = async () => {
    if (selectedSongs.size === 0) return

    setIsDeletingSelected(true)
    try {
      const deletePromises = Array.from(selectedSongs).map(songId =>
        fetch(`/api/songs/${songId}`, { method: 'DELETE' })
      )

      const results = await Promise.all(deletePromises)
      const successfulDeletes = results.filter(r => r.ok).length

      if (successfulDeletes > 0) {
        setSongs(prev => prev.filter(song => !selectedSongs.has(song.id)))
        showToast(`${successfulDeletes} song${successfulDeletes !== 1 ? 's' : ''} deleted`, 'success')
      }

      if (successfulDeletes < selectedSongs.size) {
        showToast(`Failed to delete ${selectedSongs.size - successfulDeletes} song${selectedSongs.size - successfulDeletes !== 1 ? 's' : ''}`, 'error')
      }

      setSelectedSongs(new Set())
      setIsSelectionMode(false)
    } catch (error) {
      console.error('Error deleting selected songs:', error)
      showToast('Error deleting songs', 'error')
    } finally {
      setIsDeletingSelected(false)
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
        // Refresh playlists to update song-playlist relationships
        await fetchPlaylists()
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

      {/* Selection mode bar */}
      {isSelectionMode && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectionMode}
              disabled={isDeletingSelected}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
            <span className="text-white text-sm">
              {selectedSongs.size} of {songs.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllSongs}
              disabled={isDeletingSelected}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {selectedSongs.size === songs.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedSongs.size === songs.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedSongs.size > 0 && (
              <button
                onClick={deleteSelectedSongs}
                disabled={isDeletingSelected}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                {isDeletingSelected ? 'Deleting...' : `Delete (${selectedSongs.size})`}
              </button>
            )}
          </div>
        </div>
      )}

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
            <div>
              {!isSelectionMode && (
                <div className="mb-4">
                  <button
                    onClick={toggleSelectionMode}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    title="Select multiple songs"
                  >
                    <CheckSquare size={18} />
                    <span className="text-sm font-medium">Select songs</span>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {songs.map((song) => (
                <SongCard 
                  key={song.id} 
                  song={song} 
                  onPlay={handlePlaySong}
                  onDelete={handleDeleteSong}
                  playlists={playlists}
                  onAddToPlaylist={handleAddToPlaylist}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedSongs.has(song.id)}
                  onToggleSelection={toggleSongSelection}
                />
              ))}
              </div>
            </div>
          )}
        </main>
    </div>
  )
}
