'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle } from 'lucide-react'

interface Song {
  id: string
  youtubeId: string
  title: string
  channelName: string
  thumbnail: string
  duration: number
}

interface PlayerBarProps {
  currentSong: Song | null
  onNext?: () => void
  onPrevious?: () => void
  isPlaylist?: boolean
  isShuffled?: boolean
  onToggleShuffle?: () => void
  nextSong?: Song | null
}

export default function PlayerBar({ 
  currentSong, 
  onNext, 
  onPrevious,
  isPlaylist = false,
  isShuffled = false,
  onToggleShuffle,
  nextSong
}: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audio = audioRef.current
      
      // Reset state when changing songs
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
      
      audio.src = `/api/stream/${currentSong.id}`
      audio.load() // Force reload to ensure metadata is loaded
      
      // Try to get duration after a short delay to ensure metadata is loaded
      const checkDuration = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration)
        }
      }
      
      // Check duration immediately and after load
      const loadedHandler = () => {
        checkDuration()
        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(err => console.error('Error playing:', err))
      }
      
      audio.addEventListener('loadedmetadata', loadedHandler)
      
      // Fallback if loadedmetadata doesn't fire
      const timeoutId = setTimeout(() => {
        checkDuration()
        if (audio.paused) {
          audio.play().then(() => {
            setIsPlaying(true)
          }).catch(err => console.error('Error playing:', err))
        }
      }, 100)
      
      return () => {
        audio.removeEventListener('loadedmetadata', loadedHandler)
        clearTimeout(timeoutId)
      }
    }
  }, [currentSong])

  // Pre-load next song
  useEffect(() => {
    if (nextSong) {
      // Pre-fetch the stream URL to populate cache
      fetch(`/api/stream/${nextSong.id}`, { method: 'HEAD' }).catch(() => {})
    }
  }, [nextSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => {
      setIsPlaying(false)
      if (onNext) onNext()
    }
    const handleCanPlay = () => {
      // Also update duration when audio can play
      updateDuration()
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onNext])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
    if (vol === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-center text-gray-500">
          Select a song to start playing
        </div>
      </div>
    )
  }

  return (
    <>
      <audio ref={audioRef} />
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-2 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Song Info - Always on top in mobile */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={currentSong.thumbnail}
                alt={currentSong.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">
                {currentSong.title}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {currentSong.channelName}
              </p>
            </div>
            
            {/* Volume - Desktop only, on the right */}
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <div className="w-24 relative h-5 flex items-center group">
                <div className="absolute w-full h-1 bg-gray-600 rounded-full" />
                <div 
                  className="absolute h-1 bg-white rounded-full pointer-events-none"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="absolute w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
                  style={{
                    background: 'transparent'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Controls - Centered */}
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex items-center gap-4 justify-center">
              {isPlaylist && onToggleShuffle && (
                <button
                  onClick={onToggleShuffle}
                  className={`transition-colors ${
                    isShuffled 
                      ? 'text-green-500 hover:text-green-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
                >
                  <Shuffle size={18} className="sm:w-5 sm:h-5" />
                </button>
              )}
              
              <button
                onClick={onPrevious}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={!onPrevious}
              >
                <SkipBack size={20} className="sm:w-6 sm:h-6" />
              </button>
              
              <button
                onClick={togglePlay}
                className="bg-white rounded-full p-2 sm:p-2.5 hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause size={20} fill="black" className="text-black sm:w-6 sm:h-6" />
                ) : (
                  <Play size={20} fill="black" className="text-black ml-0.5 sm:w-6 sm:h-6" />
                )}
              </button>
              
              <button
                onClick={onNext}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                disabled={!onNext}
              >
                <SkipForward size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 w-8 sm:w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative h-5 flex items-center group">
                <div className="absolute w-full h-1 bg-gray-600 rounded-full" />
                <div 
                  className="absolute h-1 bg-green-500 rounded-full pointer-events-none"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute w-full h-5 appearance-none bg-transparent cursor-pointer z-10"
                  style={{
                    background: 'transparent'
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 sm:w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
