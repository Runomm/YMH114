import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCompleteStory, generateStoryAudio, StoryPrompt, StoryResponse, generateStoryImage, PackageType as AIServicePackageType, getPageCountByPackage } from '../lib/aiService';
import { useAuth } from '../lib/authContext';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import BookCover from '../components/BookCover';
import BookEditor from '../components/BookEditor';
import { createAIStory, ExtendedStoryPrompt } from '../lib/storyService';
import { toast } from 'react-hot-toast';
import BookPage from '../components/BookPage';
import TemplateType from '../lib/templateType';
import StyleThemeCard from '../components/StyleThemeCard';
import CoverStyleCard from '../components/CoverStyleCard';
import PageLayoutCard from '../components/PageLayoutCard';

// Kullanıcı tipi için enum
enum UserExperienceType {
  PROFESSIONAL = 'professional',  // Profesyonelim, kendim yazarım
  GUIDED = 'guided',              // Yönlendirme isterim, birlikte yazalım
  NOVICE = 'novice'               // Sıfırdan yardım et, sadece fikrim var
}

// Hikaye kategorileri
enum StoryCategory {
  ADVENTURE = 'Macera',
  ROMANCE = 'Romantizm',
  SCIFI = 'Bilim Kurgu',
  THRILLER = 'Gerilim',
  FANTASY = 'Fantastik',
  HISTORY = 'Tarih'
}

// Hikaye tonu
enum StoryTone {
  SERIOUS = 'serious',
  HUMOROUS = 'humorous',
  ROMANTIC = 'romantic',
  THRILLER = 'thriller'
}

// Hikaye oluşturma aşamaları
enum StoryCreationStep {
  USER_TYPE_SELECTION = 'userTypeSelection',  // Kullanıcı tipi seçimi
  IDEA_CREATION = 'ideaCreation',            // Hikaye fikri oluşturma
  STORY_WRITING = 'storyWriting',            // Hikaye yazımı
  IMAGE_CREATION = 'imageCreation',          // Görsel oluşturma
  STYLE_SELECTION = 'styleSelection',        // Stil seçimi
  PREVIEW_PUBLISH = 'previewPublish'         // Önizleme ve yayınlama
}

// Stil temaları
enum ThemeStyle {
  CHILDREN = 'children',   // Çocuk masalı
  MODERN = 'modern',       // Modern, temiz düzen
  FANTASY = 'fantasy',     // Fantastik, renkli
  ADVENTURE = 'adventure'  // Macera teması
}

// Paket tipi için enum
enum PackageType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  PREMIUM = 'premium',
  NORMAL = 'normal'
}

// Hikaye verisi tipi
interface StoryData {
  id: string;
  title: string;
  category: StoryCategory;
  userType: UserExperienceType;
  tone: StoryTone;
  mainCharacter: string;
  setting: string;
  problem: string;
  storyIdea: string;
  content: string;
  pages: StoryPage[];
  style: ThemeStyle;
  coverImage?: string;
  audioEnabled: boolean;
  published: boolean;
  authorName: string;
  packageType: AIServicePackageType; // aiService'den gelen enum'ı kullanıyoruz
  pageCount: number; // İstenen sayfa sayısı
  imageStyle?: string;
  colorTone?: string;
  detailLevel?: number;
  // Yeni eklenenler
  coverStyle?: 'light' | 'dark' | 'colorful' | 'minimal';
  pageLayout?: TemplateType;
  voiceType?: string;
  voiceSpeed?: number;
}

// Hikaye sayfası tipi
interface StoryPage {
  id: string;
  pageNumber: number;
  content: string;
  image?: string;
  imagePrompt?: string;
  title?: string;
  isTitle?: boolean;
  imageStyle?: string;
  colorTone?: string;
  detailLevel?: number;
}

// Başlangıç hikaye verisi
const initialStoryData: StoryData = {
  id: uuidv4(),
  title: '',
  category: StoryCategory.ADVENTURE,
  userType: UserExperienceType.GUIDED,
  tone: StoryTone.SERIOUS,
  mainCharacter: '',
  setting: '',
  problem: '', // Bu alanı tamamen kaldırmak yerine boş bırakıyoruz
  storyIdea: '',
  content: '',
  pages: [],
  style: ThemeStyle.CHILDREN,
  audioEnabled: false,
  published: false,
  authorName: '',
  packageType: AIServicePackageType.NORMAL, // Varsayılan olarak normal paket
  pageCount: 6 // Varsayılan olarak 6 sayfa
};

// FullBookPreview için basit komponent
const SimpleFullBookPreview: React.FC<{pages: any[], title: string, authorName: string, coverImage?: string}> = ({
  pages,
  title,
  authorName,
  coverImage
}) => {
  return (
    <button 
      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded text-xs flex items-center text-gray-700 dark:text-gray-300"
      onClick={() => {
        alert('Tam ekran önizleme henüz geliştirme aşamasındadır.');
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      Tam Ekran Önizleme
    </button>
  );
};

const CreateStoryPage: React.FC = () => {
  const { user } = useAuth();
  const [storyData, setStoryData] = useState<StoryData>(initialStoryData);
  const [currentStep, setCurrentStep] = useState<StoryCreationStep>(StoryCreationStep.USER_TYPE_SELECTION);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentImagePageIndex, setCurrentImagePageIndex] = useState<number>(-1);
  const [notificationMessage, setNotificationMessage] = useState<{text: string, type: 'info' | 'success' | 'error' | 'warning'} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [currentPreviewPageIndex, setCurrentPreviewPageIndex] = useState(0); // Kitap önizleme için sayfa indeksi
  const [taskIdMap, setTaskIdMap] = useState<Map<string, number>>(new Map()); // Task ID'leri sayfa indekslerine eşleştir

  // Hikaye için ses oluştur
  const generateAudio = async (text: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      showNotification('Ses dosyası oluşturuluyor...', 'info');
      
      // Gerçek API çağrısı burada yapılacak
      // const audioUrl = await generateStoryAudio(text);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Ses dosyası başarıyla oluşturuldu', 'success');
      return true;
    } catch (error) {
      console.error('Ses oluşturma hatası:', error);
      showNotification('Ses dosyası oluşturulurken bir hata oluştu', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hikayeyi taslak olarak kaydet
  const saveStoryAsDraft = async () => {
    if (!user) {
      toast.error('Hikaye kaydetmek için giriş yapmalısınız');
      return;
    }
    
    if (!storyData.title) {
      showNotification('Lütfen hikayenize bir başlık verin', 'warning');
      return;
    }
    
    setIsLoading(true);
    showNotification('Hikaye taslak olarak kaydediliyor...', 'info');
    
    try {
      // Supabase'e taslak olarak kaydet
      const { data, error } = await supabase
        .from('stories')
        .insert({
          id: storyData.id,
          title: storyData.title || 'İsimsiz Hikaye',
          content: storyData.content,
          category_id: storyData.category,
          user_id: user.id,
          cover_image: storyData.coverImage,
          status: 'draft',
          style: storyData.style
        });
        
      if (error) throw error;
      
      showNotification('Hikayeniz taslak olarak kaydedildi', 'success');
    } catch (error) {
      console.error('Hikaye taslak kaydetme hatası:', error);
      showNotification('Hikaye kaydedilirken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Kullanıcı adını başlangıçta ayarla
  useEffect(() => {
    if (user) {
      setStoryData(prev => ({
        ...prev,
        authorName: user.user_metadata?.full_name || user.email || 'Yazar'
      }));
    }
  }, [user]);

  // Sayfa yüklendiğinde başlangıç verilerini hazırla
  useEffect(() => {
    if (user) {
      setIsPageLoading(true);
      setNotificationMessage({
        text: 'Hikaye oluşturma sayfası hazırlanıyor...',
        type: 'info'
      });
      
      // Kullanıcı verileri hazırlanıyor
      setTimeout(() => {
        setIsPageLoading(false);
        setNotificationMessage({
          text: 'Hikaye oluşturmaya başlayabilirsiniz!',
          type: 'success'
        });
        
        // 3 saniye sonra bildirimi kapat
        setTimeout(() => {
          setNotificationMessage(null);
        }, 3000);
      }, 1000);
    }
  }, [user]);

  // Sayfa yüklendiğinde görsel hazır olma event listener'ını ekle
  useEffect(() => {
    // Görsel hazır olduğunda bu fonksiyon çağrılır
    const handleImageReady = (event: any) => {
      const { taskId, imageUrl, originalPrompt } = event.detail;
      
      console.log('Görsel hazır:', taskId, imageUrl);
      
      // Bu task ID'si hangi sayfaya aitti?
      const pageIndex = taskIdMap.get(taskId);
      if (pageIndex !== undefined) {
        // Sayfanın görselini güncelle
        const updatedPages = [...storyData.pages];
        
        if (updatedPages[pageIndex]) {
          updatedPages[pageIndex] = {
            ...updatedPages[pageIndex],
            image: imageUrl
          };
          
          setStoryData(prev => ({ 
            ...prev, 
            pages: updatedPages,
            coverImage: pageIndex === 0 ? imageUrl : prev.coverImage
          }));
          
          showNotification(`Sayfa ${pageIndex + 1} için görsel otomatik güncellendi`, 'success');
        }
      }
    };
    
    // Event listener'ı ekle
    window.addEventListener('image-ready', handleImageReady);
    
    // Cleanup fonksiyonu
    return () => {
      window.removeEventListener('image-ready', handleImageReady);
    };
  }, [storyData.pages, taskIdMap]);

  // Adım ilerletme fonksiyonu
  const goToNextStep = () => {
    // Adım geçişleri kullanıcı tipine göre belirlenir
    switch (currentStep) {
      case StoryCreationStep.USER_TYPE_SELECTION:
        setCurrentStep(StoryCreationStep.IDEA_CREATION);
        break;
      case StoryCreationStep.IDEA_CREATION:
        // Fikir kısmından sonraki adıma geçiş
        setCurrentStep(StoryCreationStep.STORY_WRITING);
        break;
      case StoryCreationStep.STORY_WRITING:
        organizeIntoPages();
        setCurrentStep(StoryCreationStep.IMAGE_CREATION);
        break;
      case StoryCreationStep.IMAGE_CREATION:
        setCurrentStep(StoryCreationStep.STYLE_SELECTION);
        break;
      case StoryCreationStep.STYLE_SELECTION:
        setCurrentStep(StoryCreationStep.PREVIEW_PUBLISH);
        break;
      default:
        break;
    }
  };

  // Önceki adıma gitme fonksiyonu
  const goToPreviousStep = () => {
    switch (currentStep) {
      case StoryCreationStep.IDEA_CREATION:
        setCurrentStep(StoryCreationStep.USER_TYPE_SELECTION);
        break;
      case StoryCreationStep.STORY_WRITING:
        setCurrentStep(StoryCreationStep.IDEA_CREATION);
        break;
      case StoryCreationStep.IMAGE_CREATION:
        setCurrentStep(StoryCreationStep.STORY_WRITING);
        break;
      case StoryCreationStep.STYLE_SELECTION:
        setCurrentStep(StoryCreationStep.IMAGE_CREATION);
        break;
      case StoryCreationStep.PREVIEW_PUBLISH:
        setCurrentStep(StoryCreationStep.STYLE_SELECTION);
        break;
      default:
        break;
    }
  };

  // Kullanıcı tipini ayarla
  const setUserType = (type: UserExperienceType) => {
    setStoryData(prev => ({ ...prev, userType: type }));
    goToNextStep(); // Kullanıcı tipi seçildiğinde otomatik olarak bir sonraki adıma geç
  };

  // Hikaye fikrini AI ile genişlet
  const generateStoryFromIdea = async () => {
    if (!storyData.title || !storyData.mainCharacter || !storyData.setting || !storyData.storyIdea) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    setIsGenerating(true);
    setCurrentImagePageIndex(-1);
    
    try {
      // Kullanıcının seçtiği sayfa sayısını kullan
      const pageCount = storyData.pageCount || 6;
      
      // Hikaye prompt'unu hazırla
      const storyPrompt: StoryPrompt = {
        category: storyData.category,
        tone: storyData.tone,
        length: 'long', // Kısa yerine uzun hikaye oluşturmak için "long" olarak değiştirildi
        characterCount: 3, // Varsayılan karakter sayısı
        inspiration: storyData.storyIdea,
        mainCharacter: storyData.mainCharacter,
        setting: storyData.setting,
        title: storyData.title, // Kullanıcının girdiği başlığı kullan
        packageType: storyData.packageType,
        pageCount: pageCount, // Kullanıcının seçtiği sayfa sayısını API'ye gönder
      };
      
      console.log("Hikaye oluşturma prompt'u:", storyPrompt);
      
      // AI servisi ile hikaye oluştur
      // TypeScript hatasını önlemek için storyPrompt'u doğrudan kullanıyoruz
      // ve formatInstructions değişkenini ayrıca geçiriyoruz
      const formatInstructions = `Lütfen her sayfa için detaylı ve akıcı bir hikaye oluşturun. 
      Toplam ${pageCount} sayfa olacak şekilde, her sayfada 3-4 paragraf olmalı. 
      Hikaye mantıklı bir akış içerisinde ve çocuklar için anlaşılır olmalı.`;
      
      // API'ye açıklama ekleyerek daha uzun içerik oluşturması sağlanıyor
      const response = await generateCompleteStory(storyPrompt);
      
      // Hikaye içeriğini ve sayfaları ayarla
      setStoryData(prev => {
        // AI servisinden gelen sayfa tipini dönüştürerek StoryPage tipimize uygun hale getiriyoruz
        const convertedPages = response.pages?.map(page => ({
          id: uuidv4(), // Her sayfa için benzersiz id
          pageNumber: page.isTitle ? 1 : prev.pages.length + 1, // Sayfa numarası
          content: page.content,
          image: page.image,
          imagePrompt: page.imagePrompt,
          isTitle: page.isTitle
        })) || [];
        
        return {
          ...prev,
          content: response.text,
          pages: convertedPages,
          coverImage: response.imageUrl || prev.coverImage
        };
      });
      
      toast.success('Hikayeniz başarıyla oluşturuldu!');
      
    } catch (error) {
      console.error('Hikaye oluşturma hatası:', error);
      toast.error('Hikaye oluşturulurken bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Hikaye metnini sayfalara böl
  const organizeIntoPages = () => {
    // Hikaye içeriği var mı kontrol et
    const content = storyData.content || generatedText;
    if (!content) {
      toast.error('Hikaye içeriği boş olamaz');
      return;
    }
    
    // Paket tipine göre sayfa sayısını belirle
    const pageCount = getPageCountByPackage(storyData.packageType, storyData.pageCount);
    
    // Hikayeyi bölmeden önce sayfa başına düşecek kelime sayısını hesapla
    // Standart kitap formatında her sayfada yaklaşık 60-70 kelime olmalı (çocuk kitabı formatı)
    const wordsPerPage = 65;
    
    // Paragrafları ve cümleleri bul
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    // Tüm paragrafları birleştirip cümlelere ayır
    const allText = paragraphs.join(' ');
    const sentences = allText.split(/(?<=[.!?])\s+/).filter(s => s.trim());
    
    // Sayfa sayısına göre içeriği dengeli bir şekilde dağıt
    const contentPages = [];
    // Kapak sayfası hariç sayfa sayısı
    const contentPageCount = pageCount - 1;
    
    // Her sayfaya düşecek cümle sayısını hesapla
    const sentencesPerPage = Math.max(1, Math.ceil(sentences.length / contentPageCount));
    
    // Sayfaları oluştur
    for (let i = 0; i < contentPageCount; i++) {
      const startIdx = i * sentencesPerPage;
      const endIdx = Math.min(startIdx + sentencesPerPage, sentences.length);
      
      if (startIdx < sentences.length) {
        const pageContent = sentences.slice(startIdx, endIdx).join(' ');
        contentPages.push(pageContent);
      }
    }
    
    // Sayfa Nesneleri oluştur
    const pages: StoryPage[] = [];
    
    // Kapak sayfası ekle
    pages.push({
      id: uuidv4(),
      pageNumber: 1,
      title: storyData.title || 'Yeni Hikaye',
      content: `${storyData.title || 'Yeni Hikaye'}\nYazar: ${storyData.authorName}`,
      isTitle: true
    });
    
    // İçerik sayfalarını ekle
    contentPages.forEach((content, idx) => {
      pages.push({
        id: uuidv4(),
        pageNumber: idx + 2, // Kapak sayfası 1, içerik sayfaları 2'den başlar
        content: content,
        title: `Sayfa ${idx + 2}`
      });
    });
    
    // Eğer hedeflenen sayfa sayısına ulaşılmadıysa, boş sayfalar ekle
    while (pages.length < pageCount) {
      pages.push({
        id: uuidv4(),
        pageNumber: pages.length + 1,
        content: "",
        title: `Sayfa ${pages.length + 1}`
      });
    }
    
    setStoryData(prev => ({ ...prev, pages }));
    console.log(`Hikaye ${pages.length} sayfaya bölündü. Her sayfada yaklaşık ${wordsPerPage} kelime var.`);
  };

  // Sayfa için görsel oluştur - Mystic API kullanarak
  const generateImageForPage = async (pageIndex: number) => {
    if (pageIndex < 0 || pageIndex >= storyData.pages.length) {
      toast.error('Geçersiz sayfa indeksi');
      return;
    }
    
    const page = storyData.pages[pageIndex];
    
    // Yükleme durumunu güncelleyip bildirim göster
    setIsLoading(true);
    setCurrentImagePageIndex(pageIndex);
    showNotification('Görsel oluşturuluyor...', 'info');
    
    try {
      // İlk sayfa ise kapak görseli olarak işaretle
      const isFirstPage = pageIndex === 0;
      
      // Görsel oluşturma prompt'u hazırla
      const imagePromptText = isFirstPage 
        ? `Kitap kapağı: ${storyData.title}` 
        : page.content.substring(0, 200);
        
      // Mystic API için görsel oluşturma fonksiyonu
      const generateMysticImage = async (prompt: string): Promise<string> => {
        // Proxy URL
        const url = 'http://localhost:3000/api/mystic';
        
        // API isteği için veri
        const data = {
          prompt: prompt,
          model: "realism", // Gerçekçi model kullanıyoruz
          resolution: "2k",
          aspect_ratio: "square_1_1" // 1:1 oran, kitap sayfası için uygun
        };
        
        try {
          // API isteği gönder
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (!response.ok) {
            throw new Error(`API yanıt hatası: ${response.status}`);
          }
          
          const responseData = await response.json();
          
          // API yanıt yapısına göre görsel URL'sini al
          if (responseData.data && responseData.data.generated && responseData.data.generated.length > 0) {
            return responseData.data.generated[0]; // İlk üretilen görselin URL'si
          } else if (responseData.data && responseData.data.task_id) {
            // Task ID'yi kaydet - polling için
            const taskId = responseData.data.task_id;
            console.log(`Sayfa ${pageIndex} için task_id:`, taskId);
            
            // TaskID'yi sayfayla eşleştir
            setTaskIdMap(prev => {
              const newMap = new Map(prev);
              newMap.set(taskId, pageIndex);
              return newMap;
            });
            
            // Geçici görsel döndür - asenkron olarak gerçek görsel geldiğinde güncellenecek
            return "https://dummyimage.com/500x500/cccccc/ffffff&text=Gorsel+Olusturuluyor";
          } else {
            // Task_id alınırsa, görsel hazır olduğunda almak için polling yapılabilir
            console.log("Mystic görsel hazırlanıyor, task_id:", responseData.data?.task_id);
            return "https://dummyimage.com/500x500/cccccc/ffffff&text=Gorsel+Olusturuluyor";
          }
        } catch (error) {
          console.error('Mystic API hatası:', error);
          return "https://dummyimage.com/500x500/ff0000/ffffff&text=API+Hatasi";
        }
      };
      
      // Mystic API ile görsel oluştur
      const imageUrl = await generateMysticImage(imagePromptText);
      
      // Sayfayı güncelle
      const updatedPages = [...storyData.pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        image: imageUrl,
        imagePrompt: imagePromptText
      };
      
      setStoryData(prev => ({ 
        ...prev, 
        pages: updatedPages,
        coverImage: isFirstPage ? imageUrl : prev.coverImage
      }));
      
      // Başarı bildirimi göster
      showNotification(`Sayfa ${pageIndex + 1} için görsel başarıyla oluşturuldu`, 'success');
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      showNotification('Görsel oluşturulurken bir hata oluştu.', 'error');
    } finally {
      setIsLoading(false);
      setCurrentImagePageIndex(-1);
    }
  };

  // Hikaye stilini ayarla
  const setStoryStyle = (style: ThemeStyle) => {
    setStoryData(prev => ({ ...prev, style }));
  };

  // Render step indicator fonksiyonunu burada tanımlıyoruz
  const renderStepIndicator = () => {
    const steps = [
      { id: StoryCreationStep.USER_TYPE_SELECTION, label: 'Kullanıcı Tipi' },
      { id: StoryCreationStep.IDEA_CREATION, label: 'Hikaye Fikri' },
      { id: StoryCreationStep.STORY_WRITING, label: 'Hikaye Yazımı' },
      { id: StoryCreationStep.IMAGE_CREATION, label: 'Görseller' },
      { id: StoryCreationStep.STYLE_SELECTION, label: 'Stil ve Düzen' },
      { id: StoryCreationStep.PREVIEW_PUBLISH, label: 'Önizleme ve Yayınlama' }
    ];
    
    // Adım indeksi hesapla
    const currentStepIndex = steps.findIndex(step => step.id === currentStep);
    
    return (
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between relative mb-4">
          {steps.map((step, index) => {
            // Adım durumları
            const isActive = currentStep === step.id;
            const isCompleted = index < currentStepIndex;
            const isDisabled = index > currentStepIndex;
            
            return (
              <div 
                key={step.id} 
                className={`flex flex-col items-center ${isDisabled ? 'opacity-50' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive ? 'bg-blue-500 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.label}</span>
              </div>
            );
          })}
          
          {/* İlerleme çizgisi */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-[-1]"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-[-1] transition-all"
            style={{ 
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Hikayeyi kaydet ve yayınla
  const publishStory = async () => {
    if (!user) {
      toast.error('Hikaye yayınlamak için giriş yapmalısınız');
      return;
    }
    
    if (!storyData.title) {
      toast.error('Hikayenize bir başlık vermelisiniz');
      return;
    }
    
    setIsLoading(true);
    try {
      // Hikayeyi veritabanına kaydet
      const { data, error } = await supabase
        .from('stories')
        .insert({
          id: storyData.id,
          title: storyData.title,
          content: storyData.content,
          category_id: storyData.category,
          user_id: user.id,
          cover_image: storyData.coverImage,
          status: 'published',
          audio_enabled: storyData.audioEnabled,
          style: storyData.style,
          read_time: Math.ceil(storyData.content.length / 1000) // Tahmini okuma süresi
        })
        .select();
        
      if (error) throw error;
      
      // Sayfaları kaydet
      const storyPages = storyData.pages.map(page => ({
        story_id: storyData.id,
        page_number: page.pageNumber,
        content: page.content,
        image_url: page.image,
        title: page.title
      }));
      
      const { error: pagesError } = await supabase
        .from('story_pages')
        .insert(storyPages);
        
      if (pagesError) throw pagesError;
      
      toast.success('Hikayeniz başarıyla yayınlandı!');
      setStoryData(prev => ({ ...prev, published: true }));
      
      // İsteğe bağlı: Başarılı yayınlamadan sonra ana sayfaya yönlendir
      // window.location.href = '/';
    } catch (error) {
      console.error('Hikaye yayınlama hatası:', error);
      toast.error('Hikaye yayınlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Input değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoryData(prev => ({ ...prev, [name]: value }));
  };

  // TextBox otomatik ilerleme sorununu düzelten fonksiyon
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Enter tuşuna basıldığında ilerleme yapılmasını engelliyoruz
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Sayfa içeriğini güncelle
  const updatePageContent = (pageIndex: number, content: string) => {
    const updatedPages = [...storyData.pages];
    if (updatedPages[pageIndex]) {
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        content
      };
      setStoryData(prev => ({ ...prev, pages: updatedPages }));
    }
  };

  // Geçerli adım için içerik oluştur
  const renderStepContent = () => {
    switch (currentStep) {
      case StoryCreationStep.USER_TYPE_SELECTION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-3xl font-bold text-center mb-8">
              Ne kadar yardıma ihtiyacın var?
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-md cursor-pointer"
                onClick={() => setUserType(UserExperienceType.PROFESSIONAL)}
              >
                <div className="text-4xl mb-4 text-center">🧙‍♂️</div>
                <h3 className="text-xl font-bold text-center mb-2">Profesyonelim</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Kendim yazarım
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl shadow-md cursor-pointer"
                onClick={() => setUserType(UserExperienceType.GUIDED)}
              >
                <div className="text-4xl mb-4 text-center">🧑‍💻</div>
                <h3 className="text-xl font-bold text-center mb-2">Yönlendirme İsterim</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Birlikte yazalım
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl shadow-md cursor-pointer"
                onClick={() => setUserType(UserExperienceType.NOVICE)}
              >
                <div className="text-4xl mb-4 text-center">🧸</div>
                <h3 className="text-xl font-bold text-center mb-2">Sıfırdan Yardım</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Sadece fikrim var
                </p>
              </motion.div>
            </div>
          </motion.div>
        );
        
      case StoryCreationStep.IDEA_CREATION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="flex flex-col lg:flex-row gap-8 relative">
              {/* Sol taraf - Ana içerik */}
              <div className="lg:w-2/3 space-y-6">
                {/* Maskot ve konuşma balonu */}
                {!storyData.title || !storyData.mainCharacter || !storyData.setting ? (
                  <div className="flex items-center">
                    <div className="rounded-full bg-purple-100 dark:bg-purple-800/30 w-12 h-12 flex items-center justify-center mr-3">
                      <span className="text-2xl">K.O.</span>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl">
                      <p className="text-gray-700 dark:text-gray-300">
                        {!storyData.title ? "Merhaba! Harika bir hikaye yazalım. Öncelikle hikayemize bir başlık verelim!" : 
                        !storyData.mainCharacter ? `"${storyData.title}" harika bir başlık! Peki hikayemizin kahramanı kim olacak?` :
                        !storyData.setting ? `${storyData.mainCharacter} çok güzel bir karakter! Peki hikayemiz nerede geçecek?` : ""}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Hikaye başlığı alanı */}
                {!storyData.title ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">Hikaye Başlığı</h2>
                    <div className="relative">
                      <input
                        type="text"
                        value={storyData.title}
                        onChange={(e) => {
                          // Yalnızca değer güncellenir, otomatik ilerleme olmaz
                          setStoryData(prev => ({ ...prev, title: e.target.value }));
                        }}
                        onKeyDown={handleKeyDown} // Enter tuşuna basıldığında ilerleme engellenir
                        placeholder="Örn: Ayşe'nin Orman Macerası"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={() => {
                          // Hikaye başlığı için 3 öneri göster
                          const öneriler = [
                            "Gizemli Kale'nin Sırrı",
                            "Uzay Macerası",
                            "Ormandaki Büyülü Kapı"
                          ];
                          
                          // Önerileri gösterme işlevi burada olacak
                          // Örneğin bir modal açabilir veya doğrudan bir öneri seçebilir
                          setStoryData(prev => ({ ...prev, title: öneriler[Math.floor(Math.random() * öneriler.length)] }));
                          showNotification('Hikaye başlığı önerisi eklendi!', 'success');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-700/40"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : !storyData.mainCharacter ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">Ana Karakter</h2>
                    
                    {/* Karakter kartları */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div 
                        className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, mainCharacter: "Cesur çocuk" }))}
                      >
                        <span className="text-center text-sm font-medium">Cesur çocuk</span>
                      </div>
                      <div 
                        className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, mainCharacter: "Akıllı kız" }))}
                      >
                        <span className="text-center text-sm font-medium">Akıllı kız</span>
                      </div>
                      <div 
                        className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, mainCharacter: "Robot" }))}
                      >
                        <span className="text-center text-sm font-medium">Robot</span>
                      </div>
                      <div 
                        className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, mainCharacter: "Uzaylı" }))}
                      >
                        <span className="text-center text-sm font-medium">Uzaylı</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={storyData.mainCharacter}
                        onChange={(e) => {
                          // Yalnızca değer güncellenir, otomatik ilerleme olmaz
                          setStoryData(prev => ({ ...prev, mainCharacter: e.target.value }));
                        }}
                        onKeyDown={handleKeyDown} // Enter tuşuna basıldığında ilerleme engellenir
                        placeholder="Veya kendi karakter fikrini yaz..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : !storyData.setting ? (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">Hikaye Nerede Geçiyor?</h2>
                    
                    {/* Mekan kartları */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div 
                        className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, setting: "Orman" }))}
                      >
                        <span className="text-center text-sm font-medium">Orman</span>
                      </div>
                      <div 
                        className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, setting: "Okyanus" }))}
                      >
                        <span className="text-center text-sm font-medium">Okyanus</span>
                      </div>
                      <div 
                        className="bg-gray-50 dark:bg-gray-600/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, setting: "Kale" }))}
                      >
                        <span className="text-center text-sm font-medium">Kale</span>
                      </div>
                      <div 
                        className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-colors"
                        onClick={() => setStoryData(prev => ({ ...prev, setting: "Uzay" }))}
                      >
                        <span className="text-center text-sm font-medium">Uzay</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={storyData.setting}
                        onChange={(e) => {
                          // Yalnızca değer güncellenir, otomatik ilerleme olmaz
                          setStoryData(prev => ({ ...prev, setting: e.target.value }));
                        }}
                        onKeyDown={handleKeyDown} // Enter tuşuna basıldığında ilerleme engellenir
                        placeholder="Veya kendi mekan fikrini yaz..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-gray-200">Hikaye Taslağı</h2>
                    <textarea
                      value={storyData.storyIdea}
                      onChange={(e) => setStoryData(prev => ({ ...prev, storyIdea: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white min-h-[120px]"
                      placeholder={`${storyData.mainCharacter} karakterimiz ${storyData.setting} mekanında bir maceraya atılıyor... Ne tür bir hikaye anlatmak istersiniz?`}
                    />

                    {/* Sayfa Sayısı seçimi */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Sayfa Sayısı</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {[6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((count) => (
                          <button
                            key={count}
                            onClick={() => setStoryData(prev => ({ ...prev, pageCount: count }))}
                            className={`px-3 py-2 rounded-lg border ${
                              storyData.pageCount === count 
                                ? 'bg-blue-500 text-white border-blue-600' 
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                          >
                            {count}+1
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Seçilen sayfa: {storyData.pageCount}+1 (hikaye+kapak)</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sağ taraf - Hikaye özeti */}
              <div className="lg:w-1/3 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Hikaye Özeti</h3>
                </div>
                
                {!storyData.title ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    Hikaye başlığı belirlendiğinde özet oluşmaya başlayacak...
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="p-2 bg-white/70 dark:bg-gray-800/30 rounded-lg">
                      <p className="font-medium">{storyData.title}</p>
                    </div>
                    
                    {storyData.mainCharacter && (
                      <div className="p-2 bg-white/70 dark:bg-gray-800/30 rounded-lg">
                        <p><span className="font-medium">Karakter:</span> {storyData.mainCharacter}</p>
                      </div>
                    )}
                    
                    {storyData.setting && (
                      <div className="p-2 bg-white/70 dark:bg-gray-800/30 rounded-lg">
                        <p><span className="font-medium">Mekan:</span> {storyData.setting}</p>
                      </div>
                    )}
                    
                    {storyData.storyIdea && (
                      <div className="p-2 bg-white/70 dark:bg-gray-800/30 rounded-lg">
                        <p className="text-sm">{storyData.storyIdea}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={() => {
                      // Hikaye fikirlerini rastgele oluştur
                      const karakterler = ["Cesur bir çocuk", "Bilge bir yaşlı", "Şirin bir tavşan", "Meraklı bir robot"];
                      const mekanlar = ["büyülü bir orman", "gizemli bir kale", "uzak bir gezegen", "denizin derinlikleri"];
                      
                      if (!storyData.title) {
                        const başlıklar = [
                          `${karakterler[Math.floor(Math.random() * karakterler.length)]}'ın Macerası`,
                          `${mekanlar[Math.floor(Math.random() * mekanlar.length)].charAt(0).toUpperCase() + mekanlar[Math.floor(Math.random() * mekanlar.length)].slice(1)}'deki Sır`,
                          `Muhteşem Keşif`
                        ];
                        setStoryData(prev => ({ ...prev, title: başlıklar[Math.floor(Math.random() * başlıklar.length)] }));
                      } else if (!storyData.mainCharacter) {
                        setStoryData(prev => ({ ...prev, mainCharacter: karakterler[Math.floor(Math.random() * karakterler.length)] }));
                      } else if (!storyData.setting) {
                        setStoryData(prev => ({ ...prev, setting: mekanlar[Math.floor(Math.random() * mekanlar.length)] }));
                      } else if (!storyData.storyIdea) {
                        const fikirler = [
                          `${storyData.mainCharacter}, ${storyData.setting}'de kaybolur ve geri dönüş yolunu bulmaya çalışır.`,
                          `${storyData.mainCharacter}, ${storyData.setting}'de gizli bir hazine bulur ama onu kötü kalpli birisinden koruması gerekir.`,
                          `${storyData.mainCharacter}, ${storyData.setting}'de yeni arkadaşlar edinir ve birlikte büyük bir maceraya atılırlar.`
                        ];
                        setStoryData(prev => ({ ...prev, storyIdea: fikirler[Math.floor(Math.random() * fikirler.length)] }));
                      }
                      
                      showNotification('Hikaye fikri önerisi eklendi!', 'success');
                    }}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Bana Fikir Ver
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={goToNextStep}
                disabled={!storyData.title || !storyData.mainCharacter || !storyData.setting || !storyData.storyIdea}
                className={`px-6 py-3 rounded-lg ${
                  !storyData.title || !storyData.mainCharacter || !storyData.setting || !storyData.storyIdea
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                İleri
              </button>
            </div>
          </motion.div>
        );
      
      case StoryCreationStep.STORY_WRITING:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-3xl font-bold mb-6">Hikaye Oluşturma</h1>
            
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>Hikaye oluşturma işlemi için aşağıdaki butona tıklayın. Oluşturma işlemi bittikten sonra hikayeleri düzenleme ekranına geçebilirsiniz.</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-xl font-semibold mb-4">Hikaye Detayları</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Başlık</p>
                  <p className="font-medium">{storyData.title}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ana Karakter</p>
                  <p className="font-medium">{storyData.mainCharacter}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mekan</p>
                  <p className="font-medium">{storyData.setting}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Problem</p>
                  <p className="font-medium">{storyData.problem}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hikaye Fikri</p>
                  <p className="font-medium">{storyData.storyIdea}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sayfa Sayısı</p>
                  <p className="font-medium">{storyData.pageCount || 6} sayfa</p>
                </div>
              </div>
            </div>
            
            {!isGenerating && !storyData.content ? (
              <div className="flex justify-center my-10">
                <button
                  onClick={generateStoryFromIdea}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors flex items-center text-lg font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hikaye Oluştur
                </button>
              </div>
            ) : isGenerating ? (
              <div className="text-center my-10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <h3 className="text-lg font-medium mb-2">Hikayeniz Oluşturuluyor</h3>
                <p className="text-gray-600 dark:text-gray-400">Bu işlem biraz zaman alabilir, lütfen bekleyin...</p>
              </div>
            ) : (
              <div className="my-10">
                <h2 className="text-xl font-semibold mb-4">Hikayeniz Hazır</h2>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="max-h-60 overflow-y-auto mb-4 prose dark:prose-invert prose-sm">
                    <p>{storyData.content.substring(0, 500)}...</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Yaklaşık {storyData.pages.length} sayfa, {Math.ceil(storyData.content.length / 1000)} dk. okuma süresi</span>
                    <button 
                      onClick={() => setShowFullPreview(true)}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg flex items-center text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Tam Önizleme
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={goToNextStep}
                disabled={!storyData.content || storyData.pages.length === 0}
                className={`px-6 py-3 rounded-lg ${
                  !storyData.content || storyData.pages.length === 0
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                } transition-colors`}
              >
                İleri
              </button>
            </div>
            
            {showFullPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Hikaye Önizleme</h3>
                    <button 
                      onClick={() => setShowFullPreview(false)}
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-grow overflow-y-auto p-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {storyData.pages.map((page, index) => (
                        <div key={page.id} className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            {index === 0 ? 'Kapak Sayfası' : `Sayfa ${index}`}
                          </h3>
                          <p className="whitespace-pre-wrap">{page.content}</p>
                          {page.image && (
                            <img 
                              src={page.image} 
                              alt={`Sayfa ${index} görseli`}
                              className="mt-4 rounded-lg max-h-40 object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      
      case StoryCreationStep.IMAGE_CREATION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Görseller</h1>
            
            <div className="mb-4 md:mb-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>Her sayfa için görsel oluşturun. Kapak sayfası ve hikaye sayfaları için görseller otomatik oluşturulabilir.</p>
            </div>
            
            {/* Toplu görsel oluşturma butonu */}
            <div className="mb-6">
              <button
                onClick={async () => {
                  if (storyData.pages.length === 0) {
                    toast.error('Hikaye sayfaları oluşturulmamış');
                    return;
                  }
                  
                  setIsLoading(true);
                  showNotification('Tüm görseller oluşturuluyor...', 'info');
                  
                  try {
                    // Kitap kapağı için öncelikle görsel oluştur
                    if (!storyData.pages[0].image) {
                      await generateImageForPage(0);
                    }
                    
                    // Diğer sayfalar için görselleri oluştur (kapak sayfası hariç)
                    for (let i = 1; i < storyData.pages.length; i++) {
                      if (!storyData.pages[i].image) {
                        await generateImageForPage(i);
                        // Sıralı işlem olduğu için ufak bekletme
                        await new Promise(resolve => setTimeout(resolve, 200));
                      }
                    }
                    
                    showNotification('Tüm görseller başarıyla oluşturuldu!', 'success');
                  } catch (error) {
                    console.error('Görsel oluşturma hatası:', error);
                    showNotification('Bazı görseller oluşturulamadı.', 'error');
                  } finally {
                    setIsLoading(false);
                    setCurrentImagePageIndex(-1);
                  }
                }}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Görseller Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Tüm Görselleri Otomatik Oluştur
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {storyData.pages.map((page, index) => (
                <div key={page.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base">
                      {index === 0 ? 'Kapak Görseli' : `Sayfa ${index} Görseli`}
                    </h3>
                    {page.image && (
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-xs text-blue-500 hover:text-blue-700"
                          onClick={() => {
                            // Görsel önizleme fonksiyonu (burada basit bir alert gösteriyoruz)
                            window.open(page.image, '_blank');
                          }}
                        >
                          Önizle
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {page.image ? (
                      <div className="relative">
                        <img 
                          src={page.image} 
                          alt={`Sayfa ${index}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-2">
                          <button
                            onClick={() => generateImageForPage(index)}
                            disabled={isLoading}
                            className="p-2 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                            title="Yeni görsel oluştur"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              const updatedPages = [...storyData.pages];
                              updatedPages[index] = {
                                ...updatedPages[index],
                                image: undefined
                              };
                              setStoryData(prev => ({ 
                                ...prev, 
                                pages: updatedPages,
                                // Kapak görseli silindiyse coverImage'ı da temizle
                                coverImage: index === 0 ? undefined : prev.coverImage
                              }));
                              showNotification('Görsel kaldırıldı', 'info');
                            }}
                            className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                            title="Görseli kaldır"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {isLoading && currentImagePageIndex === index ? (
                            <div className="flex flex-col items-center justify-center">
                              <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="mt-2 text-sm text-purple-500">Görsel oluşturuluyor...</p>
                            </div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <textarea
                            value={page.imagePrompt || ''}
                            onChange={(e) => {
                              const updatedPages = [...storyData.pages];
                              updatedPages[index] = {
                                ...updatedPages[index],
                                imagePrompt: e.target.value
                              };
                              setStoryData(prev => ({ ...prev, pages: updatedPages }));
                            }}
                            placeholder="Görsel için açıklama yazın..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors dark:bg-gray-700 dark:text-white"
                          />
                          
                          <button
                            onClick={() => {
                              // pageIndex değişkenini ayarla
                              setCurrentImagePageIndex(index);
                              generateImageForPage(index);
                            }}
                            disabled={isLoading}
                            className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isLoading && currentImagePageIndex === index ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Oluşturuluyor...
                              </>
                            ) : (
                              'AI ile Görsel Oluştur'
                            )}
                          </button>
                          
                          <div className="flex items-center">
                            <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                            <span className="mx-2 text-xs text-gray-500 dark:text-gray-400">veya</span>
                            <hr className="flex-grow border-gray-200 dark:border-gray-700" />
                          </div>
                          
                          <label
                            className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center cursor-pointer text-sm"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  if (file.size > 5 * 1024 * 1024) {
                                    showNotification('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
                                    return;
                                  }
                                  
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const updatedPages = [...storyData.pages];
                                    updatedPages[index] = {
                                      ...updatedPages[index],
                                      image: reader.result as string
                                    };
                                    setStoryData(prev => ({ 
                                      ...prev, 
                                      pages: updatedPages,
                                      coverImage: index === 0 ? reader.result as string : prev.coverImage
                                    }));
                                    showNotification('Görsel başarıyla yüklendi', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            Dosyadan Yükle
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 md:mt-8 flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Geri
              </button>
              
              <button
                onClick={goToNextStep}
                className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                İleri
              </button>
            </div>
          </motion.div>
        );
      
      case StoryCreationStep.STYLE_SELECTION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-3xl font-bold mb-6">Stil ve Düzen</h1>
            
            <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>Hikayenizin görsel stilini ve sayfa düzenini seçin. Bu seçimler hikayenizin genel atmosferini belirler.</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Tema Seçimi</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StyleThemeCard
                    theme="children"
                    title="Çocuk Masalı"
                    description="Renkli ve canlı, çocuklara yönelik sevimli bir düzen"
                    icon={
                      <img src="https://cdn-icons-png.flaticon.com/512/2827/2827462.png" alt="Çocuk Masalı" className="w-14 h-14" />
                    }
                    isSelected={storyData.style === ThemeStyle.CHILDREN}
                    onClick={() => setStoryStyle(ThemeStyle.CHILDREN)}
                    preview={
                      <div className="text-xs p-2 rounded bg-white/30">
                        <p className="font-comic">Hikayenizde yazılar bu şekilde görünecektir.</p>
                      </div>
                    }
                  />
                  
                  <StyleThemeCard
                    theme="modern"
                    title="Modern"
                    description="Temiz ve sade, zarif bir tasarım"
                    icon={
                      <img src="https://cdn-icons-png.flaticon.com/512/2736/2736913.png" alt="Modern" className="w-14 h-14" />
                    }
                    isSelected={storyData.style === ThemeStyle.MODERN}
                    onClick={() => setStoryStyle(ThemeStyle.MODERN)}
                    preview={
                      <div className="text-xs p-2 rounded bg-white/30">
                        <p className="font-sans">Hikayenizde yazılar bu şekilde görünecektir.</p>
                      </div>
                    }
                  />
                  
                  <StyleThemeCard
                    theme="fantasy"
                    title="Fantastik"
                    description="Büyülü, masalsı ve hayal gücünü zorlayan bir tema"
                    icon={
                      <img src="https://cdn-icons-png.flaticon.com/512/8927/8927200.png" alt="Fantastik" className="w-14 h-14" />
                    }
                    isSelected={storyData.style === ThemeStyle.FANTASY}
                    onClick={() => setStoryStyle(ThemeStyle.FANTASY)}
                    preview={
                      <div className="text-xs p-2 rounded bg-white/30">
                        <p className="font-serif italic">Hikayenizde yazılar bu şekilde görünecektir.</p>
                      </div>
                    }
                  />
                  
                  <StyleThemeCard
                    theme="adventure"
                    title="Macera"
                    description="Heyecanlı, dinamik ve merak uyandıran bir düzen"
                    icon={
                      <img src="https://cdn-icons-png.flaticon.com/512/8284/8284334.png" alt="Macera" className="w-14 h-14" />
                    }
                    isSelected={storyData.style === ThemeStyle.ADVENTURE}
                    onClick={() => setStoryStyle(ThemeStyle.ADVENTURE)}
                    preview={
                      <div className="text-xs p-2 rounded bg-white/30">
                        <p className="font-mono">Hikayenizde yazılar bu şekilde görünecektir.</p>
                      </div>
                    }
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Kapak Stili</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CoverStyleCard 
                    title="Açık" 
                    description="Açık renkli, sade ve modern tasarım" 
                    theme="light"
                    isSelected={storyData.coverStyle === "light"}
                    onClick={() => setStoryData(prev => ({ ...prev, coverStyle: "light" }))}
                  />
                  <CoverStyleCard 
                    title="Koyu" 
                    description="Koyu renkli, ciddi ve zarif tasarım" 
                    theme="dark"
                    isSelected={storyData.coverStyle === "dark"}
                    onClick={() => setStoryData(prev => ({ ...prev, coverStyle: "dark" }))}
                  />
                  <CoverStyleCard 
                    title="Renkli" 
                    description="Canlı ve dikkat çekici renkli kapak" 
                    theme="colorful"
                    isSelected={storyData.coverStyle === "colorful" || !storyData.coverStyle}
                    onClick={() => setStoryData(prev => ({ ...prev, coverStyle: "colorful" }))}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Sayfa Düzeni</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <PageLayoutCard 
                    title="Klasik Düzen" 
                    description="Resim üstte, metin altta olan geleneksel düzen" 
                    layout={TemplateType.CLASSIC}
                    isSelected={storyData.pageLayout === TemplateType.CLASSIC || !storyData.pageLayout}
                    onClick={() => setStoryData(prev => ({ ...prev, pageLayout: TemplateType.CLASSIC }))}
                  />
                  <PageLayoutCard 
                    title="Yan Yana Düzen" 
                    description="Resim ve metin yan yana düzenlenir" 
                    layout={TemplateType.VISUAL_TEXT}
                    isSelected={storyData.pageLayout === TemplateType.VISUAL_TEXT}
                    onClick={() => setStoryData(prev => ({ ...prev, pageLayout: TemplateType.VISUAL_TEXT }))}
                  />
                  <PageLayoutCard 
                    title="Panoramik Düzen" 
                    description="Tam sayfa resim üzerinde metin içeren modern düzen" 
                    layout={TemplateType.PANORAMIC}
                    isSelected={storyData.pageLayout === TemplateType.PANORAMIC}
                    onClick={() => setStoryData(prev => ({ ...prev, pageLayout: TemplateType.PANORAMIC }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-12">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Geri
              </button>
              <button
                onClick={goToNextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
              >
                Önizleme ve Yayınlama
              </button>
            </div>
          </motion.div>
        );
      
      case StoryCreationStep.PREVIEW_PUBLISH:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Önizleme ve Yayınlama</h1>
            
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>Hikayenizi yayınladığınızda, StoryVista platformunda herkese açık olarak görüntülenecek ve paylaşılabilecektir.</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3 space-y-6">
                {/* Kitap Önizleme Alanı */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden relative">
                  <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span>Kitap Önizleme</span>
                    <button 
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded text-xs flex items-center text-gray-700 dark:text-gray-300"
                      onClick={() => {
                        // Tam ekran önizleme fonksiyonu
                        setShowFullPreview(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Tam Ekran Önizleme
                    </button>
                  </h2>
                  
                  {storyData.pages.length > 0 ? (
                    <div className="p-8 flex flex-col items-center">
                      {/* Kitap görünümü */}
                      <div className="w-full max-w-md mx-auto relative mb-8">
                        {/* Kapak önizleme */}
                        {currentPreviewPageIndex === 0 ? (
                          <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ width: '270px', height: '337.5px', margin: '0 auto' }}>
                            {storyData.coverImage ? (
                              <img 
                                src={storyData.coverImage} 
                                alt="Kitap Kapağı" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <p className="text-blue-800 dark:text-blue-200 font-medium text-center p-4">Kapak görseli yüklenmemiş</p>
                              </div>
                            )}
                            
                            {/* Kitap kenarı */}
                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-600 flex flex-col justify-between py-4">
                              <div className="w-full h-1 bg-yellow-400"></div>
                              <div className="text-white font-bold text-sm" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                {storyData.title}
                              </div>
                              <div className="w-full h-1 bg-yellow-400"></div>
                            </div>
                            
                            {/* Kapak yazıları */}
                            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                              <h3 className="text-white text-xl font-bold">{storyData.title}</h3>
                              <p className="text-white/80 text-sm">{storyData.authorName}</p>
                              <p className="text-white/70 text-xs mt-1">StoryVista</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ width: '270px', height: '337.5px', margin: '0 auto' }}>
                            {/* İçerik sayfası */}
                            {storyData.pages[currentPreviewPageIndex].image ? (
                              <div className="h-[180px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <img 
                                  src={storyData.pages[currentPreviewPageIndex].image} 
                                  alt={`Sayfa ${currentPreviewPageIndex} görseli`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-[180px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Sayfa görseli yok</p>
                              </div>
                            )}
                            
                            {/* Metin bölümü */}
                            <div className="p-4 bg-white dark:bg-gray-800 h-[157.5px] overflow-y-auto">
                              <p className="text-gray-800 dark:text-gray-200 text-sm">
                                {storyData.pages[currentPreviewPageIndex].content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Sayfa kontrolleri */}
                      <div className="flex justify-between items-center w-full max-w-md">
                        <button 
                          onClick={() => {
                            if (currentPreviewPageIndex > 0) {
                              setCurrentPreviewPageIndex(prevIndex => prevIndex - 1);
                            }
                          }}
                          disabled={currentPreviewPageIndex === 0}
                          className={`flex items-center px-4 py-2 rounded-lg ${
                            currentPreviewPageIndex === 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Önceki Sayfa
                        </button>
                        
                        <div className="text-center">
                          <div className="flex items-center space-x-1 justify-center mb-2">
                            {storyData.pages.map((_, index) => (
                              <button 
                                key={index}
                                onClick={() => setCurrentPreviewPageIndex(index)}
                                className={`w-2 h-2 rounded-full ${
                                  currentPreviewPageIndex === index 
                                    ? 'bg-blue-600' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Sayfa ${index + 1}`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Sayfa {currentPreviewPageIndex + 1} / {storyData.pages.length}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            if (currentPreviewPageIndex < storyData.pages.length - 1) {
                              setCurrentPreviewPageIndex(prevIndex => prevIndex + 1);
                            }
                          }}
                          disabled={currentPreviewPageIndex === storyData.pages.length - 1}
                          className={`flex items-center px-4 py-2 rounded-lg ${
                            currentPreviewPageIndex === storyData.pages.length - 1 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          Sonraki Sayfa
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Alt butonlar */}
                      <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <button 
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                          onClick={async () => {
                            const success = await generateAudio(storyData.content);
                            if (success) {
                              setStoryData(prev => ({ ...prev, audioEnabled: true }));
                            }
                          }}
                          disabled={isLoading || storyData.audioEnabled}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                          </svg>
                          {storyData.audioEnabled ? "Ses Dosyası Hazır" : "Sesli Versiyon Oluştur"}
                        </button>
                        <button 
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                          onClick={() => {
                            showNotification('3D görünüm hazırlanıyor...', 'info');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          3D Görünüm
                        </button>
                        <button 
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                          onClick={() => {
                            setShowFullPreview(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Tam Önizleme
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">Henüz sayfa eklenmemiş. Bir önceki adıma geri dönüp hikaye oluşturun.</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:w-1/3 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4">Hikaye Bilgileri</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hikaye Başlığı</label>
                      <input
                        type="text"
                        value={storyData.title}
                        onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                        placeholder="Hikaye başlığı"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yazar</label>
                      <input
                        type="text"
                        value={storyData.authorName}
                        onChange={(e) => setStoryData(prev => ({ ...prev, authorName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                        placeholder="Yazar adı"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                      <select
                        value={storyData.category}
                        onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value as StoryCategory }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                      >
                        {Object.values(StoryCategory).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İstatistikler</label>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Toplam Sayfa:</span>
                          <span className="font-medium">{storyData.pages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Resimli Sayfa:</span>
                          <span className="font-medium">{storyData.pages.filter(p => p.image).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tahmini Okuma:</span>
                          <span className="font-medium">{Math.ceil(storyData.content.length / 1000)} dk</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sesli Hikaye:</span>
                          <span className="font-medium">{storyData.audioEnabled ? 'Aktif' : 'Pasif'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4">Yayınlama</h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Hikayenizi yayınladığınızda, StoryVista platformunda herkese açık olarak görüntülenecek ve paylaşılabilecektir.
                  </p>
                  
                  {!user ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Hikayenizi yayınlamak için giriş yapmalısınız.
                      </p>
                    </div>
                  ) : !storyData.title ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                        Lütfen hikayenize bir başlık ekleyin.
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={publishStory}
                      disabled={isLoading || !user || !storyData.title}
                      className={`w-full py-3 rounded-lg flex items-center justify-center font-medium ${
                        isLoading || !user || !storyData.title
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Yayınlanıyor...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Hikayeyi Yayınla
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={saveStoryAsDraft}
                      disabled={isLoading || !user}
                      className={`w-full py-3 rounded-lg flex items-center justify-center font-medium ${
                        isLoading || !user
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Taslak Olarak Kaydet
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Hikaye oluşturma işleminden vazgeçmek istediğinize emin misiniz? Kaydetmediğiniz değişiklikler kaybolacaktır.')) {
                          window.location.href = '/';
                        }
                      }}
                      disabled={isLoading}
                      className="w-full py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30 rounded-lg flex items-center justify-center font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      İptal Et
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Geri
              </button>
            </div>
            
            {/* Tam Ekran Önizleme Modalı */}
            {showFullPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Hikaye Önizleme</h3>
                    <button 
                      onClick={() => setShowFullPreview(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-grow overflow-auto p-6">
                    <div className="relative rounded-lg overflow-hidden shadow-xl max-w-xl mx-auto">
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '400px', 
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden'
                        }}
                      >
                        {storyData.pages[currentPreviewPageIndex].image ? (
                          <img 
                            src={storyData.pages[currentPreviewPageIndex].image} 
                            alt={`Sayfa ${currentPreviewPageIndex} görseli`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400">Görsel yok</span>
                          </div>
                        )}
                        
                        {currentPreviewPageIndex === 0 ? (
                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
                            <h2 className="text-white text-3xl font-bold mb-2">{storyData.title}</h2>
                            <p className="text-white/90 text-lg">{storyData.authorName}</p>
                            <p className="text-white/70 text-sm mt-2">StoryVista</p>
                          </div>
                        ) : (
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-800/90">
                            <p className="text-gray-800 dark:text-gray-200">
                              {storyData.pages[currentPreviewPageIndex].content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => {
                          if (currentPreviewPageIndex > 0) {
                            setCurrentPreviewPageIndex(prevIndex => prevIndex - 1);
                          }
                        }}
                        disabled={currentPreviewPageIndex === 0}
                        className={`px-4 py-2 rounded-lg ${
                          currentPreviewPageIndex === 0 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <div className="text-center">
                        <div className="flex justify-center space-x-1 mb-1">
                          {storyData.pages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPreviewPageIndex(index)}
                              className={`h-2 w-2 rounded-full ${
                                currentPreviewPageIndex === index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              aria-label={`Sayfa ${index + 1}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Sayfa {currentPreviewPageIndex + 1} / {storyData.pages.length}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          if (currentPreviewPageIndex < storyData.pages.length - 1) {
                            setCurrentPreviewPageIndex(prevIndex => prevIndex + 1);
                          }
                        }}
                        disabled={currentPreviewPageIndex === storyData.pages.length - 1}
                        className={`px-4 py-2 rounded-lg ${
                          currentPreviewPageIndex === storyData.pages.length - 1 
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
    }
  };

  // Bildirim bileşeni
  const Notification = () => {
    if (!notificationMessage) return null;
    
    const getBackgroundColor = () => {
      switch(notificationMessage.type) {
        case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
        case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      }
    };
    
    const getIconColor = () => {
      switch(notificationMessage.type) {
        case 'success': return 'text-green-500 dark:text-green-400';
        case 'error': return 'text-red-500 dark:text-red-400';
        case 'warning': return 'text-amber-500 dark:text-amber-400';
        default: return 'text-blue-500 dark:text-blue-400';
      }
    };
    
    const getIcon = () => {
      switch(notificationMessage.type) {
        case 'success':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          );
        case 'error':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          );
        case 'warning':
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          );
        default:
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
      }
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 p-4 rounded-lg shadow-lg border ${getBackgroundColor()} transform transition-all duration-300`}
      >
        <div className="flex items-start">
          <div className={`mr-3 flex-shrink-0 ${getIconColor()}`}>
            {getIcon()}
          </div>
          <div className="flex-grow">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {notificationMessage.text}
            </p>
          </div>
          <button 
            onClick={() => setNotificationMessage(null)}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="w-full bg-white dark:bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
            className={`h-full ${
              notificationMessage.type === 'success' ? 'bg-green-500' : 
              notificationMessage.type === 'error' ? 'bg-red-500' : 
              notificationMessage.type === 'warning' ? 'bg-amber-500' : 
              'bg-blue-500'
            }`}
            onAnimationComplete={() => setNotificationMessage(null)}
          />
        </div>
      </motion.div>
    );
  };

  // Notification gösterme fonksiyonu
  const showNotification = (text: string, type: 'info' | 'success' | 'error' | 'warning') => {
    setNotificationMessage({ text, type });
    
    // 3 saniye sonra kapat
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  // Önizleme adımını render et
  const renderPreviewPublishStep = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-6xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Önizleme ve Yayınlama</h1>
        
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <p>Hikayenizi yayınladığınızda, StoryVista platformunda herkese açık olarak görüntülenecek ve paylaşılabilecektir.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            {/* Kitap Önizleme Alanı */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden relative">
              <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span>Kitap Önizleme</span>
                <button 
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded text-xs flex items-center text-gray-700 dark:text-gray-300"
                  onClick={() => {
                    // Tam ekran önizleme fonksiyonu
                    setShowFullPreview(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Tam Ekran Önizleme
                </button>
              </h2>
              
              {storyData.pages.length > 0 ? (
                <div className="p-8 flex flex-col items-center">
                  {/* Kitap görünümü */}
                  <div className="w-full max-w-md mx-auto relative mb-8">
                    {/* Kapak önizleme */}
                    {currentPreviewPageIndex === 0 ? (
                      <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ width: '270px', height: '337.5px', margin: '0 auto' }}>
                        {storyData.coverImage ? (
                          <img 
                            src={storyData.coverImage} 
                            alt="Kitap Kapağı" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <p className="text-blue-800 dark:text-blue-200 font-medium text-center p-4">Kapak görseli yüklenmemiş</p>
                          </div>
                        )}
                        
                        {/* Kitap kenarı */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-blue-600 flex flex-col justify-between py-4">
                          <div className="w-full h-1 bg-yellow-400"></div>
                          <div className="text-white font-bold text-sm" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            {storyData.title}
                          </div>
                          <div className="w-full h-1 bg-yellow-400"></div>
                        </div>
                        
                        {/* Kapak yazıları */}
                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <h3 className="text-white text-xl font-bold">{storyData.title}</h3>
                          <p className="text-white/80 text-sm">{storyData.authorName}</p>
                          <p className="text-white/70 text-xs mt-1">StoryVista</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ width: '270px', height: '337.5px', margin: '0 auto' }}>
                        {/* İçerik sayfası */}
                        {storyData.pages[currentPreviewPageIndex].image ? (
                          <div className="h-[180px] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img 
                              src={storyData.pages[currentPreviewPageIndex].image} 
                              alt={`Sayfa ${currentPreviewPageIndex} görseli`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-[180px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Sayfa görseli yok</p>
                          </div>
                        )}
                        
                        {/* Metin bölümü */}
                        <div className="p-4 bg-white dark:bg-gray-800 h-[157.5px] overflow-y-auto">
                          <p className="text-gray-800 dark:text-gray-200 text-sm">
                            {storyData.pages[currentPreviewPageIndex].content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Sayfa kontrolleri */}
                  <div className="flex justify-between items-center w-full max-w-md">
                    <button 
                      onClick={() => {
                        if (currentPreviewPageIndex > 0) {
                          setCurrentPreviewPageIndex(prevIndex => prevIndex - 1);
                        }
                      }}
                      disabled={currentPreviewPageIndex === 0}
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        currentPreviewPageIndex === 0 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Önceki Sayfa
                    </button>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1 justify-center mb-2">
                        {storyData.pages.map((_, index) => (
                          <button 
                            key={index}
                            onClick={() => setCurrentPreviewPageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              currentPreviewPageIndex === index 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Sayfa ${index + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sayfa {currentPreviewPageIndex + 1} / {storyData.pages.length}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (currentPreviewPageIndex < storyData.pages.length - 1) {
                          setCurrentPreviewPageIndex(prevIndex => prevIndex + 1);
                        }
                      }}
                      disabled={currentPreviewPageIndex === storyData.pages.length - 1}
                      className={`flex items-center px-4 py-2 rounded-lg ${
                        currentPreviewPageIndex === storyData.pages.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Sonraki Sayfa
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Alt butonlar */}
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <button 
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                      onClick={async () => {
                        const success = await generateAudio(storyData.content);
                        if (success) {
                          setStoryData(prev => ({ ...prev, audioEnabled: true }));
                        }
                      }}
                      disabled={isLoading || storyData.audioEnabled}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 017.072 0m-9.9-2.828a9 9 0 0112.728 0" />
                      </svg>
                      {storyData.audioEnabled ? "Ses Dosyası Hazır" : "Sesli Versiyon Oluştur"}
                    </button>
                    <button 
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                      onClick={() => {
                        showNotification('3D görünüm hazırlanıyor...', 'info');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      3D Görünüm
                    </button>
                    <button 
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center text-sm"
                      onClick={() => {
                        setShowFullPreview(true);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Tam Önizleme
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">Henüz sayfa eklenmemiş. Bir önceki adıma geri dönüp hikaye oluşturun.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Hikaye Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hikaye Başlığı</label>
                  <input
                    type="text"
                    value={storyData.title}
                    onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="Hikaye başlığı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yazar</label>
                  <input
                    type="text"
                    value={storyData.authorName}
                    onChange={(e) => setStoryData(prev => ({ ...prev, authorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="Yazar adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    value={storyData.category}
                    onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value as StoryCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  >
                    {Object.values(StoryCategory).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İstatistikler</label>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Toplam Sayfa:</span>
                      <span className="font-medium">{storyData.pages.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Resimli Sayfa:</span>
                      <span className="font-medium">{storyData.pages.filter(p => p.image).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tahmini Okuma:</span>
                      <span className="font-medium">{Math.ceil(storyData.content.length / 1000)} dk</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sesli Hikaye:</span>
                      <span className="font-medium">{storyData.audioEnabled ? 'Aktif' : 'Pasif'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Yayınlama</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                Hikayenizi yayınladığınızda, StoryVista platformunda herkese açık olarak görüntülenecek ve paylaşılabilecektir.
              </p>
              
              {!user ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                    Hikayenizi yayınlamak için giriş yapmalısınız.
                  </p>
                </div>
              ) : !storyData.title ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                    Lütfen hikayenize bir başlık ekleyin.
                  </p>
                </div>
              ) : null}
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={publishStory}
                  disabled={isLoading || !user || !storyData.title}
                  className={`w-full py-3 rounded-lg flex items-center justify-center font-medium ${
                    isLoading || !user || !storyData.title
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yayınlanıyor...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Hikayeyi Yayınla
                    </>
                  )}
                </button>
                
                <button
                  onClick={saveStoryAsDraft}
                  disabled={isLoading || !user}
                  className={`w-full py-3 rounded-lg flex items-center justify-center font-medium ${
                    isLoading || !user
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Taslak Olarak Kaydet
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Hikaye oluşturma işleminden vazgeçmek istediğinize emin misiniz? Kaydetmediğiniz değişiklikler kaybolacaktır.')) {
                      window.location.href = '/';
                    }
                  }}
                  disabled={isLoading}
                  className="w-full py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/30 rounded-lg flex items-center justify-center font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  İptal Et
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-between">
          <button
            onClick={goToPreviousStep}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Geri
          </button>
        </div>
        
        {/* Tam Ekran Önizleme Modalı */}
        {showFullPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Hikaye Önizleme</h3>
                <button 
                  onClick={() => setShowFullPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-grow overflow-auto p-6">
                <div className="relative rounded-lg overflow-hidden shadow-xl max-w-xl mx-auto">
                  <div 
                    style={{ 
                      width: '100%', 
                      height: '400px', 
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    {storyData.pages[currentPreviewPageIndex].image ? (
                      <img 
                        src={storyData.pages[currentPreviewPageIndex].image} 
                        alt={`Sayfa ${currentPreviewPageIndex} görseli`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">Görsel yok</span>
                      </div>
                    )}
                    
                    {currentPreviewPageIndex === 0 ? (
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
                        <h2 className="text-white text-3xl font-bold mb-2">{storyData.title}</h2>
                        <p className="text-white/90 text-lg">{storyData.authorName}</p>
                        <p className="text-white/70 text-sm mt-2">StoryVista</p>
                      </div>
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-gray-800/90">
                        <p className="text-gray-800 dark:text-gray-200">
                          {storyData.pages[currentPreviewPageIndex].content}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (currentPreviewPageIndex > 0) {
                        setCurrentPreviewPageIndex(prevIndex => prevIndex - 1);
                      }
                    }}
                    disabled={currentPreviewPageIndex === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentPreviewPageIndex === 0 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="text-center">
                    <div className="flex justify-center space-x-1 mb-1">
                      {storyData.pages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPreviewPageIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            currentPreviewPageIndex === index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          aria-label={`Sayfa ${index + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Sayfa {currentPreviewPageIndex + 1} / {storyData.pages.length}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (currentPreviewPageIndex < storyData.pages.length - 1) {
                        setCurrentPreviewPageIndex(prevIndex => prevIndex + 1);
                      }
                    }}
                    disabled={currentPreviewPageIndex === storyData.pages.length - 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPreviewPageIndex === storyData.pages.length - 1 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  // Ana render fonksiyonunda bildirim bileşenini ekleyelim ve case'leri güncelle
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-4 md:py-8">
      {/* Bildirim */}
      <AnimatePresence>
        {notificationMessage && <Notification />}
      </AnimatePresence>
      
      {/* Sayfa Yükleniyor */}
      {isPageLoading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <svg className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Sayfa Yükleniyor</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Lütfen bekleyin...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Adım Göstergesi */}
          {renderStepIndicator()}
          
          {/* Ana İçerik */}
          <AnimatePresence mode="wait">
            {currentStep === StoryCreationStep.PREVIEW_PUBLISH ? (
              renderPreviewPublishStep()
            ) : (
              renderStepContent()
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default CreateStoryPage; 