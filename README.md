# Link in Bio / Landing Page Builder

A simple, customizable landing page builder where users can create their own link-in-bio page with drag-and-drop cards, color customization, and avatar upload.

## Features

- 🔐 User authentication (sign up / login)
- 🎨 Drag-and-drop card editor
- 🎯 Customizable colors (background, text, links)
- 📸 Avatar upload
- 🔗 Multiple custom links
- 📱 Responsive design
- 🌐 Public shareable pages

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (planned)

## Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your `Project URL` and `Anon Key` from Settings → API

### 3. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create pages table
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR,
  bio TEXT,
  links JSONB,
  colors JSONB,
  avatar_url VARCHAR,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Set RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (for public pages)
CREATE POLICY "Users are viewable by public" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Pages are viewable by public
CREATE POLICY "Pages are viewable by public" ON pages
  FOR SELECT USING (true);

-- Only owner can update own page
CREATE POLICY "Users can update own page" ON pages
  FOR UPDATE USING (auth.uid() = user_id);

-- Only owner can insert own page
CREATE POLICY "Users can insert own page" ON pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` and sign up!

## Project Structure

```
src/
├── components/
│   └── Editor/
│       ├── Editor.jsx        (Main editor)
│       ├── DragDropList.jsx   (Link editor with drag-drop)
│       ├── ColorPicker.jsx    (Color customization)
│       └── AvatarUpload.jsx   (Avatar upload)
├── pages/
│   ├── Auth.jsx              (Login/signup)
│   ├── Dashboard.jsx         (Editor page)
│   └── PublicPage.jsx        (Public shared page)
├── lib/
│   └── supabase.js           (Supabase client)
└── App.jsx                   (Main app with routing)
```

## Next Steps

- [ ] Deploy to Vercel
- [ ] Add templates
- [ ] Add more customization options (fonts, animations)
- [ ] Analytics
- [ ] Social preview (OG tags)
