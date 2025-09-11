export type UserRole = 'station_user' | 'station_admin' | 'super_admin'

export type ContentType = 'url' | 'upload' | 'manual'

export type WritingStyle = 'Humorous' | 'Casual' | 'Thoughtful' | 'Storytelling' | 'Custom'

export interface Station {
  id: string
  name: string
  created_at: string
}

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  station_id: string | null
  created_at: string
  updated_at: string
}

export interface CustomStyle {
  id: string
  user_id: string
  name: string
  style_guide: {
    voice_tone?: string
    structure_formatting?: string
    sentence_techniques?: string
    dos_donts?: {
      dos: string[]
      donts: string[]
    }
  }
  voice_tone?: string
  structure_formatting?: string
  sentence_techniques?: string
  common_phrases?: string[]
  dos_donts?: {
    dos: string[]
    donts: string[]
  }
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  artist: string
  title: string
  analysis: {
    emotional_tone: string
    themes: string[]
    mood: string
    meaning: string
    tempo?: string
    genre?: string
    era?: string
    key_elements: string[]
  }
  created_at: string
}

export interface ContentSession {
  id: string
  user_id: string
  content_source: string
  content_type: ContentType
  content_analysis?: {
    summary: string
    key_points: string[]
    tone: string
    topics: string[]
    relevance_score?: number
  }
  artist: string
  song_title: string
  song_analysis?: Song['analysis']
  selected_style: string
  short_script?: string
  long_script?: string
  regeneration_prompts?: string[]
  regenerated_scripts?: {
    short?: string[]
    long?: string[]
    timestamps: string[]
  }
  created_at: string
}

export interface ScriptOutput {
  short_script: string
  long_script: string
  performance_notes: {
    short: string
    long: string
  }
  content_summary: string
  song_analysis: Song['analysis']
}

export interface Database {
  public: {
    Tables: {
      stations: {
        Row: Station
        Insert: Omit<Station, 'id' | 'created_at'>
        Update: Partial<Omit<Station, 'id' | 'created_at'>>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_styles: {
        Row: CustomStyle
        Insert: Omit<CustomStyle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomStyle, 'id' | 'created_at' | 'updated_at'>>
      }
      songs: {
        Row: Song
        Insert: Omit<Song, 'id' | 'created_at'>
        Update: Partial<Omit<Song, 'id' | 'created_at'>>
      }
      content_sessions: {
        Row: ContentSession
        Insert: Omit<ContentSession, 'id' | 'created_at'>
        Update: Partial<Omit<ContentSession, 'id' | 'created_at'>>
      }
    }
  }
}