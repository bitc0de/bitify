# Bitify 🎵

Self-hosted YouTube music streaming application built with Next.js.

## Preview
#### Desktop
![Desktop](https://i.ibb.co/Y7S0bN8F/image.png)

#### Mobile
![Mobile](https://i.ibb.co/ch26fN7R/image.png)

#### Playlist
![Playlist](https://i.ibb.co/PvQmMDLx/image.png)

## Features

- 🎵 Stream music from YouTube without downloading files
- 🎨 Beautiful dark mode interface
- 📱 Fully responsive design (mobile & desktop)
- 🎮 Full playback controls (play, pause, next, previous, shuffle)
- 🔊 Volume control with visual feedback
- 📊 Progress bar with seeking and time display
- 🎼 Create and manage playlists
- 🌐 Global player - music continues playing across page navigation
- 🔔 Toast notifications for user feedback
- 🗂️ SQLite database for song and playlist management
- 🐳 Easy Docker deployment

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with Prisma ORM
- **Audio Streaming**: yt-dlp
- **Icons**: Lucide React
- **Containerization**: Docker

## Prerequisites

- Node.js 20+ (for local development)
- Docker & Docker Compose (for deployment)
- Python 3 & yt-dlp (installed automatically in Docker)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Install yt-dlp:**
   ```bash
   pip install yt-dlp
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Quick Start with Docker (Recommended)

1. **Download the docker-compose.yml file:**
   ```bash
   wget https://raw.githubusercontent.com/bitc0de/bitify/main/docker-compose.yml
   ```
   Or on Windows PowerShell:
   ```powershell
   Invoke-WebRequest -Uri https://raw.githubusercontent.com/bitc0de/bitify/main/docker-compose.yml -OutFile docker-compose.yml
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

The Docker image is automatically built and published to GitHub Container Registry on each release.

## Build from Source

If you prefer to build the Docker image yourself:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bitc0de/bitify.git
   cd bitify
   ```

2. **Build and run:**
   ```bash
   docker build -t bitify .
   docker-compose up -d
   ```

## Usage

1. **Add a song**: Paste a YouTube URL in the input field and click "Add"
2. **Play a song**: Click the play button on any song card
3. **Control playback**: Use the player controls at the bottom of the page
4. **Create playlists**: Navigate to Playlists and create your custom collections
5. **Shuffle mode**: Toggle shuffle to randomize playback order
6. **Navigate freely**: Music continues playing as you browse different pages

## API Endpoints

- `POST /api/songs` - Add a new song from YouTube URL
- `GET /api/songs` - Get all songs from library
- `DELETE /api/songs` - Remove a song from library
- `GET /api/stream/[id]` - Get streaming URL for a song
- `GET /api/playlists` - Get all playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists/[id]` - Get a specific playlist with songs
- `PUT /api/playlists/[id]` - Update playlist name
- `DELETE /api/playlists/[id]` - Delete a playlist
- `POST /api/playlists/[id]/songs` - Add a song to playlist
- `DELETE /api/playlists/[id]/songs` - Remove a song from playlist
- `POST /api/admin/update` - Update yt-dlp to the latest version

## Project Structure

```
bitify/
├── app/
│   ├── api/
│   │   ├── admin/update/
│   │   ├── playlists/
│   │   │   └── [id]/
│   │   ├── songs/
│   │   └── stream/[id]/
│   ├── playlists/
│   │   ├── [id]/
│   │   └── page.tsx
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── page.tsx
│   └── slider.css
├── components/
│   ├── GlobalPlayer.tsx
│   ├── Header.tsx
│   ├── Navbar.tsx
│   ├── PlayerBar.tsx
│   ├── PlayerContext.tsx
│   ├── SongCard.tsx
│   └── Toast.tsx
├── lib/
│   ├── prisma.ts
│   └── ytdlp.ts
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
└── tsconfig.json
```

## Environment Variables

The application uses SQLite by default. The database file is stored at `prisma/dev.db`.

You can customize the database location by setting the `DATABASE_URL` environment variable:

```env
DATABASE_URL="file:./dev.db"
```

## Notes

- Audio files are **never downloaded** to the server
- Streaming URLs are dynamically generated using `yt-dlp -g -f bestaudio`
- The application requires `yt-dlp` and `ffmpeg` to be installed
- Database automatically initializes on first run

## License

MIT

## Author

Built with ❤️ using Next.js and yt-dlp
