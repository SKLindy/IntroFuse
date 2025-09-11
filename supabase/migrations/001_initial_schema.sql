-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stations table
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with role-based access
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('station_user', 'station_admin', 'super_admin')),
  station_id UUID REFERENCES stations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom styles table
CREATE TABLE custom_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  style_guide JSONB NOT NULL,
  voice_tone TEXT,
  structure_formatting TEXT,
  sentence_techniques TEXT,
  common_phrases TEXT[],
  dos_donts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table for caching analyses
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist TEXT NOT NULL,
  title TEXT NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artist, title)
);

-- Content sessions table
CREATE TABLE content_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_source TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('url', 'upload', 'manual')),
  content_analysis JSONB,
  artist TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_analysis JSONB,
  selected_style TEXT NOT NULL,
  short_script TEXT,
  long_script TEXT,
  regeneration_prompts TEXT[],
  regenerated_scripts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_station_id ON users(station_id);
CREATE INDEX idx_custom_styles_user_id ON custom_styles(user_id);
CREATE INDEX idx_songs_artist_title ON songs(artist, title);
CREATE INDEX idx_content_sessions_user_id ON content_sessions(user_id);
CREATE INDEX idx_content_sessions_created_at ON content_sessions(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Station admins can view users in their station" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'station_admin'
      AND admin_user.station_id = users.station_id
    )
  );

-- RLS Policies for custom_styles table
CREATE POLICY "Users can view their own custom styles" ON custom_styles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own custom styles" ON custom_styles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own custom styles" ON custom_styles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Station admins can view custom styles in their station" ON custom_styles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role IN ('station_admin', 'super_admin')
      AND (
        admin_user.role = 'super_admin' OR
        admin_user.station_id = (
          SELECT station_id FROM users WHERE id = custom_styles.user_id
        )
      )
    )
  );

-- RLS Policies for content_sessions table
CREATE POLICY "Users can manage their own content sessions" ON content_sessions
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for songs table (shared cache)
CREATE POLICY "All authenticated users can read songs" ON songs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can insert songs" ON songs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_styles_updated_at BEFORE UPDATE ON custom_styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();