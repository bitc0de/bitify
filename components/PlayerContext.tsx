'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Song {
  id: string
  youtubeId: string
  title: string
  channelName: string
  thumbnail: string
  duration: number
}

interface PlayerContextType {
  currentSong: Song | null
  currentIndex: number
  playlist: Song[]
  isPlaylist: boolean
  isShuffled: boolean
  playSong: (song: Song, index?: number, songList?: Song[], fromPlaylist?: boolean) => void
  playNext: () => void
  playPrevious: () => void
  toggleShuffle: () => void
  setPlaylist: (songs: Song[]) => void
  clearPlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [playlist, setPlaylistState] = useState<Song[]>([])
  const [isPlaylist, setIsPlaylist] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<Song[]>([])

  const playSong = (song: Song, index: number = 0, songList: Song[] = [], fromPlaylist: boolean = false) => {
    setCurrentSong(song)
    setCurrentIndex(index)
    setPlaylistState(songList)
    setIsPlaylist(fromPlaylist)
    if (fromPlaylist) {
      setOriginalOrder(songList)
    }
  }

  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentSong(playlist[nextIndex])
      setCurrentIndex(nextIndex)
    }
  }

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentSong(playlist[prevIndex])
      setCurrentIndex(prevIndex)
    }
  }

  const toggleShuffle = () => {
    if (!currentSong || !isPlaylist) return

    if (!isShuffled) {
      // Enable shuffle
      const currentSongData = playlist[currentIndex]
      const otherSongs = playlist.filter((_, i) => i !== currentIndex)
      
      // Shuffle other songs
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]]
      }
      
      const shuffledPlaylist = [currentSongData, ...otherSongs]
      setPlaylistState(shuffledPlaylist)
      setCurrentIndex(0)
      setIsShuffled(true)
    } else {
      // Disable shuffle - restore original order
      const currentSongId = currentSong.id
      const originalIndex = originalOrder.findIndex(s => s.id === currentSongId)
      setPlaylistState(originalOrder)
      setCurrentIndex(originalIndex)
      setIsShuffled(false)
    }
  }

  const setPlaylist = (songs: Song[]) => {
    setPlaylistState(songs)
  }

  const clearPlayer = () => {
    setCurrentSong(null)
    setCurrentIndex(-1)
    setPlaylistState([])
    setIsPlaylist(false)
    setIsShuffled(false)
  }

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        currentIndex,
        playlist,
        isPlaylist,
        isShuffled,
        playSong,
        playNext,
        playPrevious,
        toggleShuffle,
        setPlaylist,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
