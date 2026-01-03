'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  onAddSong: (url: string) => void
  isLoading?: boolean
}

interface SearchResult {
  id: string
  title: string
  channel: string
  thumbnail: string
  duration: number
}

export default function Header({ onAddSong, isLoading }: HeaderProps) {
  const [input, setInput] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const resultsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isYoutubeUrl = (str: string) => {
    return str.includes('youtube.com/') || str.includes('youtu.be/')
  }

  const handleSearch = async (query: string) => {
    if (!query.trim() || isYoutubeUrl(query)) {
      setShowResults(false)
      return
    }

    setIsSearching(true)
    setSearchError('')

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results)
        setShowResults(true)
      } else {
        setSearchError('Search failed')
        setShowResults(false)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Search error')
      setShowResults(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)

    // Auto-search if not a URL
    if (value.trim() && !isYoutubeUrl(value)) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        handleSearch(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setShowResults(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      if (isYoutubeUrl(input)) {
        onAddSong(input)
        setInput('')
        setShowResults(false)
      } else {
        handleSearch(input)
      }
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${result.id}`
    onAddSong(youtubeUrl)
    setInput('')
    setShowResults(false)
    setSearchResults([])
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <header className="bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 p-3 sm:p-6 flex-shrink-0">
      <div className="max-w-7xl mx-auto relative">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Search for songs or paste YouTube URL..."
              className="w-full bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-sm sm:text-base pr-10"
              disabled={isLoading}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-gray-400" size={20} />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 transition-colors font-medium whitespace-nowrap text-sm sm:text-base flex items-center gap-2 justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Adding...</span>
              </>
            ) : isYoutubeUrl(input) ? (
              <>
                <Plus size={18} />
                <span>Add Song</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-h-96 overflow-y-auto z-50"
          >
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectResult(result)}
                className="w-full p-3 hover:bg-gray-700 transition-colors flex items-center gap-3 text-left border-b border-gray-700 last:border-b-0"
              >
                <div className="relative w-20 h-14 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={result.thumbnail}
                    alt={result.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {result.title}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {result.channel}
                  </p>
                </div>
                <div className="text-gray-400 text-xs flex-shrink-0">
                  {formatDuration(result.duration)}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !isSearching && (
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 p-4 z-50"
          >
            <p className="text-gray-400 text-center">No results found</p>
          </div>
        )}

        {searchError && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-red-900/20 border border-red-800 rounded-lg p-3 z-50">
            <p className="text-red-400 text-sm">{searchError}</p>
          </div>
        )}
      </div>
    </header>
  )
}
