'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Trash2, ListPlus } from 'lucide-react'

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

interface SongCardProps {
  song: Song
  onPlay: (song: Song) => void
  onDelete: (songId: string) => void
  playlists?: Playlist[]
  onAddToPlaylist?: (songId: string, playlistId: string) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SongCard({ song, onPlay, onDelete, playlists, onAddToPlaylist }: SongCardProps) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(song.id)
    setShowDeleteConfirm(false)
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(false)
  }

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation()
    if (onAddToPlaylist) {
      onAddToPlaylist(song.id, playlistId)
    }
    setShowPlaylistMenu(false)
  }

  const togglePlaylistMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPlaylistMenu(!showPlaylistMenu)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer group relative">
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelDelete}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white text-lg font-semibold mb-2">Delete song?</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete "{song.title}"?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 cursor-pointer bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 cursor-pointer bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {playlists && playlists.length > 0 && onAddToPlaylist && (
          <div className="relative">
            <button
              onClick={togglePlaylistMenu}
              className="bg-green-500 cursor-pointer rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-green-600"
              title="Add to playlist"
            >
              <ListPlus size={16} className="text-white" />
            </button>
            
            {showPlaylistMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto z-20">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={(e) => handleAddToPlaylist(e, playlist.id)}
                    className="w-full cursor-pointer text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                  >
                    {playlist.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={handleDelete}
          className="bg-red-500 cursor-pointer rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Delete song"
        >
          <Trash2 size={16} className="text-white" />
        </button>
      </div>
      
      <div className="relative mb-4 w-full aspect-video rounded-md overflow-hidden bg-gray-900">
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-transparent bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <button
            onClick={() => onPlay(song)}
            className="opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity bg-green-500 rounded-full p-3 hover:bg-green-600 hover:scale-110 transform"
          >
            <Play size={24} fill="white" className="text-white ml-0.5" />
          </button>
        </div>
      </div>
      
      <h3 className="text-white font-semibold mb-1 truncate" title={song.title}>
        {song.title}
      </h3>
      
      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-sm truncate flex-1" title={song.channelName}>
          {song.channelName}
        </p>
        <span className="text-gray-500 text-xs ml-2">
          {formatDuration(song.duration)}
        </span>
      </div>
    </div>
  )
}
