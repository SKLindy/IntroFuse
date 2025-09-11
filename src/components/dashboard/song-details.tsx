'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SongDetailsProps {
  artist: string
  songTitle: string
  onArtistChange: (artist: string) => void
  onSongTitleChange: (title: string) => void
}

export function SongDetails({ artist, songTitle, onArtistChange, onSongTitleChange }: SongDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="artist">Artist Name</Label>
        <Input
          id="artist"
          type="text"
          placeholder="Enter artist name"
          value={artist}
          onChange={(e) => onArtistChange(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="song-title">Song Title</Label>
        <Input
          id="song-title"
          type="text"
          placeholder="Enter song title"
          value={songTitle}
          onChange={(e) => onSongTitleChange(e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}