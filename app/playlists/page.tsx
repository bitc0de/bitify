'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Music, Play } from 'lucide-react'
import Navbar from '@/components/Navbar'
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

interface PlaylistSong {
  id: string
  song: Song
}

interface Playlist {
  id: string
  name: string
  playlistSongs: PlaylistSong[]
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([])
  const { showToast } = useToast()
  const { playSong, isPlaylist, isShuffled, toggleShuffle } = usePlayer()

  useEffect(() => {
    fetchPlaylists()
  }, [])

  useEffect(() => {
    if (selectedPlaylist) {
      const songs = selectedPlaylist.playlistSongs.map((ps) => ps.song)
      setPlaylistSongs(songs)
    }
  }, [selectedPlaylist])

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

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newPlaylistName }),
      })

      if (response.ok) {
        const playlist = await response.json()
        setPlaylists((prev) => [{ ...playlist, playlistSongs: [] }, ...prev])
        setNewPlaylistName('')
        setShowCreateForm(false)
        showToast('Playlist created', 'success')
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
      showToast('Error creating playlist', 'error')
    }
  }

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('¿Eliminar esta playlist?')) return

    try {
      const response = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
        if (selectedPlaylist?.id === playlistId) {
          setSelectedPlaylist(null)
        }
        showToast('Playlist deleted', 'success')
      }
    } catch (error) {
      console.error('Error deleting playlist:', error)
      showToast('Error deleting playlist', 'error')
    }
  }

  const handleRemoveSongFromPlaylist = async (songId: string) => {
    if (!selectedPlaylist) return

    try {
      const response = await fetch(
        `/api/playlists/${selectedPlaylist.id}/songs/${songId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        // Update selected playlist
        const updatedPlaylistSongs = selectedPlaylist.playlistSongs.filter(
          (ps) => ps.song.id !== songId
        )
        const updatedPlaylist = {
          ...selectedPlaylist,
          playlistSongs: updatedPlaylistSongs,
        }
        setSelectedPlaylist(updatedPlaylist)

        // Update playlists list
        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === selectedPlaylist.id ? updatedPlaylist : p
          )
        )
        showToast('Song removed from playlist', 'success')
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error)
      showToast('Error removing song from playlist', 'error')
    }
  }

  const handlePlaySong = (song: Song) => {
    const index = playlistSongs.findIndex((s) => s.id === song.id)
    playSong(song, index, playlistSongs, true)
  }

  const handlePlayPlaylist = (playlist: Playlist) => {
    const songs = playlist.playlistSongs.map((ps) => ps.song)
    if (songs.length > 0) {
      setPlaylistSongs(songs)
      playSong(songs[0], 0, songs, true)
      setSelectedPlaylist(playlist)
    }
  }



  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Playlists sidebar */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-800 overflow-y-auto p-3 sm:p-6">
            <div className="mb-4">
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} />
                  New Playlist
                </button>
              ) : (
                <form onSubmit={handleCreatePlaylist} className="space-y-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name..."
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 cursor-pointer px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewPlaylistName('')
                      }}
                      className="flex-1 cursor-pointer px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="space-y-2">
              {playlists.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No playlists
                </p>
              ) : (
                playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors group ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-gray-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedPlaylist(playlist)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h3 className="text-white font-semibold truncate">
                        {playlist.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {playlist.playlistSongs.length} song
                        {playlist.playlistSongs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {playlist.playlistSongs.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayPlaylist(playlist)
                          }}
                          className="p-2 cursor-pointer bg-green-500 rounded-full hover:bg-green-600 transition-colors opacity-100"
                          title="Play playlist"
                        >
                          <Play size={18} fill="white" className="text-white ml-0.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePlaylist(playlist.id)
                        }}
                        className="p-2 cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete playlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Playlist content */}
          <main className="flex-1 overflow-y-auto pb-36 sm:pb-32 p-3 sm:p-6">
            {!selectedPlaylist ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Music size={64} className="mx-auto text-gray-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">
                    Select a playlist
                  </h2>
                  <p className="text-gray-500">
                    Or create a new one to start
                  </p>
                </div>
              </div>
            ) : selectedPlaylist.playlistSongs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Music size={64} className="mx-auto text-gray-600 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-400 mb-2">
                    Empty playlist
                  </h2>
                  <p className="text-gray-500">
                    Add songs from the home page
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  {selectedPlaylist.name}
                </h2>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {selectedPlaylist.playlistSongs.map((ps) => (
                    <SongCard
                      key={ps.id}
                      song={ps.song}
                      onPlay={handlePlaySong}
                      onDelete={handleRemoveSongFromPlaylist}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
    </div>
  )
}
