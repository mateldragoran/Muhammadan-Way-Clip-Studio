-- ==========================================
-- SUPABASE DATABASE SCHEMA SETUP
-- ==========================================

-- 1. Create Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    avatar_url TEXT,
    total_downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create Videos Table (Source Lectures/Nasheeds)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    clip_count INTEGER DEFAULT 0,
    category TEXT CHECK (category IN ('lecture', 'music')) DEFAULT 'lecture',
    captions_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos are viewable by everyone." ON videos FOR SELECT USING (true);

-- 3. Create Projects Table (Saved Editor States)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    state_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own projects." ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects." ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects." ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects." ON projects FOR DELETE USING (auth.uid() = user_id);

-- 4. Create Clips Table (Rendered Output Videos)
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    clip_url TEXT NOT NULL,
    template_used TEXT,
    downloads INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Clips
ALTER TABLE clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public clips are viewable by everyone." ON clips FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own clips." ON clips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can update downloads." ON clips FOR UPDATE USING (true); 

-- ==========================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ==========================================

-- Note: In the Supabase Dashboard, go to Storage and create the following buckets:
-- 1. `source-videos` (Public)
-- 2. `rendered-clips` (Public)
