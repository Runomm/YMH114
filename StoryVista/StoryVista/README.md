# StoryVista

StoryVista, 25-45 yaş arası kullanıcılara hitap eden, modern ve minimalist bir hikaye platformudur. Kullanıcılar hikayeler oluşturabilir, okuyabilir, dinleyebilir ve diğer kullanıcılarla etkileşime girebilir.

## Özellikler

- **Hikaye Oluşturma**: Adım adım bir süreçle, yapay zeka destekli hikayeler oluşturun
- **Hikaye Okuma**: Farklı okuma modları ile hikayeleri okuyun veya dinleyin
- **Kategoriler**: Çeşitli kategorilerde hikayeler keşfedin
- **Profil**: Kişisel bilgilerinizi, hikayelerinizi ve istatistiklerinizi yönetin

## Teknolojiler

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router
- Backend: Supabase Edge Functions
- Veritabanı: Supabase PostgreSQL
- Depolama: Cloudflare R2
- Yapay Zeka: Gemini API, Stable Diffusion, gTTS, ElevenLabs

## Kurulum

1. Repoyu klonlayın
   ```
   git clone https://github.com/kullaniciadiniz/storyvista.git
   cd storyvista
   ```

2. Bağımlılıkları yükleyin
   ```
   npm install
   ```

3. Geliştirme sunucusunu başlatın
   ```
   npm run dev
   ```

4. Tarayıcınızda `http://localhost:5173` adresine gidin

## Yapı

Proje aşağıdaki ana bileşenlerden oluşmaktadır:

- Ana Sayfa: Hikayelerin listelendiği ve arandığı sayfa
- Kategoriler: Hikayelerin kategorilere göre gruplandırıldığı sayfa
- Hikaye Oluşturma: Adım adım hikaye oluşturma sihirbazı
- Hikaye Okuma: Hikaye metni, ses oynatıcı ve etkileşim özellikleri
- Profil: Kullanıcı bilgileri, hikaye yönetimi, ayarlar ve istatistikler

## Katkıda Bulunma

1. Bu repoyu forklayın
2. Özellik dalı oluşturun (`git checkout -b yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik: XYZ'`)
4. Dalınıza push yapın (`git push origin yeni-ozellik`)
5. Pull Request açın 