'use client'

import { Home, ListMusic } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-black border-r border-gray-800 p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bitify</h1>
      </div>
      
      <nav className="flex flex-col gap-4">
        <Link 
          href="/" 
          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
        >
          <Home size={24} />
          <span>Home</span>
        </Link>
        
        <Link 
          href="/playlists" 
          className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
        >
          <ListMusic size={24} />
          <span>Playlists</span>
        </Link>
      </nav>
    </aside>
  )
}
