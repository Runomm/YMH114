-- StoryVista Database Migration - Initial Setup
-- Bu dosya Supabase migration sistemi ile otomatik çalışacaktır

-- Extension'ları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcı profilleri tablosu
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    subscription_type TEXT DEFAULT 'standard' CHECK (subscription_type IN ('standard', 'premium')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    stories_created INTEGER DEFAULT 0,
    total_pages_created INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye kategorileri
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye temaları
CREATE TABLE IF NOT EXISTS story_themes (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color_scheme JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ana hikayeler tablosu
CREATE TABLE IF NOT EXISTS stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    theme_id INTEGER REFERENCES story_themes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Hikaye detayları
    author_name TEXT,
    main_character TEXT,
    setting_location TEXT,
    story_description TEXT,
    
    -- Paket ve düzen bilgileri
    package_type TEXT DEFAULT 'normal' CHECK (package_type IN ('normal', 'deluxe', 'premium')),
    page_layout TEXT DEFAULT 'classic' CHECK (page_layout IN ('classic', 'panoramic')),
    cover_style TEXT DEFAULT 'colorful' CHECK (cover_style IN ('light', 'dark', 'colorful', 'minimal')),
    
    -- Sayfa ve içerik bilgileri
    page_count INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 0, -- dakika cinsinden
    
    -- Medya dosyaları
    cover_image_url TEXT,
    
    -- Ses ayarları
    voice_type TEXT,
    voice_speed DECIMAL(3,2) DEFAULT 1.0,
    
    -- İstatistikler
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Yayın bilgileri
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Zaman damgaları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye sayfaları
CREATE TABLE IF NOT EXISTS story_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    page_number INTEGER NOT NULL,
    title TEXT,
    content TEXT,
    
    -- Görsel bilgileri
    image_url TEXT,
    image_prompt TEXT,
    
    -- Sayfa özellikleri
    template_type TEXT DEFAULT 'classic' CHECK (template_type IN ('classic', 'panoramic')),
    is_cover_page BOOLEAN DEFAULT FALSE,
    is_back_cover_page BOOLEAN DEFAULT FALSE,
    is_title_page BOOLEAN DEFAULT FALSE,
    
    -- Zaman damgaları
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(story_id, page_number)
);

-- AI görselleri tablosu
CREATE TABLE IF NOT EXISTS ai_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID REFERENCES story_pages(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    generation_model TEXT,
    generation_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ses dosyaları tablosu
CREATE TABLE IF NOT EXISTS story_audio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    page_id UUID REFERENCES story_pages(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    voice_type TEXT,
    duration INTEGER, -- saniye cinsinden
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı kütüphanesi (favori hikayeler)
CREATE TABLE IF NOT EXISTS library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint - kullanıcı aynı hikayeyi birden fazla favoriye alamaz
    UNIQUE(user_id, story_id)
);

-- Beğeniler tablosu
CREATE TABLE IF NOT EXISTS story_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, story_id)
);

-- Hikaye istatistikleri view'i
CREATE VIEW story_stats AS
SELECT 
    s.id as story_id,
    s.view_count,
    COUNT(DISTINCT sl.id) as like_count,
    COUNT(DISTINCT l.id) as favorite_count,
    s.created_at,
    s.updated_at
FROM stories s
LEFT JOIN story_likes sl ON s.id = sl.story_id
LEFT JOIN library l ON s.id = l.story_id
GROUP BY s.id, s.view_count, s.created_at, s.updated_at;

-- İndexler (performans için)
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_category_id ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at);
CREATE INDEX IF NOT EXISTS idx_story_pages_story_id ON story_pages(story_id);
CREATE INDEX IF NOT EXISTS idx_story_pages_page_number ON story_pages(page_number);
CREATE INDEX IF NOT EXISTS idx_library_user_id ON library(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);

-- Trigger'lar (otomatik güncelleme için)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger'larını ekle
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_story_pages_updated_at BEFORE UPDATE ON story_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Başlangıç verileri
INSERT INTO categories (name, description, icon) VALUES
    ('Macera', 'Heyecan dolu macera hikayeleri', '🗺️'),
    ('Fantastik', 'Büyülü dünyalar ve yaratıklar', '🧙‍♂️'),
    ('Bilim Kurgu', 'Gelecek ve teknoloji hikayeleri', '🚀'),
    ('Aile', 'Aile değerleri ve dostluk', '👨‍👩‍👧‍👦'),
    ('Eğitici', 'Öğretici ve gelişim hikayeleri', '📚'),
    ('Komedi', 'Eğlenceli ve komik hikayeler', '😄')
ON CONFLICT (name) DO NOTHING;

INSERT INTO story_themes (name, description, color_scheme) VALUES
    ('Çocuk Masalı', 'Renkli ve sıcak tema', '{"primary": "#FF6B6B", "secondary": "#4ECDC4", "accent": "#45B7D1"}'),
    ('Modern', 'Temiz ve minimalist', '{"primary": "#2C3E50", "secondary": "#3498DB", "accent": "#E74C3C"}'),
    ('Fantastik', 'Büyülü ve mistik renkler', '{"primary": "#8E44AD", "secondary": "#9B59B6", "accent": "#F39C12"}'),
    ('Doğa', 'Doğal ve organik tonlar', '{"primary": "#27AE60", "secondary": "#2ECC71", "accent": "#F1C40F"}')
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security) politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- Profiller için RLS politikaları
CREATE POLICY "Herkes profilleri görebilir" ON profiles FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Hikayeler için RLS politikaları
CREATE POLICY "Herkes yayınlanan hikayeleri görebilir" ON stories FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi hikayelerini yönetebilir" ON stories FOR ALL USING (auth.uid() = user_id);

-- Sayfa politikaları
CREATE POLICY "Sayfalar hikaye ile aynı yetkilere sahip" ON story_pages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM stories 
        WHERE stories.id = story_pages.story_id 
        AND (stories.status = 'published' OR auth.uid() = stories.user_id)
    )
);
CREATE POLICY "Kullanıcılar kendi hikaye sayfalarını yönetebilir" ON story_pages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM stories 
        WHERE stories.id = story_pages.story_id 
        AND auth.uid() = stories.user_id
    )
);

-- Kütüphane politikaları
CREATE POLICY "Kullanıcılar kendi kütüphanelerini görebilir" ON library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi kütüphanelerini yönetebilir" ON library FOR ALL USING (auth.uid() = user_id);

-- Beğeni politikaları
CREATE POLICY "Herkes beğenileri görebilir" ON story_likes FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi beğenilerini yönetebilir" ON story_likes FOR ALL USING (auth.uid() = user_id);

-- Storage bucket'ı oluştur (görseller için)
INSERT INTO storage.buckets (id, name, public) VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage politikaları
CREATE POLICY "Herkes görselleri görebilir" ON storage.objects FOR SELECT USING (bucket_id = 'story-images');
CREATE POLICY "Giriş yapmış kullanıcılar görsel yükleyebilir" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'story-images' AND auth.role() = 'authenticated'); 