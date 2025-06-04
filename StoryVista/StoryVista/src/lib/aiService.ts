// aiService.ts - StoryVista platformu için AI hizmetleri
// Bu servis Gemini API, Stable Diffusion, gTTS ve ElevenLabs entegrasyonlarını yönetir

import { supabase } from './supabase';
import 'isomorphic-fetch'; // Fetch API için universal destek

// Paket tipleri
export enum PackageType {
  NORMAL = 'normal',       // 6 sayfa
  PREMIUM1 = 'premium1',   // 6, 8 veya 12 sayfa
  PLUS = 'plus'            // 6, 8, 12, 16 veya 20 sayfa
}

// Hikaye prompt tipi tanımı
export interface StoryPrompt {
  category: string;
  length: 'short' | 'medium' | 'long';
  tone: 'serious' | 'humorous' | 'romantic' | 'thriller';
  characterCount: number;
  inspiration: string;
  mainCharacter?: string;
  setting?: string;
  timeline?: string;
  packageType?: PackageType; // Paket tipi ekledik
  pageCount?: number;        // İstenilen sayfa sayısı
  title?: string;            // Hikaye başlığı
}

// Hikaye yanıtı tipi tanımı
export interface StoryResponse {
  text: string;
  imageUrl?: string;
  pages?: StoryPage[]; // Sayfalara bölünmüş hikaye
}

// Hikaye sayfası tipi
export interface StoryPage {
  content: string;
  image?: string;
  imagePrompt?: string;
  isTitle?: boolean;
}

// API anahtarlarını güvenli bir şekilde almak için kullanılır
const getApiKey = async (keyName: string): Promise<string> => {
  try {
    // Gerçek ortamda, bu anahtarlar env değişkenlerinden gelecek
    const apiKeys: Record<string, string> = {
      'gemini': 'AIzaSyB7-u9HB-iQmnl-C39MghjtC-hk_8yRK_c', // Gemini API anahtarı
      'stable_diffusion': 'stable-diffusion-api-key',
      'elevenlabs': 'your-elevenlabs-api-key'
    };
    
    const apiKey = apiKeys[keyName];
    if (!apiKey) {
      throw new Error(`API anahtarı bulunamadı: ${keyName}`);
    }
    
    return apiKey;
  } catch (error) {
    console.error(`API anahtarı alınamadı: ${keyName}`, error);
    throw new Error(`API anahtarı alınamadı: ${keyName}`);
  }
};

// Paket tipine göre sayfa sayısını belirler
export const getPageCountByPackage = (packageType: PackageType, requestedCount?: number): number => {
  // Eğer belirli bir sayfa sayısı talep edildiyse ve paket tipine uygunsa doğrudan onu kullan
  // +2 kapak ekleyerek hesapla (baş kapak + son kapak)
  if (requestedCount && requestedCount > 0) {
    const totalWithCovers = requestedCount + 2; // +2 kapak (baş ve son)
    
    // Paket tipine göre maksimum sayfa sayısını kontrol et
    switch(packageType) {
      case PackageType.NORMAL:
        return Math.min(totalWithCovers, 8); // Normal paket: max 6 sayfa + 2 kapak = 8 sayfa
      case PackageType.PREMIUM1:
        return Math.min(totalWithCovers, 14); // Premium1 paket: max 12 sayfa + 2 kapak = 14 sayfa
      case PackageType.PLUS:
        return Math.min(totalWithCovers, 22); // Plus paket: max 20 sayfa + 2 kapak = 22 sayfa
      default:
        return totalWithCovers;
    }
  }
  
  // Eğer özel sayfa sayısı belirtilmediyse, varsayılan değerleri kullan (+2 kapak dahil)
  switch(packageType) {
    case PackageType.NORMAL:
      return 8; // 6 sayfa + 2 kapak
    case PackageType.PREMIUM1:
      return 10; // 8 sayfa + 2 kapak  
    case PackageType.PLUS:
      return 14; // 12 sayfa + 2 kapak
    default:
      return 8; // Bilinmeyen paket tiplerinde varsayılan değer
  }
};

// Hikayeyi sayfalara böler
export const splitStoryIntoPages = (storyText: string, pageCount: number): StoryPage[] => {
  // Sayfa array'i oluşturuyoruz
  const pages: StoryPage[] = [];
  
  try {
    // Gemini API'nin döndüğü sayfa etiketlerini işle
    const pageRegex = /<sayfa\s*(\d+)>([\s\S]*?)<\/sayfa\s*\1>/g;
    let match;
    
    while ((match = pageRegex.exec(storyText)) !== null) {
      const pageNumber = parseInt(match[1]);
      const pageContent = match[2].trim();
      
      // Görsel açıklamasını ayıkla
      const imagePromptRegex = /<görsel_prompt>([\s\S]*?)<\/görsel_prompt>/;
      const imagePromptMatch = pageContent.match(imagePromptRegex);
      
      let content = pageContent;
      let imagePrompt = '';
      
      if (imagePromptMatch) {
        // Görsel açıklaması etiketlerini içerikten çıkar
        content = pageContent.replace(imagePromptRegex, '').trim();
        imagePrompt = imagePromptMatch[1].trim();
      }
      
      pages.push({
        content: content,
        imagePrompt: imagePrompt,
        isTitle: pageNumber === 1 // İlk sayfa başlık/kapak sayfası
      });
    }
    
    // Eğer sayfa etiketleri bulunamadıysa, eski yöntemi kullan
    if (pages.length === 0) {
      console.log("Sayfa etiketleri bulunamadı, alternatif yöntem kullanılıyor.");
      return fallbackSplitStoryIntoPages(storyText, pageCount);
    }
    
    // Sayfaları sıralayalım (pageNumber'a göre sıralama yapılıyor)
    pages.sort((a, b) => {
      const aIsTitle = a.isTitle ? 1 : 0;
      const bIsTitle = b.isTitle ? 1 : 0;
      return aIsTitle - bIsTitle;
    });
    
    // Hedef sayfa sayısına ulaşana kadar işle
    while (pages.length < pageCount) {
      const currentPageNum = pages.length + 1;
      
      // Son sayfa mı kontrol et
      const isLastPage = currentPageNum === pageCount;
      
      if (isLastPage) {
        // Son kapak sayfası
        pages.push({
          content: "Son Sayfa",
          imagePrompt: "Hikaye son kapağı",
          isTitle: true // Son kapak da başlık sayfası olarak işaretle
        });
      } else {
        // Normal içerik sayfası
      pages.push({
        content: "",
        imagePrompt: "Dekoratif sayfa görseli"
      });
      }
    }
    
    return pages;
  } catch (error) {
    console.error("Hikayeyi sayfalara bölme hatası:", error);
    return fallbackSplitStoryIntoPages(storyText, pageCount);
  }
};

// Yedek sayfalara bölme fonksiyonu (API düzgün formatta dönmezse)
const fallbackSplitStoryIntoPages = (storyText: string, pageCount: number): StoryPage[] => {
  // İlk önce hikaye metnini paragraflarına ayırıyoruz
  const paragraphs = storyText.split('\n\n').filter(p => p.trim());
  
  // Baş kapak (1) + İçerik sayfaları + Son kapak (1) = toplam pageCount
  const contentPageCount = Math.max(0, pageCount - 2); // 2 kapak sayfası çıkar
  
  // Her sayfada olması gereken paragraf sayısını hesaplıyoruz
  const paragraphsPerPage = Math.max(1, Math.ceil(paragraphs.length / contentPageCount));
  
  // Sayfa array'i oluşturuyoruz
  const pages: StoryPage[] = [];
  
  // 1. Baş kapak sayfası ekliyoruz
  pages.push({
    content: paragraphs[0] || "Yeni Hikaye",
    isTitle: true,
    imagePrompt: "Kitap ön kapağı"
  });
  
  // 2. İçerik sayfalarını oluşturuyoruz
  for (let i = 0; i < contentPageCount; i++) {
    const startIdx = 1 + (i * paragraphsPerPage); // İlk paragraf kapak için kullanıldı
    const endIdx = Math.min(startIdx + paragraphsPerPage, paragraphs.length);
    const pageContent = paragraphs.slice(startIdx, endIdx).join('\n\n');
    
    if (pageContent.trim()) {
      pages.push({
        content: pageContent,
        imagePrompt: `İçerik sayfası ${i + 1} görseli: ${pageContent.substring(0, 100)}...`
      });
    } else {
      pages.push({
        content: `Bu ${i + 1}. sayfanın içeriğidir.`,
        imagePrompt: `Sayfa ${i + 1} görseli`
      });
    }
  }
  
  // 3. Son kapak sayfası ekliyoruz (eğer pageCount > 1 ise)
  if (pageCount > 1) {
    pages.push({
      content: "Son Sayfa",
      isTitle: true,
      imagePrompt: "Kitap arka kapağı"
    });
  }
  
  // Hedef sayfa sayısına tam ulaştığımızı kontrol et
  while (pages.length < pageCount) {
    pages.push({
      content: "",
      imagePrompt: "Boş sayfa görseli"
    });
  }
  
  return pages;
};

// Hikaye metnini sayfalara böler
export const splitStoryIntoPagesOld = (storyText: string, pageCount: number): StoryPage[] => {
  // Sayfa array'i oluşturuyoruz
  const pages: StoryPage[] = [];
  
  try {
    // Gemini API'nin döndüğü sayfa etiketlerini işle
    const pageRegex = /<sayfa\s*(\d+)>([\s\S]*?)<\/sayfa\s*\1>/g;
    let match;
    
    while ((match = pageRegex.exec(storyText)) !== null) {
      const pageNumber = parseInt(match[1]);
      const pageContent = match[2].trim();
      
      // Görsel açıklamasını ayıkla
      const imagePromptRegex = /<görsel_prompt>([\s\S]*?)<\/görsel_prompt>/;
      const imagePromptMatch = pageContent.match(imagePromptRegex);
      
      let content = pageContent;
      let imagePrompt = '';
      
      if (imagePromptMatch) {
        // Görsel açıklaması etiketlerini içerikten çıkar
        content = pageContent.replace(imagePromptRegex, '').trim();
        imagePrompt = imagePromptMatch[1].trim();
      }
      
      pages.push({
        content: content,
        imagePrompt: imagePrompt,
        isTitle: pageNumber === 1 // İlk sayfa başlık/kapak sayfası
      });
    }
    
    // Eğer sayfa etiketleri bulunamadıysa, eski yöntemi kullan
    if (pages.length === 0) {
      console.log("Sayfa etiketleri bulunamadı, alternatif yöntem kullanılıyor.");
      return fallbackSplitStoryIntoPages(storyText, pageCount);
    }
    
    // Sayfaları sıralayalım (pageNumber'a göre sıralama yapılıyor)
    pages.sort((a, b) => {
      const aIsTitle = a.isTitle ? 1 : 0;
      const bIsTitle = b.isTitle ? 1 : 0;
      return aIsTitle - bIsTitle;
    });
    
    // Eğer sayfa sayısı hedeften az çıktıysa, boş sayfalar ekleyerek tamamlıyoruz
    while (pages.length < pageCount) {
      pages.push({
        content: "",
        imagePrompt: "Dekoratif sayfa görseli"
      });
    }
    
    return pages;
  } catch (error) {
    console.error("Hikayeyi sayfalara bölme hatası:", error);
    return fallbackSplitStoryIntoPages(storyText, pageCount);
  }
};

// Hikaye metni oluşturmak için Gemini API'yi kullanır - GÜÇLENDIRILMIŞ
export const generateStoryText = async (prompt: StoryPrompt): Promise<string> => {
  // Denenecek model listesi - yeniden eskiye doğru
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const model of models) {
    try {
      console.log(`${model} modeli deneniyor...`);
      
      // Gemini API anahtarını al
      const apiKey = await getApiKey('gemini');
      
      // Kullanıcının seçtiği sayfa sayısını kullan - +2 formatı
      const totalPageCount = prompt.pageCount || 8; // Varsayılan 6+2=8 sayfa
      const contentPageCount = totalPageCount - 2; // İçerik sayfaları (kapaklar hariç)
      
      console.log(`Gemini API'den talep edilen: ${totalPageCount} toplam sayfa (${contentPageCount} hikaye + 2 kapak)`);
      console.log('Prompt detayları:', {
        title: prompt.title,
        character: prompt.mainCharacter,
        setting: prompt.setting,
        inspiration: prompt.inspiration,
        pageCount: totalPageCount
      });
      
      // Her sayfada olması gereken kelime sayısı - çocuk kitapları için standart
      const wordsPerPage = 50; // Çocuk kitapları için optimal kelime sayısı
      const totalWords = wordsPerPage * contentPageCount;
      
      // ÇOK GÜÇLENDIRILMIŞ Prompt metnini oluştur
      let promptText = `
SEN BİR UZMAN ÇOCUK HİKAYESİ YAZARISIN!

MUTLAK KURAL: KESINLIKLE ${totalPageCount} SAYFA YAZMALISIN - NE FAZLA NE EKSİK!

HİKAYE YAPISI (HER SAYFA MUTLAKA DOLDURULMALI):
1. Sayfa: Kapak sayfası (${prompt.title || 'Başlık'})
2-${totalPageCount - 1}. Sayfalar: Hikaye içeriği (${contentPageCount} sayfa)
${totalPageCount}. Sayfa: Son kapak

HER SAYFA İÇİN FORMAT:
<sayfa 1>
${prompt.title || prompt.inspiration}
Yazar: Hikaye Yazarı
Bu hikayenin kapak sayfasıdır.
<görsel_prompt>Kitap kapağı: ${prompt.inspiration} konulu çocuk kitabı kapağı</görsel_prompt>
</sayfa 1>

<sayfa 2>
[Hikaye başlangıcı - tam ${wordsPerPage} kelime yazın]
[Hikayenin açılışını, karakterlerin tanıtımını yapın]
[Bu sayfa hikayenin başlangıç kısmı olmalı]
<görsel_prompt>Hikaye başlangıcı: [bu sayfanın içeriğine uygun görsel açıklaması]</görsel_prompt>
</sayfa 2>

[DEVAM EDİN... ${contentPageCount} hikaye sayfası yazın]

<sayfa ${totalPageCount}>
Son
Hikayemiz burada sona eriyor. ${prompt.title || 'Bu güzel hikaye'} böylece mutlu sonla bitti.
<görsel_prompt>Son kapak: Hikayenin mutlu sonu</görsel_prompt>
</sayfa ${totalPageCount}>

HİKAYE BİLGİLERİ:
- Kategori: ${prompt.category}
- Ton: ${prompt.tone} 
- Ana Karakter: ${prompt.mainCharacter || 'Çocuk'}
- Mekan: ${prompt.setting || 'Güzel bir yer'}
- Konu: ${prompt.inspiration}
- TOPLAM SAYFA: ${totalPageCount} (Bu çok önemli!)
- Sayfa başına kelime: ${wordsPerPage}
- Toplam kelime hedefi: ${totalWords}

YAZIM KURALLARI:
- Her sayfa MUTLAKA ${wordsPerPage} kelime civarında olsun
- Hikaye akıcı ve çocuklar için anlaşılır olsun
- Her sayfanın sonunda <görsel_prompt> etiketi olsun
- ${totalPageCount} sayfanın tamamını doldurun
- Hiçbir sayfayı boş bırakmayın
- Her sayfa kendi içinde tamamlanmış bir bölüm olsun

ÖNEMLİ: Bu format KESINLIKLE takip edilmeli ve ${totalPageCount} sayfa yazmalısın!
      `;
      
      console.log(`${model} modeli ile API çağrısı yapılıyor...`);
      
      // ENHANCED: Gemini API isteği - daha detaylı hata yakalama
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log('API URL:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));
      
      const requestBody = {
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096, // Daha uzun hikayeler için token sayısını artırdık
          stopSequences: []
        }
      };
      
      console.log('Request body hazırlandı, API çağrısı yapılıyor...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`${model} API yanıt durumu:`, response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${model} API hata detayları:`, errorText);
        
        // 404 hatası ise bir sonraki modeli dene
        if (response.status === 404) {
          console.log(`${model} modeli bulunamadı, bir sonraki model deneniyor...`);
          continue;
        }
        
        throw new Error(`Gemini API hatası: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`${model} API yanıt yapısı:`, {
        candidates: data.candidates ? data.candidates.length : 0,
        hasContent: data.candidates?.[0]?.content ? 'yes' : 'no'
      });
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error(`${model} geçersiz API yanıtı:`, data);
        throw new Error(`${model} geçersiz yanıt döndü`);
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      console.log(`${model} ile oluşturulan metin uzunluğu:`, generatedText.length);
      
      // Sayfa sayısını kontrol et
      const pageMatches = generatedText.match(/<sayfa\s+\d+>/g);
      const actualPageCount = pageMatches ? pageMatches.length : 0;
      
      console.log(`${model} API'den dönen sayfa sayısı: ${actualPageCount}, Beklenen: ${totalPageCount}`);
      
      if (actualPageCount < totalPageCount) {
        console.warn(`UYARI: ${model} beklenen sayfa sayısından az sayfa döndürdü. Eksik sayfalar manuel olarak tamamlanacak.`);
      }
      
      // Eğer metin çok kısa ise bir sonraki modeli dene
      if (generatedText.length < 200) {
        console.log(`${model} çok kısa yanıt döndürdü, bir sonraki model deneniyor...`);
        continue;
      }
      
      console.log(`✅ ${model} modeli ile başarıyla hikaye oluşturuldu!`);
      return generatedText;
      
    } catch (error) {
      console.error(`${model} modeli hatası:`, error);
      
      // Eğer son model de başarısız olursa hatayı fırlat
      if (model === models[models.length - 1]) {
        console.error('Tüm Gemini modelleri başarısız oldu');
        throw error;
      }
      
      // Aksi halde bir sonraki modeli dene
      console.log(`${model} başarısız, bir sonraki model deneniyor...`);
      continue;
    }
  }
  
  // Bu noktaya hiç ulaşmamalı ama güvenlik için
  throw new Error('Hiçbir Gemini modeli çalışmadı');
};

// Geliştirilmiş mock hikaye oluşturma fonksiyonu
const generateEnhancedMockStory = (prompt: StoryPrompt): string => {
  const totalPageCount = prompt.pageCount || 8;
  const contentPageCount = totalPageCount - 2;
  
  const characterName = prompt.mainCharacter || 'Minik Kahraman';
  const setting = prompt.setting || 'büyülü bir dünya';
  const inspiration = prompt.inspiration || 'harika bir macera';
  const title = prompt.title || 'Harika Bir Hikaye';
  
  console.log(`Mock hikaye oluşturuluyor: ${totalPageCount} sayfa, karakter: ${characterName}, mekan: ${setting}`);
  
  let mockStory = `<sayfa 1>
${title}
Yazar: Hikaye Yazarı
${characterName}'nin ${setting} mekanında yaşadığı ${inspiration} hikayesi.
<görsel_prompt>Kitap kapağı: ${title} - ${characterName} karakteri ${setting} mekanında</görsel_prompt>
</sayfa 1>

`;
  
  // Hikaye şablonları
  const storyTemplates = [
    `${characterName}, ${setting} adlı yerde yaşıyordu. Her sabah pencereden baktığında harika manzarayı görürdü. Bu gün diğerlerinden farklı olacaktı. Çünkü ${inspiration} ile ilgili bir şeyler öğrenecekti. Merakla günün başlamasını bekliyordu. Arkadaşları da ona eşlik edecekti.`,
    
    `Bir gün ${characterName} ${setting} mekanında dolaşırken çok ilginç bir şey keşfetti. ${inspiration} hakkında daha fazla bilgi edinmeye karar verdi. Bu macera onu çok heyecanlandırmıştı. Cesaretle ileri doğru adım attı. Yolculuğu şimdi başlıyordu. Her adımda yeni şeyler öğreniyordu.`,
    
    `${characterName}'nin arkadaşları ona bu konuda yardım etmeye karar verdiler. ${setting} mekanının sırlarını birlikte keşfedeceklerdi. ${inspiration} onları bekleyen en büyük sürprizdi. Hep birlikte planlar yapmaya başladılar. Bu iş birliği onları güçlendiriyordu. Dostluk bağları daha da sağlamlaşıyordu.`,
    
    `Yolculukları sırasında ${characterName} ve arkadaşları birçok zorlukla karşılaştılar. Ama birlik olunca her şeyin üstesinden gelebildiler. ${setting} mekanı onlara değerli dersler öğretiyordu. ${inspiration} artık yakın görünüyordu. Cesaretleri hiç eksilmiyordu. Her engeli aşarak ilerliyorlardı.`,
    
    `Sonunda ${characterName} aradığını bulmuştu. ${inspiration} gerçekten de harikalaşmış. ${setting} mekanının tüm güzellikleri karşısında çıkmıştı. Bu macera onu çok değiştirmişti. Artık daha cesur ve bilgiliydi. Arkadaşlarıyla birlikte başardıkları şey muhteşemdi.`,
    
    `${characterName} bu macerada çok şey öğrenmişti. ${setting} mekanının değerini anlamıştı. ${inspiration} sayesinde yeni bakış açıları kazanmıştı. Arkadaşlarının desteği çok önemliydi. Bu deneyim onu büyütmüş ve geliştirmişti. Artık her şeye farklı gözle bakıyordu.`
  ];
  
  // İçerik sayfaları - her sayfa için dinamik içerik
  for (let i = 2; i <= totalPageCount - 1; i++) {
    const pageNumber = i;
    const templateIndex = (i - 2) % storyTemplates.length;
    const pageContent = storyTemplates[templateIndex];
    
    mockStory += `<sayfa ${pageNumber}>
${pageContent}
<görsel_prompt>Sayfa ${pageNumber}: ${characterName} ${setting} mekanında, ${inspiration} ile ilgili macera</görsel_prompt>
</sayfa ${pageNumber}>

`;
  }
  
  // Son kapak
  mockStory += `<sayfa ${totalPageCount}>
Son
${title} böylece mutlu sonla bitti. ${characterName} bu macerada çok şey öğrendi ve büyüdü.
<görsel_prompt>Son kapak: ${characterName}'nin mutlu sonu - ${setting} mekanında başarılı macera</görsel_prompt>
</sayfa ${totalPageCount}>`;
  
  console.log(`Mock hikaye ${totalPageCount} sayfa olarak başarıyla oluşturuldu.`);
  return mockStory;
};

// Hikaye görseli oluşturmak için Mystic API kullanır
export const generateStoryImage = async (prompt: { prompt: string }): Promise<string> => {
  try {
    // Eğer boş prompt geldiyse, varsayılan bir prompt kullan
    if (!prompt.prompt || prompt.prompt.trim() === '') {
      console.log('Boş prompt algılandı, varsayılan kullanılıyor');
      prompt.prompt = 'Colorful storybook illustration for children';
    }
    
    // API isteği için veri hazırla
    const requestData = {
      prompt: prompt.prompt,
      model: "realism", // Gerçekçi model kullanıyoruz
      resolution: "2k",
      aspect_ratio: "square_1_1" // 1:1 oran, kitap sayfası için uygun
    };
    
    console.log(`Mystic API ile görsel oluşturuluyor: "${prompt.prompt.substring(0, 50)}..."`);
    
    try {
      // Proxy server üzerinden istek gönder
      const response = await fetch('http://localhost:3000/api/mystic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        console.error(`Mystic API yanıt hatası: ${response.status}`);
        // Hata durumunda varsayılan görsel döndür
        return "https://dummyimage.com/1080x1350/FF8080/000000&text=API+Yanit+Hatasi";
      }
      
      const responseData = await response.json();
      
      // API yanıt yapısına göre görsel URL'sini al
      if (responseData.data && responseData.data.generated && responseData.data.generated.length > 0) {
        const imageUrl = responseData.data.generated[0];
        console.log(`Mystic API görsel URL'si: ${imageUrl}`);
        return imageUrl;
      } else if (responseData.data && responseData.data.task_id) {
        const taskId = responseData.data.task_id;
        console.log(`Mystic görsel hazırlanıyor, task_id: ${taskId}`);
        
        // Polling için geçici görsel döndür, frontend'de gerçek görsel hazır olunca güncellenir
        const tempImageUrl = `https://dummyimage.com/1080x1350/cccccc/ffffff&text=Gorsel+Olusturuluyor`;
        
        // Arka planda polling başlat ve görsel hazır olunca bildir
        pollTaskStatus(taskId).then(imageUrls => {
          if (imageUrls && imageUrls.length > 0) {
            // Görsel hazır olduğunda event gönder
            const event = new CustomEvent('image-ready', { 
              detail: { 
                taskId, 
                imageUrl: imageUrls[0],
                originalPrompt: prompt.prompt
              } 
            });
            window.dispatchEvent(event);
            console.log(`Task ${taskId} için görsel hazır: ${imageUrls[0]}`);
          }
        }).catch(error => {
          console.error(`Task polling hatası:`, error);
          // Hata durumunda bile bir şey yapmaya çalış
          const event = new CustomEvent('image-ready', { 
            detail: { 
              taskId, 
              imageUrl: "https://dummyimage.com/1080x1350/FF8080/000000&text=Gorsel+Olusturulamadi",
              originalPrompt: prompt.prompt
            } 
          });
          window.dispatchEvent(event);
        });
        
        return tempImageUrl;
      } else {
        // Beklenen API yanıtı alınamadı
        console.error("Mystic API yanıtı beklenen formatta değil:", responseData);
        return "https://dummyimage.com/1080x1350/ff0000/ffffff&text=API+Yaniti+Hatasi";
      }
    } catch (apiError) {
      // API bağlantı hatası
      console.error('Mystic API bağlantı hatası:', apiError);
      return "https://dummyimage.com/1080x1350/FF8080/000000&text=Baglanti+Hatasi";
    }
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    // Hata durumunda gösterilecek varsayılan görsel
    return "https://dummyimage.com/1080x1350/ff0000/ffffff&text=Gorsel+Olusturulamadi";
  }
};

// Task durumu kontrol fonksiyonu
const pollTaskStatus = async (taskId: string, maxAttempts = 12): Promise<string[] | null> => {
  let attempts = 0;
  
  // Polling fonksiyonu
  const checkStatus = (): Promise<string[] | null> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          // Task durumunu kontrol et
          const response = await fetch(`http://localhost:3000/api/mystic/task/${taskId}`);
          
          // Yanıtı JSON olarak çözümle
          const taskData = await response.json();
          console.log(`Task ${taskId} polling yanıtı:`, taskData.status);
          
          // Task başarılıysa ve sonuç varsa döndür
          if (taskData.status === 'COMPLETED' && taskData.result) {
            console.log(`Task ${taskId} tamamlandı, sonuç:`, taskData.result);
            resolve(taskData.result);
            return;
          } 
          
          // Task hata durumundaysa, varsayılan görsel döndür
          if (taskData.status === 'FAILED' || !response.ok) {
            console.log(`Task ${taskId} başarısız oldu veya hata var, varsayılan görsel döndürülüyor`);
            resolve(['https://dummyimage.com/1080x1350/FF8080/000000&text=Hata+Olustu']);
            return;
          }
          
          // Maksimum deneme sayısına ulaşıldıysa
          attempts++;
          if (attempts >= maxAttempts) {
            console.log(`Task ${taskId} için maksimum polling denemesi aşıldı, varsayılan görsel döndürülüyor`);
            resolve(['https://dummyimage.com/1080x1350/FFFF80/000000&text=Zaman+Asimi']);
            return;
          }
          
          // Tekrar kontrol et
          resolve(checkStatus());
        } catch (error) {
          console.error(`Task ${taskId} polling sırasında hata:`, error);
          
          // Hata durumunda belirli bir deneme sayısından sonra varsayılan görsel döndür
          attempts++;
          if (attempts >= Math.min(3, maxAttempts)) {
            console.log(`Task ${taskId} polling hatası, varsayılan görsel döndürülüyor`);
            resolve(['https://dummyimage.com/1080x1350/FF8080/000000&text=Baglanti+Hatasi']);
            return;
          }
          
          // Az sayıda denemede tekrar dene
          resolve(checkStatus());
        }
      }, 3000); // 3 saniye aralıklarla kontrol et (daha sık)
    });
  };
  
  return checkStatus();
};

// Hikayeyi sesli anlatıma dönüştürmek için gTTS veya ElevenLabs'ı kullanır
export const generateStoryAudio = async (storyText: string): Promise<string> => {
  // Burada gerçek bir Text-to-Speech API çağrısı olacak
  // Şimdilik demo amaçlı statik veriler döndürüyoruz
  
  // Simüle edilmiş gecikme
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Örnek ses dosyası URL'si
  return 'https://example.com/sample-audio.mp3';
};

// Tüm hikaye oluşturma sürecini yönetir
export const generateCompleteStory = async (prompt: StoryPrompt): Promise<StoryResponse> => {
  try {
    console.log('Hikaye oluşturma başlatılıyor...', prompt);
    
    // Hikaye metnini oluştur
    const storyText = await generateStoryText(prompt);
    
    if (!storyText) {
      throw new Error('Hikaye metni oluşturulamadı');
    }
    
    // Metni sayfalara böl
    const totalPageCount = prompt.pageCount || 8;
    const pages = splitStoryIntoPages(storyText, totalPageCount);
    
    console.log(`Hikaye başarıyla oluşturuldu: ${pages.length} sayfa`);
    
    // İlk sayfa (kapak) için görsel oluştur
    const coverImagePrompt = `${prompt.inspiration} - çocuk kitabı kapağı, ${prompt.mainCharacter || 'çocuk'} karakteri, ${prompt.setting || 'güzel manzara'} ortamında`;
    
    // Mock görsel URL'si (gerçek API entegrasyonunda değiştirilecek)
    const mockImageUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80&v=${Math.random()}`;
    
    return {
      text: storyText,
      imageUrl: mockImageUrl,
      pages: pages
    };
    
  } catch (error) {
    console.error('Hikaye oluşturma hatası:', error);
    throw error;
  }
};

// Test amaçlı mock hikaye metni
const generateMockStory = (prompt: StoryPrompt): string => {
  const lengthMap = {
    short: 300,
    medium: 600,
    long: 1000
  };
  
  const toneMap = {
    serious: 'ciddi',
    humorous: 'mizahi',
    romantic: 'romantik',
    thriller: 'gerilim dolu'
  };
  
  const characterName = prompt.mainCharacter || 'Kahraman';
  const place = prompt.setting || 'gizemli bir yer';
  const time = prompt.timeline || 'bilinmeyen bir zaman';
  
  return `
# ${prompt.title || prompt.inspiration}

${time} içinde, ${place} adlı yerde, ${characterName} adında biri yaşardı. ${prompt.category} türünde geçen bu ${toneMap[prompt.tone]} hikaye, ${prompt.inspiration} konusu etrafında şekilleniyordu.

${prompt.characterCount} karakter bu hikayede önemli rol oynuyordu. Her birinin kendine has özellikleri ve hikayeleri vardı.

Bir gün, ${characterName} beklenmedik bir durumla karşılaştı. Bu durum onun hayatını tamamen değiştirecekti.

${characterName}, bu durumla başa çıkmak için bir plan yaptı. Cesurca ilerledi ve zorluklarla yüzleşti.

Hikayenin sonunda, ${characterName} önemli bir ders çıkardı ve hayatı boyunca bu dersi unutmadı.

Herkes mutlu mesut yaşadı ve bu hikaye böylece sona erdi.
  `;
};

// Test amaçlı mock sayfa array'i
const generateMockPages = (prompt: StoryPrompt): StoryPage[] => {
  const pageCount = prompt.packageType 
    ? getPageCountByPackage(prompt.packageType, prompt.pageCount)
    : 6;
  
  const mockPages: StoryPage[] = [];
  
  // Kapak sayfası
  mockPages.push({
    content: prompt.title || prompt.inspiration,
    isTitle: true,
    imagePrompt: `Book cover for: ${prompt.inspiration}`
  });
  
  // İçerik sayfaları
  const mockStory = generateMockStory(prompt);
  const paragraphs = mockStory.split('\n\n').filter(p => p.trim());
  
  for (let i = 0; i < pageCount - 1; i++) {
    if (i < paragraphs.length) {
      mockPages.push({
        content: paragraphs[i],
        imagePrompt: `Illustration for: ${paragraphs[i].substring(0, 100)}...`
      });
    } else {
      mockPages.push({
        content: `Bu ${i+1}. sayfanın içeriğidir.`,
        imagePrompt: `Illustration for page ${i+1}`
      });
    }
  }
  
  return mockPages;
};

// Varsayılan export
export default {
  generateStoryText,
  generateStoryImage,
  generateStoryAudio,
  generateCompleteStory,
  getPageCountByPackage,
  splitStoryIntoPages
}; 