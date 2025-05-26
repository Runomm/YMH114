-- StoryVista Veritabanı Şeması

-- Kullanıcılar tablosu, Supabase Auth ile otomatik oluşturulur
-- Ek kullanıcı profil bilgileri için
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye kategorileri
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikayeler
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'published', -- draft, published
  read_time INTEGER, -- estimated reading time in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  language TEXT DEFAULT 'tr',
  is_premium BOOLEAN DEFAULT FALSE
);

-- Hikaye sayfaları (kitap şeklinde hikayeler için)
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT,
  image_url TEXT,
  template TEXT, -- classic, panoramic, visual_text, fullpage
  is_cover_page BOOLEAN DEFAULT FALSE,
  is_back_cover_page BOOLEAN DEFAULT FALSE,
  image_prompt TEXT, -- AI görsel üretimi için kullanılan prompt
  UNIQUE(story_id, page_number)
);

-- Kullanıcı kütüphanesi
CREATE TABLE IF NOT EXISTS library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Hikaye değerlendirmeleri (puanlar)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Hikaye yorumları
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı mesajları
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varsayılan kategoriler
INSERT INTO categories (name, description)
VALUES 
  ('Macera', 'Heyecan dolu macera hikayeleri'),
  ('Romantizm', 'Aşk ve romantizm hikayeleri'),
  ('Bilim Kurgu', 'Gelecek ve teknoloji temalı hikayeler'),
  ('Gerilim', 'Heyecan ve gerilim dolu hikayeler'),
  ('Fantastik', 'Hayal gücünü zorlayan fantastik hikayeler'), 
  ('Tarih', 'Tarihi olayları anlatan hikayeler')
ON CONFLICT (name) DO NOTHING;

-- İzinler ve Güvenlik Politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profil izinleri
CREATE POLICY "Kullanıcılar kendi profillerini düzenleyebilir" ON profiles
  FOR ALL USING (auth.uid() = id);
  
CREATE POLICY "Profiller herkes tarafından görülebilir" ON profiles
  FOR SELECT USING (true);

-- Hikaye izinleri
CREATE POLICY "Kullanıcılar kendi hikayelerini düzenleyebilir" ON stories
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Hikayeler herkes tarafından görülebilir" ON stories
  FOR SELECT USING (status = 'published');

-- Kütüphane izinleri
CREATE POLICY "Kullanıcılar kendi kütüphanelerini yönetebilir" ON library
  FOR ALL USING (auth.uid() = user_id);

-- Değerlendirme izinleri
CREATE POLICY "Kullanıcılar kendi değerlendirmelerini yönetebilir" ON ratings
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Değerlendirmeler herkes tarafından görülebilir" ON ratings
  FOR SELECT USING (true);

-- Yorum izinleri
CREATE POLICY "Kullanıcılar kendi yorumlarını yönetebilir" ON comments
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Yorumlar herkes tarafından görülebilir" ON comments
  FOR SELECT USING (true);

-- Mesaj izinleri
CREATE POLICY "Kullanıcılar kendi mesajlarını görebilir" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  
CREATE POLICY "Kullanıcılar mesaj gönderebilir" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id); 