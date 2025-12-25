'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Trash2, ListPlus, ArrowRight, CheckSquare } from 'lucide-react'

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

interface SongCardProps {
  song: Song
  onPlay: (song: Song) => void
  onDelete: (songId: string) => void
  playlists?: Playlist[]
  onAddToPlaylist?: (songId: string, playlistId: string) => void
  currentPlaylistId?: string
  onMoveToPlaylist?: (songId: string, fromPlaylistId: string, toPlaylistId: string) => void
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (songId: string) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SongCard({ 
  song, 
  onPlay, 
  onDelete, 
  playlists, 
  onAddToPlaylist, 
  currentPlaylistId, 
  onMoveToPlaylist,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection
}: SongCardProps) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false)
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(song.id)
  }

  const handleAddToPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation()
    if (onAddToPlaylist) {
      onAddToPlaylist(song.id, playlistId)
    }
    setShowPlaylistMenu(false)
  }

  const handleMoveToPlaylist = (e: React.MouseEvent, toPlaylistId: string) => {
    e.stopPropagation()
    if (onMoveToPlaylist && currentPlaylistId) {
      onMoveToPlaylist(song.id, currentPlaylistId, toPlaylistId)
    }
    setShowMoveMenu(false)
  }

  const toggleMoveMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMoveMenu(!showMoveMenu)
  }

  const togglePlaylistMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPlaylistMenu(!showPlaylistMenu)
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 transition-colors group relative ${
      isSelectionMode 
        ? 'cursor-default hover:bg-gray-750' 
        : 'cursor-pointer hover:bg-gray-700'
    } ${isSelected ? 'ring-2 ring-blue-500 bg-gray-750' : ''}`}
    onClick={isSelectionMode ? () => onToggleSelection?.(song.id) : () => onPlay(song)}>
      
      {/* Selection checkbox */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection?.(song.id)
            }}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-400 hover:border-gray-300'
            }`}
          >
            {isSelected && <CheckSquare size={14} fill="currentColor" />}
          </button>
        </div>
      )}

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {!isSelectionMode && playlists && playlists.length > 0 && onAddToPlaylist && (
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
        
        {!isSelectionMode && currentPlaylistId && playlists && playlists.length > 1 && onMoveToPlaylist && (
          <div className="relative">
            <button
              onClick={toggleMoveMenu}
              className="bg-green-500 cursor-pointer rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-green-600"
              title="Move to another playlist"
            >
              <ArrowRight size={16} className="text-white" />
            </button>
            
            {showMoveMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto z-20">
                {playlists
                  .filter(playlist => playlist.id !== currentPlaylistId)
                  .map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={(e) => handleMoveToPlaylist(e, playlist.id)}
                      className="w-full cursor-pointer text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                    >
                      {playlist.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
        
        {!isSelectionMode && (
        <button
          onClick={handleDelete}
          className="bg-red-500 cursor-pointer rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Delete song"
        >
          <Trash2 size={16} className="text-white" />
        </button>
        )}
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
      
      {song.playlists && song.playlists.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {song.playlists.slice(0, 2).map((playlist) => (
            <span
              key={playlist.id}
              className="inline-block bg-green-600 text-white text-xs px-2 py-0.5 rounded-full truncate max-w-20"
              title={playlist.name}
            >
              {playlist.name}
            </span>
          ))}
          {song.playlists.length > 2 && (
            <span className="inline-block bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full">
              +{song.playlists.length - 2}
            </span>
          )}
        </div>
      )}
      
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
