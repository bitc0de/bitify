![Bitify](https://i.ibb.co/RkRRZh6D/logo.png)

Self-hosted YouTube music streaming application built with Next.js.

## Preview
#### Desktop
![Desktop](https://i.ibb.co/Y7S0bN8F/image.png)

#### Mobile
![Mobile](https://i.ibb.co/ch26fN7R/image.png)

#### Playlist
![Playlist](https://i.ibb.co/PvQmMDLx/image.png)

## Features

- Stream music from YouTube without downloading files
- Beautiful dark mode interface
- Fully responsive design (mobile & desktop)
- Full playback controls (play, pause, next, previous, shuffle)
- Volume control with visual feedback
- Progress bar with seeking and time display
- Create and manage playlists
- Global player - music continues playing across page navigation
- Toast notifications for user feedback
- Simple JSON file storage - no database setup required
- Easy Docker deployment
- **Smart search**: Search YouTube directly from the app or paste URLs

## Recent Updates

### v1.2.0 - Latest Improvements

- ✅ **YouTube search integration**: Search for songs directly in the app without needing URLs
- ✅ **Smart input detection**: Automatically detects if input is a URL or search query
- ✅ **Live search results**: Real-time search with thumbnails, duration, and channel info
- ✅ **Progress bar fix**: Fixed playbar not advancing for single songs

### v1.1.0 - Previous Updates

- ✅ **Direct song deletion**: Removed confirmation dialogs when deleting songs from home page for faster workflow
- ✅ **Bulk playlist creation**: Add entire playlists directly from YouTube playlist URLs
- ✅ **Song tags**: Display playlist tags on song cards in the home page for better organization
- ✅ **Cross-playlist song movement**: Move songs between different playlists with a single click
- ✅ **Mobile UI improvements**: Song action buttons now appear above the player bar on mobile devices
- ✅ **Bulk song selection**: Select and delete multiple songs at once from the home page for efficient management


## Prerequisites

- Node.js 20+ (for local development)
- Docker & Docker Compose (for deployment)
- Python 3 & yt-dlp (installed automatically in Docker)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create Python virtual environment:**
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment:**
   - **Linux/macOS:**
     ```bash
     source .venv/bin/activate
     ```
   - **Windows:**
     ```bash
     .venv\Scripts\activate
     ```

4. **Install yt-dlp:**
   ```bash
   pip install yt-dlp
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

The database file (`data/db.json`) will be created automatically on first run.

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

Your music library will be stored in `./data/db.json` and persists across container restarts.

### Updating to Latest Version

```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

### Complete Cleanup (removes all data)

```bash
docker-compose down -v
docker rmi ghcr.io/bitc0de/bitify:latest
rm -rf data/
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

1. **Add a song**: Search for songs by artist/title or paste a YouTube URL in the input field
2. **Search**: Type any song name or artist and select from the results dropdown
3. **Play a song**: Click the play button on any song card
4. **Control playback**: Use the player controls at the bottom of the page
5. **Create playlists**: Navigate to Playlists and create your custom collections
6. **Shuffle mode**: Toggle shuffle to randomize playback order
7. **Navigate freely**: Music continues playing as you browse different pages


## Data Storage

All data is stored in a simple JSON file at `data/db.json`:

```json
{
  "songs": [],
  "playlists": [],
  "playlistSongs": []
}
```

The file is created automatically on first run. To backup your library, simply copy the `data/` folder.

## Notes

- Audio files are **never downloaded** to the server
- Streaming URLs are dynamically generated using `yt-dlp -g -f bestaudio`
- The application requires `yt-dlp` and `ffmpeg` to be installed (included in Docker)
- All data is stored in a simple JSON file that's created automatically on first run
- Your music library persists in the `./data` folder

## License

MIT

