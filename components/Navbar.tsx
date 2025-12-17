'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, ListMusic, Github, Star } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [stars, setStars] = useState<number | null>(null)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    const fetchStars = () => {
      fetch('https://api.github.com/repos/bitc0de/bitify')
        .then(res => res.json())
        .then(data => {
          if (data.stargazers_count !== undefined) {
            setStars(data.stargazers_count)
          }
        })
        .catch((err) => {
          console.error('Error fetching stars:', err)
          setStars(null)
        })
    }

    fetchStars()

    // Refresh when user comes back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStars()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 flex-shrink-0">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2">
    
                <svg className="w-auto h-8" viewBox="0 0 422 189" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <g id="#00c940ff">
                    <path fill="#00c940" opacity="1.00" d=" M 0.00 0.00 L 46.72 0.00 C 46.75 39.02 46.74 78.03 46.72 117.05 C 46.99 128.33 55.58 138.66 66.59 141.08 C 76.60 143.52 87.86 139.21 93.57 130.61 C 99.13 122.70 99.58 111.60 94.71 103.26 C 90.12 94.93 80.52 89.75 71.05 90.35 C 63.71 90.64 56.84 94.45 52.17 100.03 C 52.12 82.24 52.24 64.44 52.11 46.65 C 68.19 41.69 85.99 42.83 101.43 49.46 C 118.40 56.65 132.38 70.59 139.64 87.53 C 145.34 101.19 147.90 116.65 144.09 131.17 C 140.50 149.07 129.77 165.35 114.85 175.85 C 104.18 183.40 91.46 188.03 78.42 189.00 L 68.38 189.00 C 50.50 188.17 33.20 180.08 20.74 167.29 C 8.23 154.64 0.86 137.27 0.00 119.54 L 0.00 0.00 Z" />
                    </g>
                    <g id="#ffffffff">
                    <path fill="#ffffff" opacity="1.00" d=" M 156.14 77.98 C 156.93 77.25 157.66 76.11 158.93 76.38 C 163.19 76.33 167.45 76.40 171.71 76.37 C 172.11 76.77 172.91 77.57 173.31 77.97 C 173.32 104.99 173.31 132.01 173.31 159.03 C 172.91 159.43 172.10 160.23 171.69 160.63 C 167.43 160.60 163.16 160.67 158.89 160.62 C 157.62 160.90 156.91 159.70 156.13 158.97 C 156.28 139.77 156.10 120.58 156.22 101.38 C 159.90 98.52 163.49 95.55 167.11 92.63 C 163.59 91.90 158.71 94.27 156.14 90.99 C 156.21 86.66 156.21 82.32 156.14 77.98 Z" />
                    <path fill="#ffffff" opacity="1.00" d=" M 183.29 76.34 C 205.47 76.39 227.65 76.40 249.82 76.33 C 250.41 76.89 251.00 77.44 251.59 78.00 C 251.55 82.34 251.55 86.67 251.59 91.00 C 251.00 91.56 250.41 92.11 249.82 92.67 C 241.55 92.58 233.27 92.65 225.00 92.63 C 225.02 114.75 224.95 136.88 225.04 159.01 C 224.67 159.37 223.94 160.09 223.58 160.45 C 218.87 160.87 214.11 160.52 209.38 160.60 C 209.00 160.20 208.25 159.39 207.87 158.98 C 207.87 140.29 207.88 121.60 207.87 102.90 C 207.41 101.35 208.92 100.63 209.85 99.79 C 212.84 97.43 215.80 95.02 218.76 92.63 C 206.93 92.64 195.09 92.60 183.26 92.65 C 182.83 92.25 181.98 91.45 181.56 91.05 C 181.56 86.68 181.56 82.31 181.55 77.94 C 181.99 77.54 182.86 76.74 183.29 76.34 Z" />
                    <path fill="#ffffff" opacity="1.00" d=" M 260.14 77.96 C 260.94 77.30 261.63 76.11 262.87 76.38 C 267.14 76.33 271.41 76.40 275.68 76.36 C 276.09 76.76 276.91 77.56 277.31 77.96 C 277.31 104.99 277.31 132.01 277.31 159.04 C 276.90 159.44 276.08 160.24 275.67 160.64 C 271.41 160.59 267.15 160.67 262.89 160.62 C 261.62 160.87 260.90 159.72 260.13 158.98 C 260.27 139.78 260.10 120.58 260.22 101.39 C 263.89 98.52 267.49 95.56 271.11 92.63 C 267.58 91.89 262.70 94.29 260.13 90.98 C 260.22 86.64 260.20 82.30 260.14 77.96 Z" />
                    <path fill="#ffffff" opacity="1.00" d=" M 290.15 77.98 C 290.96 77.12 291.79 76.11 293.13 76.37 C 310.24 76.39 327.35 76.32 344.46 76.41 C 344.83 76.81 345.57 77.60 345.94 78.00 C 345.94 82.33 345.94 86.66 345.94 90.99 C 345.57 91.39 344.83 92.19 344.46 92.59 C 332.08 92.67 319.70 92.61 307.33 92.62 C 307.31 99.87 307.31 107.13 307.33 114.38 C 316.53 114.37 325.73 114.37 334.93 114.37 C 336.14 114.13 336.85 115.30 337.67 115.95 C 337.60 120.32 337.60 124.68 337.67 129.04 C 336.85 129.67 336.17 130.85 334.98 130.63 C 325.76 130.63 316.54 130.63 307.32 130.62 C 307.30 140.09 307.32 149.56 307.31 159.04 C 306.91 159.44 306.10 160.24 305.69 160.64 C 301.42 160.59 297.15 160.67 292.89 160.62 C 291.44 160.85 290.02 159.40 290.19 157.98 C 290.20 139.12 290.16 120.26 290.21 101.40 C 293.86 98.50 297.49 95.57 301.11 92.63 C 297.57 91.93 292.85 94.19 290.16 91.09 C 290.20 86.72 290.21 82.35 290.15 77.98 Z" />
                    <path fill="#ffffff" opacity="1.00" d=" M 352.18 76.36 C 357.51 76.42 362.85 76.28 368.18 76.45 C 374.01 87.23 380.01 97.91 385.92 108.66 C 391.86 97.92 397.84 87.21 403.70 76.43 C 409.03 76.30 414.35 76.41 419.67 76.36 C 420.14 77.18 420.61 78.01 421.08 78.83 C 412.23 94.94 403.32 111.01 394.61 127.18 C 394.34 137.43 394.59 147.70 394.50 157.95 C 394.72 159.20 393.57 159.87 392.87 160.67 C 388.23 160.60 383.59 160.60 378.95 160.67 C 378.26 159.86 377.14 159.12 377.37 157.88 C 377.41 147.02 377.30 136.15 377.43 125.30 C 378.52 121.80 380.84 118.81 382.44 115.51 C 378.51 115.37 374.60 115.22 370.68 115.11 C 364.02 103.00 357.40 90.86 350.74 78.75 C 351.22 77.95 351.70 77.16 352.18 76.36 Z" />
                    </g>
                </svg>

                        
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Home size={20} />
                <span className="font-medium">Home</span>
              </Link>

              <Link
                href="/playlists"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/playlists')
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <ListMusic size={20} />
                <span className="font-medium">Playlists</span>
              </Link>
            </div>
          </div>

          {/* GitHub Stars Badge */}
          <a
            href="https://github.com/bitc0de/bitify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
          >
            <Github size={16} className="sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Star</span>
            <Star size={12} className="fill-yellow-400 text-yellow-400 sm:w-4 sm:h-4" />
            {stars !== null && (
              <span className="text-xs sm:text-sm font-semibold">{formatStars(stars)}</span>
            )}
          </a>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden flex gap-2 pb-2">
          <Link
            href="/"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Home size={16} />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            href="/playlists"
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/playlists')
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ListMusic size={16} />
            <span className="text-xs font-medium">Playlists</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
