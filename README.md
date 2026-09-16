# 🎵 Dhun — Modern Desktop-Grade Music & Podcast Streaming Web App

<div align="center">

![Dhun Music](https://img.shields.io/badge/Dhun-Music%20Player-10b981?style=for-the-badge&logo=spotify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A high-fidelity, desktop-class web music streaming platform crafted with Spotify aesthetics, multi-source playlist migration, dedicated podcasts with variable speed playback, synchronized lyrics, and global keyboard speed-dial controls.**

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Keyboard Shortcuts](#-keyboard-shortcuts) • [API Reference](#-api-reference)

</div>

---

## ✨ Key Features

### 🎧 1. Spotify-Accurate Desktop Experience
- **Dynamic Ambient Glow**: Mood-adaptive top banner gradient (`#551214` to `#121212`) reflecting dayparts and listening activity.
- **Top Quick Picks Grid**: Instant 2-row quick access cards with hover-reveal Spotify green play buttons (`#1ed760`).
- **Dynamic Daypart Mixes**: Time-sensitive greeting (`Soundtrack your Monday afternoon`) with Spotify **`daylist`** sunburst styling and colorful Artist Radio cards.
- **Featured Charts**: Top Songs Global, Top Songs India, Top 50 Daily charts with high-contrast gradient cards.
- **Popular Albums, Singles & Artists**: Dedicated hubs for albums (`/album/[id]`) and artists (`/artist/[id]`) with one-click full playback.

### 📋 2. Comprehensive Playlist Management & Importer/Exporter
- **Pixel-Matched Playlist Studio (`/playlist/[id]`)**:
  - Full-size editable artwork banner with legal disclaimer and metadata.
  - Dedicated **"Let's find something for your playlist"** live search box with inline instant `Add` buttons.
- **Multi-Source Importer**:
  - **YouTube / YouTube Music**: Convert any public playlist link (`music.youtube.com/playlist?list=...`) into a Dhun playlist.
  - **Spotify & Apple Music**: Paste raw tracklists or `Track - Artist` text to batch-match and import songs.
  - **CSV / Text File Import**: Import plain text song lists with instant live track count previews.
- **Lossless Exporter**:
  - Export to **Spotify/Apple Music migration CSV** format (compatible with Soundiiz and TuneMyMusic).
  - Full **JSON backup** export and shareable permalinks.

### 🎙️ 3. Dedicated Podcasts Hub (`/podcasts`)
- Featured Shows (*The Ranveer Show*, *Huberman Lab*, *Lex Fridman*, *Figuring Out*, *Finshots Daily*).
- Category filtering (*Tech & AI*, *Health & Science*, *Self Growth*, *Business*).
- **Variable Playback Speed Controller**: Seamless real-time speed cycling (**`1x` $\rightarrow$ `1.25x` $\rightarrow$ `1.5x` $\rightarrow$ `2x`**) in the persistent bottom player.

### ⚡ 4. Global Speed Dial (Slots 1–9)
- Pin your top 9 favorite tracks to numeric slots `1` through `9`.
- Trigger instant playback from **any page** simply by pressing keys `1` to `9` on your physical keyboard.

### 🎤 5. Synchronized Lyrics
- Automatically fetches and displays real-time auto-scrolling synced LRC lyrics centered to current playback position.
- Plain text lyrics fallback with one-click full-screen lyrics view.

### 🔐 6. Resilient Full-Stack Authentication
- **Multi-Tier Persistence**: Works with Prisma/PostgreSQL or automatically falls back to local persistent storage (`server/data/users.json`), guaranteeing zero 500 errors.
- **JWT Authentication**: Signed JSON Web Tokens with `bcryptjs` password hashing.
- **In-App `AuthModal`**: Sign in or sign up from anywhere without interrupting active music playback.
- **⚡ 1-Click Instant Demo Login**: Onboard and test all library features with a single tap.

### ⌨️ 7. Desktop Keyboard Navigation
- **Space**: Instant Play / Pause toggle anywhere across the app.
- **Arrow Right / Left**: Seek forward / backward by 5 seconds.
- **Arrow Up / Down**: Fine-tune volume up / down by 5%.
- **M**: Toggle Mute / Unmute.
- **N / P**: Skip to Next / Previous track in queue.
- **1–9**: Instant Speed Dial playback.
- **Typing Guard**: Automatically deactivated while typing in inputs or search bars.

---

## 🏗️ Architecture

```
dhun/
├── client/                     # Next.js 15 App Router Frontend
│   ├── app/                    # Application routes
│   │   ├── page.tsx            # Spotify-desktop redesigned Home
│   │   ├── album/[id]/         # Dedicated album discography hub
│   │   ├── artist/[id]/        # Artist discography & top tracks
│   │   ├── library/            # Saved library & playlist dock
│   │   ├── playlist/[id]/      # Spotify-grade playlist screen
│   │   ├── podcasts/           # Dedicated podcasts hub
│   │   ├── profile/            # User account & audio preferences
│   │   ├── login/ & register/  # Standalone authentication pages
│   │   ├── search/             # Global search & autocomplete
│   │   └── speed-dial/         # 9-Slot Speed Dial manager
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # AuthModal (Sign In / Register / Demo)
│   │   ├── layout/             # TopBar, Sidebar, BottomPlayer, MobileNav
│   │   ├── music/              # SpotifyHomeCards, TrackCard, TrackList
│   │   ├── player/             # PlayerControls, ProgressBar, VolumeSlider, LyricsModal
│   │   └── playlist/           # PlaylistEditModal, PlaylistImportModal, PlaylistExportModal
│   ├── lib/                    # Audio controller & API clients
│   └── stores/                 # Zustand state stores (player, queue, playlist, auth)
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── routes/             # API routes (music, auth, playlists, lyrics)
│   │   ├── services/           # userService, multiPipeRouter, lyricsService
│   │   ├── middleware/         # JWT auth validation & error handlers
│   │   └── config/             # Environment variables & constants
│   ├── prisma/                 # Database schema
│   └── data/                   # Persistent local fallback storage
│
└── docker-compose.yml          # Container configuration for PostgreSQL & Redis
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**
- **Git**

### 1. Clone & Configure
```bash
git clone https://github.com/your-username/dhun.git
cd dhun

# Copy sample environment configuration
cp .env.example .env
```

### 2. Install & Start Backend
```bash
cd server
npm install
npm run build
npm start
# Backend server runs on http://localhost:4000
```

### 3. Install & Start Frontend (In a second terminal)
```bash
cd client
npm install
npm run dev
# Frontend web client runs on http://localhost:3000
```

### 4. Open in Browser
Visit **`http://localhost:3000`** in Google Chrome, Microsoft Edge, Brave, or Safari.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Space</kbd> | Toggle Play / Pause |
| <kbd>→</kbd> | Seek Forward 5 Seconds |
| <kbd>←</kbd> | Seek Backward 5 Seconds |
| <kbd>↑</kbd> | Increase Volume 5% |
| <kbd>↓</kbd> | Decrease Volume 5% |
| <kbd>M</kbd> | Toggle Mute / Unmute |
| <kbd>N</kbd> | Skip to Next Track |
| <kbd>P</kbd> | Return to Previous Track |
| <kbd>1</kbd> – <kbd>9</kbd> | Instant Speed Dial Playback |

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/music/trending` | `GET` | Live trending charts filtered by region & category |
| `/api/music/search` | `GET` | Search songs, albums, artists, and playlists |
| `/api/music/suggestions` | `GET` | Real-time search autocomplete suggestions |
| `/api/music/album/:id` | `GET` | Album tracks and metadata |
| `/api/music/artist/:id` | `GET` | Artist discography and top 10 popular songs |
| `/api/music/stream/:id` | `GET` | Multi-instance audio stream resolution |
| `/api/music/lyrics` | `GET` | Synced LRC and plain text lyrics |
| `/api/auth/register` | `POST` | Create new user account with hashed password |
| `/api/auth/login` | `POST` | Authenticate user and issue JWT tokens |
| `/api/auth/google` | `POST` | Authenticate with Google OAuth |
| `/api/auth/me` | `GET` | Fetch authenticated user profile |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use it for personal, educational, or commercial projects.
