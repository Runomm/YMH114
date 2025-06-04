-- StoryVista Veritabanı Şeması - GÜNCELLENMIŞ

-- Kullanıcılar tablosu, Supabase Auth ile otomatik oluşturulur
-- Ek kullanıcı profil bilgileri için
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  subscription_type TEXT DEFAULT 'standard', -- standard, premium
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
  icon TEXT, -- emoji veya icon adı
  color TEXT DEFAULT '#3B82F6', -- kategori rengi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye stilleri/temaları
CREATE TABLE IF NOT EXISTS story_themes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  css_classes TEXT, -- tema için CSS sınıfları
  font_family TEXT,
  color_scheme JSONB, -- renk paleti
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikayeler
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  theme_id INTEGER REFERENCES story_themes(id) DEFAULT 1,
  cover_image_url TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  read_time INTEGER, -- estimated reading time in minutes
  page_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  
  -- Yeni eklenen alanlar
  author_name TEXT,
  main_character TEXT,
  setting_location TEXT,
  story_description TEXT,
  package_type TEXT DEFAULT 'normal', -- normal, deluxe, premium
  page_layout TEXT DEFAULT 'classic', -- classic, panoramic
  cover_style TEXT DEFAULT 'colorful', -- light, dark, colorful, minimal
  voice_type TEXT, -- ses tipi için
  voice_speed DECIMAL DEFAULT 1.0, -- ses hızı
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  language TEXT DEFAULT 'tr',
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- İstatistikler
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0
);

-- Hikaye sayfaları (kitap şeklinde hikayeler için)
CREATE TABLE IF NOT EXISTS story_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT,
  title TEXT, -- sayfa başlığı
  image_url TEXT,
  image_prompt TEXT, -- AI görsel üretimi için kullanılan prompt
  
  -- Sayfa düzeni
  template_type TEXT DEFAULT 'classic', -- classic, panoramic
  is_cover_page BOOLEAN DEFAULT FALSE,
  is_back_cover_page BOOLEAN DEFAULT FALSE,
  is_title_page BOOLEAN DEFAULT FALSE,
  
  -- Stil özellikleri
  font_size TEXT DEFAULT 'medium', -- small, medium, large
  text_alignment TEXT DEFAULT 'left', -- left, center, justify
  background_color TEXT,
  text_color TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(story_id, page_number)
);

-- Kullanıcı kütüphanesi
CREATE TABLE IF NOT EXISTS library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  reading_progress INTEGER DEFAULT 0, -- hangi sayfada kaldı
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Hikaye değerlendirmeleri (puanlar)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  review TEXT, -- opsiyonel yorum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Hikaye yorumları
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id), -- yanıt için
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı mesajları
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  subject TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  message_type TEXT DEFAULT 'personal', -- personal, system, notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hikaye beğenileri
CREATE TABLE IF NOT EXISTS story_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Kullanıcı takip sistemi
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id),
  following_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- AI görsellerin metadata'sı
CREATE TABLE IF NOT EXISTS ai_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  page_id UUID REFERENCES story_pages(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style TEXT, -- children, modern, fantasy, adventure
  image_url TEXT NOT NULL,
  generation_time INTEGER, -- milisaniye
  model_used TEXT DEFAULT 'dalle-3',
  cost DECIMAL(10,4), -- maliyet tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ses dosyaları metadata'sı
CREATE TABLE IF NOT EXISTS story_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  voice_type TEXT DEFAULT 'standard',
  voice_speed DECIMAL DEFAULT 1.0,
  language TEXT DEFAULT 'tr',
  file_size_bytes BIGINT,
  generation_cost DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sistem ayarları
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Varsayılan kategoriler - GÜNCELLENMIŞ
INSERT INTO categories (name, description, icon, color)
VALUES 
  ('Macera', 'Heyecan dolu macera hikayeleri', '🗺️', '#F59E0B'),
  ('Romantizm', 'Aşk ve romantizm hikayeleri', '💕', '#EC4899'),
  ('Bilim Kurgu', 'Gelecek ve teknoloji temalı hikayeler', '🚀', '#8B5CF6'),
  ('Gerilim', 'Heyecan ve gerilim dolu hikayeler', '⚡', '#EF4444'),
  ('Fantastik', 'Hayal gücünü zorlayan fantastik hikayeler', '🧙‍♂️', '#10B981'), 
  ('Tarih', 'Tarihi olayları anlatan hikayeler', '🏛️', '#6B7280'),
  ('Çocuk', 'Çocuklar için özel hikayeler', '🧸', '#F472B6'),
  ('Komedi', 'Güldürücü ve eğlenceli hikayeler', '😄', '#FBBF24')
ON CONFLICT (name) DO NOTHING;

-- Varsayılan temalar
INSERT INTO story_themes (name, display_name, description, font_family, color_scheme)
VALUES 
  ('children', 'Çocuk Masalı', 'Renkli ve canlı, çocuklara yönelik sevimli bir düzen', 'Comic Sans MS, cursive', '{"primary": "#FF6B6B", "secondary": "#4ECDC4", "accent": "#45B7D1"}'),
  ('modern', 'Modern', 'Temiz ve sade, zarif bir tasarım', 'Inter, sans-serif', '{"primary": "#2D3748", "secondary": "#4A5568", "accent": "#3182CE"}'),
  ('fantasy', 'Fantastik', 'Büyülü, masalsı ve hayal gücünü zorlayan bir tema', 'Merriweather, serif', '{"primary": "#6B46C1", "secondary": "#9F7AEA", "accent": "#ED64A6"}'),
  ('adventure', 'Macera', 'Heyecanlı, dinamik ve merak uyandıran bir düzen', 'Roboto Mono, monospace', '{"primary": "#D69E2E", "secondary": "#ED8936", "accent": "#38A169"}')
ON CONFLICT (name) DO NOTHING;

-- Varsayılan sistem ayarları
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES 
  ('max_pages_standard', '{"value": 12}', 'Standart kullanıcılar için maksimum sayfa sayısı'),
  ('max_pages_premium', '{"value": 50}', 'Premium kullanıcılar için maksimum sayfa sayısı'),
  ('ai_image_cost_per_request', '{"value": 0.04}', 'Görsel üretimi başına maliyet (USD)'),
  ('ai_audio_cost_per_minute', '{"value": 0.015}', 'Ses üretimi dakika başına maliyet (USD)'),
  ('default_story_theme', '{"value": "children"}', 'Varsayılan hikaye teması'),
  ('daily_story_limit_standard', '{"value": 3}', 'Standart kullanıcılar için günlük hikaye limiti'),
  ('daily_story_limit_premium', '{"value": 20}', 'Premium kullanıcılar için günlük hikaye limiti')
ON CONFLICT (setting_key) DO NOTHING;

-- İzinler ve Güvenlik Politikaları
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE library ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_audio ENABLE ROW LEVEL SECURITY;

-- Profil izinleri
CREATE POLICY "Kullanıcılar kendi profillerini düzenleyebilir" ON profiles
  FOR ALL USING (auth.uid() = id);
  
CREATE POLICY "Profiller herkes tarafından görülebilir" ON profiles
  FOR SELECT USING (true);

-- Hikaye izinleri
CREATE POLICY "Kullanıcılar kendi hikayelerini düzenleyebilir" ON stories
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Yayınlanan hikayeler herkes tarafından görülebilir" ON stories
  FOR SELECT USING (status = 'published');

-- Hikaye sayfaları izinleri
CREATE POLICY "Kullanıcılar kendi hikaye sayfalarını düzenleyebilir" ON story_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_pages.story_id 
      AND stories.user_id = auth.uid()
    )
  );
  
CREATE POLICY "Yayınlanan hikayelerin sayfaları görülebilir" ON story_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_pages.story_id 
      AND stories.status = 'published'
    )
  );

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

-- Beğeni izinleri
CREATE POLICY "Kullanıcılar kendi beğenilerini yönetebilir" ON story_likes
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Beğeniler herkes tarafından görülebilir" ON story_likes
  FOR SELECT USING (true);

-- Takip izinleri
CREATE POLICY "Kullanıcılar kendi takiplerini yönetebilir" ON user_follows
  FOR ALL USING (auth.uid() = follower_id);
  
CREATE POLICY "Takipler herkes tarafından görülebilir" ON user_follows
  FOR SELECT USING (true);

-- AI görseller izinleri
CREATE POLICY "Kullanıcılar kendi AI görsellerini yönetebilir" ON ai_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = ai_images.story_id 
      AND stories.user_id = auth.uid()
    )
  );

-- Ses dosyaları izinleri
CREATE POLICY "Kullanıcılar kendi ses dosyalarını yönetebilir" ON story_audio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_audio.story_id 
      AND stories.user_id = auth.uid()
    )
  );

-- Faydalı view'lar
CREATE OR REPLACE VIEW story_stats AS
SELECT 
  s.id,
  s.title,
  s.view_count,
  s.like_count,
  COALESCE(AVG(r.score), 0) as avg_rating,
  COUNT(r.id) as rating_count,
  COUNT(c.id) as comment_count
FROM stories s
LEFT JOIN ratings r ON s.id = r.story_id
LEFT JOIN comments c ON s.id = c.story_id
WHERE s.status = 'published'
GROUP BY s.id, s.title, s.view_count, s.like_count;

-- Fonksiyonlar
CREATE OR REPLACE FUNCTION update_story_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Beğeni sayısını güncelle
  UPDATE stories 
  SET like_count = (
    SELECT COUNT(*) FROM story_likes 
    WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
  )
  WHERE id = COALESCE(NEW.story_id, OLD.story_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger'lar
CREATE TRIGGER update_story_likes_count
  AFTER INSERT OR DELETE ON story_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_stats();

CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET 
    stories_created = (
      SELECT COUNT(*) FROM stories 
      WHERE user_id = NEW.user_id AND status = 'published'
    ),
    total_pages_created = (
      SELECT COALESCE(SUM(page_count), 0) FROM stories 
      WHERE user_id = NEW.user_id AND status = 'published'
    )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_story_stats
  AFTER INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats(); 