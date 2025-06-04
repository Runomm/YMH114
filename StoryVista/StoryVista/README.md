# 📚 StoryVista - AI Destekli Hikaye Oluşturma Platformu

StoryVista, yapay zeka destekli hikaye oluşturma, görsel üretimi ve kişiselleştirilmiş okuma deneyimi sunan modern bir web uygulamasıdır.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **AI Destekli Hikaye Yazımı**: Google Gemini AI ile otomatik hikaye oluşturma
- **Görsel Üretimi**: AI ile sayfa görsellerini otomatik oluşturma
- **Ses Sentezi**: Hikayelerinizi dinlenebilir hale getirme
- **Çoklu Düzen**: Klasik ve panoramik sayfa düzenleri
- **Kişiselleştirme**: Kullanıcı tercihleri ve tema seçenekleri

### 🗄️ Database Özellikleri (YENİ!)
- **Hikaye Yönetimi**: Taslak kaydetme, düzenleme, yayınlama
- **Kişisel Kütüphane**: Oluşturduğunuz hikayeleri organize etme
- **Favori Sistem**: Beğendiğiniz hikayeleri kaydetme
- **Kullanıcı Profilleri**: Kişiselleştirilmiş deneyim
- **Hikaye İstatistikleri**: Görüntülenme, beğeni sayıları

### 🎨 Görsel ve Tasarım
- **Modern UI/UX**: Responsive ve kullanıcı dostu arayüz
- **Dark Mode**: Koyu ve açık tema desteği
- **Animasyonlar**: Framer Motion ile akıcı geçişler
- **Mobil Uyumlu**: Tüm cihazlarda mükemmel görünüm

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Supabase hesabı
- Google Gemini AI API anahtarı

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/your-username/storyvista.git
cd storyvista
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Supabase Setup
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API anahtarlarını alın
4. SQL editöründe `supabase/migrations/001_initial_setup.sql` dosyasını çalıştırın

### 4. Environment Variables
`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```

## 📊 Database Şeması

### Ana Tablolar
- **profiles**: Kullanıcı profil bilgileri
- **stories**: Hikaye verileri ve metadata
- **story_pages**: Hikaye sayfaları
- **categories**: Hikaye kategorileri
- **story_themes**: Görsel temalar
- **library**: Kullanıcı kütüphanesi
- **story_likes**: Beğeni sistemi

### Güvenlik
- Row Level Security (RLS) politikaları
- Kullanıcı bazlı veri erişim kontrolü
- Güvenli API endpoint'leri

## 🎯 Kullanım

### Hikaye Oluşturma
1. "Hikaye Oluştur" butonuna tıklayın
2. Kullanıcı tipinizi seçin (Standart/Premium)
3. Hikaye fikirlerinizi girin veya "Yardım Al" butonunu kullanın
4. AI'nın oluşturduğu hikayeyi gözden geçirin
5. Stil ve düzen tercihlerinizi seçin
6. Görselleri oluşturun
7. Önizleme yapın ve yayınlayın

### Kütüphane Yönetimi
- **Hikayelerim**: Oluşturduğunuz tüm hikayeler
- **Taslaklar**: Henüz yayınlanmamış hikayeler
- **Favoriler**: Beğendiğiniz hikayeler
- **Düzenleme**: Mevcut hikayeleri güncelleyebilme

## 🛠️ Teknolojiler

### Frontend
- **React 18**: Modern React hooks ve özellikleri
- **TypeScript**: Tip güvenliği
- **Vite**: Hızlı build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animasyon kütüphanesi

### Backend & Database
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: İlişkisel veritabanı
- **Row Level Security**: Güvenlik politikaları
- **Real-time**: Anlık veri güncellemeleri

### AI & APIs
- **Google Gemini**: Hikaye üretimi
- **Replicate**: Görsel üretimi (opsiyonel)
- **Web Speech API**: Ses sentezi

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── BookPage.tsx    # Hikaye sayfa bileşeni
│   ├── BookCover.tsx   # Kapak tasarımı
│   ├── Header.tsx      # Navigasyon
│   └── ...
├── pages/              # Sayfa bileşenleri
│   ├── CreateStoryPage.tsx  # Hikaye oluşturma
│   ├── LibraryPage.tsx     # Kütüphane yönetimi
│   ├── HomePage.tsx        # Ana sayfa
│   └── ...
├── lib/                # Yardımcı kütüphaneler
│   ├── storyDatabase.ts    # Database işlemleri
│   ├── database.types.ts   # TypeScript tipleri
│   ├── supabase.ts        # Supabase client
│   ├── aiService.ts       # AI servisleri
│   └── ...
└── supabase/           # Database şeması
    ├── schema.sql      # Ana şema
    └── migrations/     # Migration dosyaları
```

## 🔧 Geliştirme

### Database Değişiklikleri
1. `supabase/schema.sql` dosyasını güncelleyin
2. `src/lib/database.types.ts` tiplerini güncelleyin
3. Migration dosyası oluşturun
4. Supabase'de migration'ı çalıştırın

### Type Safety
Tüm database işlemleri TypeScript ile tip güvenliği sağlar:
```typescript
const result = await storyDb.stories.createStory(storyData);
if (result.success) {
  console.log('Hikaye oluşturuldu:', result.data);
}
```

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 🐛 Hata Bildirimi

Hata bulursanız veya öneriniz varsa [Issues](https://github.com/your-username/storyvista/issues) sayfasından bildirebilirsiniz.

## 📧 İletişim

- Email: your-email@example.com
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Website: [Your Website](https://your-website.com)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! 