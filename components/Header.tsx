'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface HeaderProps {
  onAddSong: (url: string) => void
  isLoading?: boolean
}

export default function Header({ onAddSong, isLoading }: HeaderProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAddSong(url)
      setUrl('')
    }
  }

  return (
    <header className="bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 p-3 sm:p-6 flex-shrink-0">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="w-full bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-sm sm:text-base"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim() || isLoading}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 transition-colors font-medium whitespace-nowrap text-sm sm:text-base"
          >
            {isLoading ? 'Adding...' : 'Add Song'}
          </button>
        </form>
      </div>
    </header>
  )
}
