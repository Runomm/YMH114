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
      'gemini': 'gemini-api-key', // Gemini API anahtarı
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
  if (requestedCount && requestedCount > 0) {
    // Paket tipine göre maksimum sayfa sayısını kontrol et
    switch(packageType) {
      case PackageType.NORMAL:
        return Math.min(requestedCount, 6); // Normal paket max 6 sayfa
      case PackageType.PREMIUM1:
        return Math.min(requestedCount, 12); // Premium1 paket max 12 sayfa
      case PackageType.PLUS:
        return Math.min(requestedCount, 20); // Plus paket max 20 sayfa
      default:
        return requestedCount; // Diğer durumlarda talep edilen sayıyı kullan
    }
  }
  
  // Eğer özel sayfa sayısı belirtilmediyse, varsayılan değerleri kullan
  switch(packageType) {
    case PackageType.NORMAL:
      return 6;
    case PackageType.PREMIUM1:
      return 8;
    case PackageType.PLUS:
      return 12;
    default:
      return 6; // Bilinmeyen paket tiplerinde varsayılan değer
  }
};

// Hikaye metnini sayfalara böler
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

// Yedek sayfalara bölme fonksiyonu (API düzgün formatta dönmezse)
const fallbackSplitStoryIntoPages = (storyText: string, pageCount: number): StoryPage[] => {
  // İlk önce hikaye metnini paragraflarına ayırıyoruz
  const paragraphs = storyText.split('\n\n').filter(p => p.trim());
  
  // Kapak sayfası ekleyeceğimiz için geriye kalan sayfa sayısını hesaplıyoruz
  const contentPageCount = pageCount - 1;
  
  // Her sayfada olması gereken paragraf sayısını hesaplıyoruz
  // (Hikaye paylaştırma dengeleme algoritması)
  const paragraphsPerPage = Math.max(1, Math.ceil(paragraphs.length / contentPageCount));
  
  // Sayfa array'i oluşturuyoruz
  const pages: StoryPage[] = [];
  
  // Kapak sayfası ekliyoruz
  pages.push({
    content: paragraphs[0] || "Yeni Hikaye",
    isTitle: true,
    imagePrompt: "Book cover illustration"
  });
  
  // İçerik sayfalarını oluşturuyoruz
  for (let i = 0; i < contentPageCount; i++) {
    const startIdx = i * paragraphsPerPage;
    const endIdx = Math.min(startIdx + paragraphsPerPage, paragraphs.length);
    const pageContent = paragraphs.slice(startIdx, endIdx).join('\n\n');
    
    if (pageContent.trim()) {
      pages.push({
        content: pageContent,
        imagePrompt: `Illustration for: ${pageContent.substring(0, 100)}...`
      });
    }
  }
  
  // Eğer sayfa sayısı hedeften az çıktıysa, boş sayfalar ekleyerek tamamlıyoruz
  while (pages.length < pageCount) {
    pages.push({
      content: "",
      imagePrompt: "Decorative illustration for story"
    });
  }
  
  return pages;
};

// Hikaye metni oluşturmak için Gemini API'yi kullanır
export const generateStoryText = async (prompt: StoryPrompt): Promise<string> => {
  try {
    // Gemini API anahtarını al
    const apiKey = await getApiKey('gemini');
    
    // Gemini API için uzunluk ayarları
    const tokenLimits = {
      short: 500,  // ~300 kelime
      medium: 1000, // ~600 kelime
      long: 1600,   // ~1000 kelime
    };
    
    // Paket tipine göre sayfa sayısını hesapla - kullanıcının seçtiği değere öncelik ver
    const pageCount = prompt.pageCount || 
                      (prompt.packageType 
                       ? getPageCountByPackage(prompt.packageType, prompt.pageCount)
                       : 6);
    
    console.log(`Hikaye ${pageCount} sayfa olarak oluşturuluyor.`);
    
    // Gemini API için dil tercihi
    const language = 'tr'; // Türkçe
    
    // Her sayfada olması gereken kelime ve karakter sayısı
    const wordsPerPage = 70; // Her sayfada yaklaşık 70 kelime (çocuk kitabı formatında)
    const totalWords = wordsPerPage * (pageCount - 1); // Kapak sayfası hariç
    
    // Kitap boyutları ve formatı (çocuk kitabı standartları)
    const bookFormat = {
      width: "20cm", // 20cm genişlik (standart)
      height: "20cm", // 20cm yükseklik (kare format)
      pages: pageCount, // Kullanıcının seçtiği sayfa sayısı
      wordsPerPage: wordsPerPage,
      totalWords: totalWords,
      fontSizeRange: "14pt-16pt", // Çocuk kitapları için uygun font büyüklüğü
      paragraphStyle: "kısa paragraflar, çocuk seviyesine uygun cümleler",
    };
    
    // Prompt metnini oluştur
    let promptText = `Bir ${prompt.category.toLowerCase()} çocuk hikaye kitabı yaz. `;
    promptText += `Hikaye tonu ${prompt.tone} olmalı. `;
    promptText += `${prompt.characterCount} karakter içermeli. `;
    promptText += `Hikaye kitabı tam olarak ${pageCount} sayfadan oluşmalı ve her sayfa yaklaşık ${wordsPerPage} kelime içermeli. `;
    promptText += `Toplam kelime sayısı yaklaşık ${totalWords} olmalı. `;
    promptText += `Hikaye kitabı TAM OLARAK ${pageCount} sayfa olmalı - ne daha az ne daha fazla! `;
    promptText += `Her sayfayı <sayfa> ve </sayfa> etiketleri içinde numaralandırarak ver. Birinci sayfa kapak sayfası olacak. `;
    promptText += `Kitap boyutları: ${bookFormat.width} x ${bookFormat.height}, kare formatta. `;
    
    // Kullanıcı tarafından sağlanan bilgileri ekle
    if (prompt.mainCharacter) {
      promptText += `Ana karakter: ${prompt.mainCharacter}. `;
    }
    
    if (prompt.setting) {
      promptText += `Hikaye mekanı: ${prompt.setting}. `;
    }
    
    if (prompt.title) {
      promptText += `Hikaye başlığı: ${prompt.title}. `;
    }
    
    // İlham/fikri ekle
    promptText += `Hikaye fikri/konusu: ${prompt.inspiration}. `;
    
    // Görsel açıklamaları için talimatlar ekle
    promptText += `Her sayfa için bir görsel de açıkla. Görsel açıklamasını <görsel_prompt></görsel_prompt> etiketleri arasında ver. Görsel açıklamaları detaylı ve hikayeyle uyumlu olmalı.`;
    
    console.log(`Hikaye promptu hazırlandı: ${promptText}`);
    
    // Şimdilik API entegrasyonu tam olarak aktif edilmediği için mock hikaye döndürüyoruz
    // Gerçek entegrasyonda burada Gemini API'yi çağıracağız
    return generateMockStory(prompt);
    
  } catch (error) {
    console.error('Hikaye metni oluşturma sırasında hata:', error);
    throw new Error('Hikaye metni oluşturulamadı. Lütfen daha sonra tekrar deneyin.');
  }
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
    // Hikaye metnini oluştur
    const storyText = await generateStoryText(prompt);
    
    // Paket tipine göre sayfa sayısını hesapla
    const pageCount = prompt.packageType 
      ? getPageCountByPackage(prompt.packageType, prompt.pageCount)
      : 6;
    
    // Hikayeyi sayfalara böl
    const storyPages = splitStoryIntoPages(storyText, pageCount);
    
    // Kitap kapağı için görsel oluştur
    let coverImageUrl = '';
    try {
      const coverPrompt = storyPages[0]?.isTitle 
        ? `Book cover for a ${prompt.category} story titled: ${storyPages[0].content}`
        : `Book cover for a ${prompt.category} story about ${prompt.inspiration}`;
        
      coverImageUrl = await generateStoryImage({ prompt: coverPrompt });
    } catch (imageError) {
      console.error('Kapak görseli oluşturma hatası:', imageError);
    }
    
    return {
      text: storyText,
      imageUrl: coverImageUrl,
      pages: storyPages
    };
  } catch (error) {
    console.error('Hikaye oluşturma hatası:', error);
    
    // Hata durumunda basit bir mock yanıt döndür
    const mockPages = generateMockPages(prompt);
    
    return {
      text: generateMockStory(prompt),
      imageUrl: 'https://images.unsplash.com/photo-1516515429572-bf32372f2409?w=800&h=600&fit=crop',
      pages: mockPages
    };
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
