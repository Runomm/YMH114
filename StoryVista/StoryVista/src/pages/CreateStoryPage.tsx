import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCompleteStory, generateStoryAudio, StoryPrompt, StoryResponse, generateStoryImage, PackageType as AIServicePackageType, getPageCountByPackage } from '../lib/aiService';
import { useAuth } from '../lib/authContext';
import { supabase } from '../lib/supabase';
import { storyDb } from '../lib/storyDatabase';
import { StoryCreateInput, PageCreateInput } from '../lib/database.types';
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

// Kullanıcı tipi için enum - GÜNCELLENMIŞ
enum UserExperienceType {
  STANDARD = 'standard',    // Standart kullanıcı
  PREMIUM = 'premium'       // Premium kullanıcı
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
  STYLE_SELECTION = 'styleSelection',        // Stil seçimi
  IMAGE_CREATION = 'imageCreation',          // Görsel oluşturma
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
  character: string; // Ana karakter için alternatif alan
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
  packageType: AIServicePackageType;
  pageCount: number;
  imageStyle?: string;
  colorTone?: string;
  detailLevel?: number;
  description?: string; // Ek detaylar için
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
  isBackCoverPage?: boolean; // Yeni eklenen özellik
}

// Başlangıç hikaye verisi
const initialStoryData: StoryData = {
  id: uuidv4(),
  title: '',
  category: StoryCategory.ADVENTURE,
  userType: UserExperienceType.STANDARD,
  tone: StoryTone.SERIOUS,
  mainCharacter: '',
  character: '', // Ana karakter için alternatif alan
  setting: '',
  problem: '',
  storyIdea: '',
  content: '',
  pages: [],
  style: ThemeStyle.CHILDREN,
  audioEnabled: false,
  published: false,
  authorName: '',
  packageType: AIServicePackageType.NORMAL,
  pageCount: 6,
  description: '' // Ek detaylar için
};

// Mock hikaye fikirleri
const mockStoryIdeas = [
  {
    title: "Ayşe'nin Orman Macerası",
    character: "Meraklı ve cesur bir kız",
    setting: "Büyülü orman",
    description: "Ayşe ormanda kaybolur ve konuşan hayvanlarla tanışarak evine dönüş yolunu bulur."
  },
  {
    title: "Uzayda Kayıp",
    character: "Genç astronot",
    setting: "Uzay istasyonu",
    description: "Genç bir astronot uzayda kaybolur ve yeni gezegenler keşfederek dünyaya dönmeye çalışır."
  },
  {
    title: "Deniz Altında Gizli Şehir",
    character: "Dalgıç çocuk",
    setting: "Okyanus derinlikleri",
    description: "Bir çocuk dalış yaparken deniz altında gizli bir şehir keşfeder ve deniz yaratıklarıyla arkadaş olur."
  },
  {
    title: "Zaman Makinesi Macerası",
    character: "Mucit çocuk",
    setting: "Bilim laboraturı ve geçmiş",
    description: "Genç bir mucit zaman makinesi yapar ve geçmişe giderek tarihi olayları yaşar."
  },
  {
    title: "Büyülü Kütüphane",
    character: "Kitap sever çocuk",
    setting: "Antika kütüphane",
    description: "Bir çocuk eski kütüphanede büyülü kitaplar bulur ve hikaye karakterleriyle tanışır."
  },
  {
    title: "Renkler Krallığı",
    character: "Sanatçı kız",
    setting: "Renkli dünya",
    description: "Bir kız renklerini kaybeden dünyaya gider ve sanat gücüyle renkleri geri getirir."
  },
  {
    title: "Bulutlarda Yaşam",
    character: "Hayal kuran çocuk",
    setting: "Bulutlar arası şehir",
    description: "Bir çocuk bulutlarda yaşayan insanları keşfeder ve onlarla unutulmaz maceralar yaşar."
  },
  {
    title: "Müzik Ormanı",
    character: "Müzik seven çocuk",
    setting: "Müzikal orman",
    description: "Müzik seven bir çocuk her ağacın farklı bir enstrüman çaldığı ormanda konserto verir."
  }
];

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
  const [currentPreviewPageIndex, setCurrentPreviewPageIndex] = useState(0);
  const [taskIdMap, setTaskIdMap] = useState<Map<string, number>>(new Map());

  // Notification gösterme fonksiyonu - MOVED TO TOP
  const showNotification = (text: string, type: 'info' | 'success' | 'error' | 'warning') => {
    setNotificationMessage({ text, type });
    
    // 3 saniye sonra kapat
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  // Mock hikaye oluşturma fonksiyonu
  const generateMockStory = () => {
    const randomStory = mockStoryIdeas[Math.floor(Math.random() * mockStoryIdeas.length)];
    
    setStoryData(prev => ({
      ...prev,
      title: randomStory.title,
      character: randomStory.character,
      setting: randomStory.setting,
      description: randomStory.description,
      // Yazar adını mevcut kullanıcıdan al veya varsayılan değer
      authorName: prev.authorName || user?.user_metadata?.full_name || 'StoryVista Kullanıcısı'
    }));
    
    showNotification('Rastgele hikaye fikri oluşturuldu! İstediğiniz gibi düzenleyebilirsiniz.', 'success');
  };

  // Geçici görsel oluşturma fonksiyonu
  const generateTemporaryImage = async (prompt: string): Promise<string> => {
    // Geçici olarak sabit bir görsel döndürüyoruz
    const images = [
      'https://images.unsplash.com/photo-1500043357830-5e8e3a41c0da',
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45',
      'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      'https://images.unsplash.com/photo-1560807707-8cc77767d783'
    ];
    return images[Math.floor(Math.random() * images.length)] + '?auto=format&fit=crop&w=800&q=80&v=' + Math.random();
  };

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
  
  // Hikayeyi taslak olarak kaydet - DATABASE ENTEGRESYONu
  const saveStoryAsDraft = async () => {
    if (!user) {
      showNotification('Hikaye kaydetmek için giriş yapmalısınız', 'error');
      return;
    }
    
    if (!storyData.title.trim()) {
      showNotification('Lütfen hikayenize bir başlık verin', 'warning');
      return;
    }
    
    setIsLoading(true);
    showNotification('Hikaye taslak olarak kaydediliyor...', 'info');
    
    try {
      // Package type'ı string'e çevir
      let packageTypeString: 'normal' | 'deluxe' | 'premium' = 'normal';
      if (storyData.packageType === AIServicePackageType.PLUS) {
        packageTypeString = 'deluxe';
      } else if (storyData.packageType === AIServicePackageType.PREMIUM1) {
        packageTypeString = 'premium';
      } else {
        packageTypeString = 'normal';
      }
      
      // Hikaye verilerini database formatına çevir
      const storyInput: StoryCreateInput = {
        id: storyData.id,
        title: storyData.title,
        content: storyData.content || '',
        user_id: user.id,
        status: 'draft',
        author_name: storyData.authorName,
        main_character: storyData.character || storyData.mainCharacter,
        setting_location: storyData.setting,
        story_description: storyData.description,
        package_type: packageTypeString,
        page_layout: storyData.pageLayout === TemplateType.PANORAMIC ? 'panoramic' : 'classic',
        cover_style: storyData.coverStyle || 'colorful',
        page_count: storyData.pages.length,
        total_words: storyData.content ? storyData.content.split(' ').length : 0,
        cover_image_url: storyData.coverImage,
        read_time: Math.ceil((storyData.content?.length || 0) / 1000),
        voice_type: storyData.voiceType,
        voice_speed: storyData.voiceSpeed || 1.0,
        category_id: 1, // Varsayılan kategori (Macera)
        theme_id: storyData.style === 'children' ? 1 : 
                 storyData.style === 'modern' ? 2 : 
                 storyData.style === 'fantasy' ? 3 : 4
      };
      
      // Hikayeyi kaydet
      const storyResult = await storyDb.stories.createStory(storyInput);
      
      if (!storyResult.success) {
        throw new Error(storyResult.error || 'Hikaye kaydedilemedi');
      }
      
      // Sayfaları kaydet
      if (storyData.pages.length > 0) {
        const pagesInput: PageCreateInput[] = storyData.pages.map((page, index) => ({
          story_id: storyData.id,
          page_number: page.pageNumber,
          title: page.title,
          content: page.content,
          image_url: page.image,
          image_prompt: page.imagePrompt,
          template_type: storyData.pageLayout === TemplateType.PANORAMIC ? 'panoramic' : 'classic',
          is_cover_page: index === 0,
          is_back_cover_page: page.isBackCoverPage || false,
          is_title_page: page.isTitle || false
        }));
        
        const pagesResult = await storyDb.pages.createPages(pagesInput);
        
        if (!pagesResult.success) {
          console.warn('Sayfa kaydetme hatası:', pagesResult.error);
          // Sayfa hatası olsa da hikaye kaydedildiği için devam et
        }
      }
      
      showNotification('Hikayeniz başarıyla taslak olarak kaydedildi!', 'success');
      
    } catch (error) {
      console.error('Hikaye taslak kaydetme hatası:', error);
      showNotification(
        error instanceof Error ? error.message : 'Hikaye kaydedilirken bir hata oluştu', 
        'error'
      );
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

  // Kullanıcı tipi seçim işleyicisi - ADDED
  const handleUserTypeSelection = (userType: UserExperienceType) => {
    setStoryData(prev => ({ ...prev, userType }));
  };

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

  // URL parametrelerini kontrol et (düzenleme modu için)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editStoryId = urlParams.get('edit');
    
    if (editStoryId && user) {
      loadStoryFromDatabase(editStoryId);
    }
  }, [user]);

  // Veritabanından hikaye yükle - DATABASE ENTEGRASYONU
  const loadStoryFromDatabase = async (storyId: string) => {
    setIsLoading(true);
    showNotification('Hikaye yükleniyor...', 'info');
    
    try {
      // Hikaye detaylarını getir
      const storyResult = await storyDb.stories.getStoryWithDetails(storyId);
      
      if (!storyResult.success || !storyResult.data) {
        throw new Error(storyResult.error || 'Hikaye bulunamadı');
      }
      
      const story = storyResult.data;
      
      // Sayfa detaylarını getir
      const pagesResult = await storyDb.pages.getStoryPages(storyId);
      
      if (!pagesResult.success) {
        console.warn('Sayfa yüklenirken hata:', pagesResult.error);
      }
      
      const pages = pagesResult.data || [];
      
      // StoryData formatına çevir
      const loadedStoryData: StoryData = {
        id: story.id,
        title: story.title,
        content: story.content || '',
        category: StoryCategory.ADVENTURE,
        userType: UserExperienceType.STANDARD,
        tone: StoryTone.SERIOUS,
        mainCharacter: story.main_character || '',
        character: story.main_character || '',
        setting: story.setting_location || '',
        problem: '',
        storyIdea: '',
        description: story.story_description || '',
        authorName: story.author_name || '',
        style: ThemeStyle.CHILDREN,
        packageType: story.package_type === 'premium' ? AIServicePackageType.PREMIUM1 :
                    story.package_type === 'deluxe' ? AIServicePackageType.PLUS :
                    AIServicePackageType.NORMAL,
        pageCount: story.page_count || 0,
        coverImage: story.cover_image_url || '',
        audioEnabled: false,
        published: story.status === 'published',
        voiceType: story.voice_type || '',
        voiceSpeed: story.voice_speed || 1.0,
        coverStyle: (story.cover_style as any) || 'colorful',
        pageLayout: story.page_layout === 'panoramic' ? TemplateType.PANORAMIC : TemplateType.CLASSIC,
        pages: pages.map(page => ({
          id: page.id,
          pageNumber: page.page_number,
          content: page.content || '',
          image: page.image_url || '',
          imagePrompt: page.image_prompt || '',
          title: page.title || '',
          isTitle: page.is_title_page || false,
          isBackCoverPage: page.is_back_cover_page || false
        }))
      };
      
      // State'i güncelle
      setStoryData(loadedStoryData);
      
      // Düzenleme moduna geç
      setCurrentStep(StoryCreationStep.STORY_WRITING);
      
      showNotification('Hikaye başarıyla yüklendi! Düzenleyebilirsiniz.', 'success');
      
    } catch (error) {
      console.error('Hikaye yükleme hatası:', error);
      showNotification(
        error instanceof Error ? error.message : 'Hikaye yüklenirken bir hata oluştu', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        setCurrentStep(StoryCreationStep.STYLE_SELECTION);
        break;
      case StoryCreationStep.STYLE_SELECTION:
        setCurrentStep(StoryCreationStep.IMAGE_CREATION);
        break;
      case StoryCreationStep.IMAGE_CREATION:
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
      case StoryCreationStep.STYLE_SELECTION:
        setCurrentStep(StoryCreationStep.STORY_WRITING);
        break;
      case StoryCreationStep.IMAGE_CREATION:
        setCurrentStep(StoryCreationStep.STYLE_SELECTION);
        break;
      case StoryCreationStep.PREVIEW_PUBLISH:
        setCurrentStep(StoryCreationStep.IMAGE_CREATION);
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
    // Field mapping'i düzelt ve eksik alanları kontrol et
    const title = storyData.title?.trim();
    const character = storyData.character?.trim() || storyData.mainCharacter?.trim();
    const setting = storyData.setting?.trim();
    const description = storyData.description?.trim();
    
    console.log('Form verileri kontrolü:', {
      title,
      character,
      setting,
      description,
      pageCount: storyData.pageCount
    });
    
    if (!title || !character || !setting) {
      showNotification('Lütfen en azından başlık, ana karakter ve mekan bilgilerini doldurun', 'warning');
      return;
    }
    
    setIsGenerating(true);
    setCurrentImagePageIndex(-1);
    
    try {
      // Kullanıcının seçtiği sayfa sayısını kullan
      const requestedPageCount = storyData.pageCount || 6;
      
      console.log(`KULLANICI TALEBİ: ${requestedPageCount}+2 sayfa (${requestedPageCount} hikaye + 2 kapak = ${requestedPageCount + 2} toplam)`);
      
      // Hikaye prompt'unu hazırla - field mapping'i düzelt
      const storyPrompt: StoryPrompt = {
        category: storyData.category,
        tone: storyData.tone,
        length: 'long',
        characterCount: 3,
        inspiration: description || `${character} karakterinin ${setting} mekanında yaşadığı macera`,
        mainCharacter: character, // character field'ını mainCharacter'a map et
        setting: setting,
        title: title,
        packageType: storyData.packageType,
        pageCount: requestedPageCount + 2, // +2 kapak dahil toplam sayfa sayısı
      };
      
      console.log("Gemini API'ye gönderilen hikaye prompt'u:", storyPrompt);
      
      // AI servisi ile hikaye oluştur
      const response = await generateCompleteStory(storyPrompt);
      
      console.log("API'den gelen yanıt:", {
        textLength: response.text?.length,
        pagesCount: response.pages?.length,
        expectedPages: requestedPageCount + 2
      });
      
      // Hikaye içeriğini ayarla
      setStoryData(prev => {
        let pages: StoryPage[] = [];
        
        // mainCharacter field'ını da güncelle
        const updatedPrev = {
          ...prev,
          mainCharacter: character,
          storyIdea: description || `${character} karakterinin ${setting} mekanında yaşadığı macera`
        };
        
        // Eğer API sayfa yapısı döndüyse onu kullan
        if (response.pages && response.pages.length > 0) {
          pages = response.pages.map((page, index) => ({
            id: uuidv4(),
            pageNumber: index + 1,
            content: page.content,
            image: page.image,
            imagePrompt: page.imagePrompt,
            isTitle: page.isTitle || index === 0 || index === response.pages!.length - 1,
            title: index === 0 ? title : 
                   index === response.pages!.length - 1 ? 'Son Sayfa' :
                   `Sayfa ${index + 1}`
          }));
        } else {
          // API sayfa yapısı dönmediyse manuel sayfa organizasyonu yap
          console.log("API sayfa yapısı dönmedi, manuel organizasyon başlatılıyor...");
          
          // İçeriği sayfalara manuel olarak böl
          const totalPageCount = requestedPageCount + 2;
          const content = response.text || '';
          const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
          
          // Kapak sayfası
          pages.push({
            id: uuidv4(),
            pageNumber: 1,
            content: `${title}\n\nYazar: ${storyData.authorName}`,
            title: title,
            isTitle: true,
            imagePrompt: 'Kitap kapağı görseli'
          });
          
          // İçerik sayfaları
          const contentPageCount = requestedPageCount; // Kullanıcının istediği sayfa sayısı
          const paragraphsPerPage = Math.max(1, Math.ceil(paragraphs.length / contentPageCount));
          
          for (let i = 0; i < contentPageCount; i++) {
            const startIdx = i * paragraphsPerPage;
            const endIdx = Math.min(startIdx + paragraphsPerPage, paragraphs.length);
            const pageContent = paragraphs.slice(startIdx, endIdx).join('\n\n');
            
            pages.push({
              id: uuidv4(),
              pageNumber: i + 2,
              content: pageContent || `Bu hikayenin ${i + 1}. sayfasının içeriğidir.`,
              title: `Sayfa ${i + 2}`,
              imagePrompt: `Sayfa ${i + 2} için görsel`
            });
          }
          
          // Son kapak sayfası
          pages.push({
            id: uuidv4(),
            pageNumber: totalPageCount,
            content: 'Son\n\nHikayenin sonu',
            title: 'Son Sayfa',
            isTitle: true,
            isBackCoverPage: true, // Son sayfa olarak işaretle
            imagePrompt: 'Kitap arka kapağı'
          });
        }
        
        
        console.log(`Oluşturulan sayfa sayısı: ${pages.length}, Hedeflenen: ${requestedPageCount + 2}`);
        
        return {
          ...updatedPrev,
          content: response.text,
          pages: pages,
          coverImage: response.imageUrl || prev.coverImage
        };
      });
      
      showNotification(`Hikayeniz ${requestedPageCount + 2} sayfa olarak başarıyla oluşturuldu!`, 'success');
      
    } catch (error) {
      console.error('Hikaye oluşturma hatası:', error);
      
      // API bağlantı hatası için daha detaylı mesaj
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          showNotification('Gemini AI modeli bulunamadı. Lütfen daha sonra tekrar deneyin.', 'error');
        } else if (error.message.includes('401') || error.message.includes('403')) {
          showNotification('API anahtarı geçersiz. Lütfen sistem yöneticisi ile iletişime geçin.', 'error');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          showNotification('İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.', 'error');
        } else {
          showNotification(`Hikaye oluşturma hatası: ${error.message}`, 'error');
        }
      } else {
        showNotification('Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Hikaye metnini sayfalara böl - GÜNCELLENMIŞ
  const organizeIntoPages = () => {
    // Hikaye içeriği var mı kontrol et
    const content = storyData.content || generatedText;
    if (!content) {
      toast.error('Hikaye içeriği boş olamaz');
      return;
    }
    
    // Paket tipine göre sayfa sayısını belirle - +2 sistemini kullan
    const totalPageCount = storyData.pageCount + 2; // Kullanıcının seçtiği sayfa + 2 kapak
    
    console.log(`Sayfa organizasyonu: ${storyData.pageCount} hikaye sayfası + 2 kapak = ${totalPageCount} toplam sayfa`);
    
    // Standart çocuk kitabı sayfa formatı
    const wordsPerPage = 50; // Çocuk kitapları için optimal kelime sayısı
    
    // Hikayeyi API etiketlerine göre böl (eğer varsa)
    const pages: StoryPage[] = [];
    
    try {
      // Gemini'nin ürettiği sayfa etiketlerini kontrol et
      const pageRegex = /<sayfa\s*(\d+)>([\s\S]*?)<\/sayfa\s*\1>/g;
      let match;
      const foundPages: { number: number; content: string; imagePrompt: string }[] = [];
      
      while ((match = pageRegex.exec(content)) !== null) {
        const pageNumber = parseInt(match[1]);
        const pageContent = match[2].trim();
        
        // Görsel açıklamasını ayıkla
        const imagePromptRegex = /<görsel_prompt>([\s\S]*?)<\/görsel_prompt>/;
        const imagePromptMatch = pageContent.match(imagePromptRegex);
        
        let cleanContent = pageContent;
        let imagePrompt = '';
        
        if (imagePromptMatch) {
          cleanContent = pageContent.replace(imagePromptRegex, '').trim();
          imagePrompt = imagePromptMatch[1].trim();
        }
        
        foundPages.push({
          number: pageNumber,
          content: cleanContent,
          imagePrompt: imagePrompt
        });
      }
      
      if (foundPages.length > 0) {
        // API'den gelen sayfaları kullan
        foundPages.sort((a, b) => a.number - b.number);
        
        foundPages.forEach((page, index) => {
    pages.push({
      id: uuidv4(),
            pageNumber: page.number,
            content: page.content,
            title: page.number === 1 ? storyData.title : 
                   page.number === foundPages.length ? 'Son Sayfa' :
                   `Sayfa ${page.number}`,
            isTitle: page.number === 1 || page.number === foundPages.length,
            imagePrompt: page.imagePrompt
          });
        });
        
        // Eksik sayfaları tamamla
        while (pages.length < totalPageCount) {
          const missingPageNumber = pages.length + 1;
      pages.push({
        id: uuidv4(),
            pageNumber: missingPageNumber,
            content: missingPageNumber === totalPageCount ? 'Son Sayfa' : `Sayfa ${missingPageNumber} içeriği`,
            title: missingPageNumber === totalPageCount ? 'Son Sayfa' : `Sayfa ${missingPageNumber}`,
            isTitle: missingPageNumber === totalPageCount
          });
        }
      } else {
        // API etiketleri yoksa manuel bölme yap
        console.log('API etiketleri bulunamadı, manuel sayfa bölme yapılıyor');
        
        // İçeriği paragraflara ayır
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
        const contentPageCount = totalPageCount - 2; // 2 kapak hariç
        
        // Kapak sayfası
        pages.push({
          id: uuidv4(),
          pageNumber: 1,
          content: `${storyData.title || 'Hikaye Başlığı'}\n\nYazar: ${storyData.authorName}`,
          title: storyData.title || 'Hikaye Başlığı',
          isTitle: true,
          imagePrompt: 'Kitap kapağı görseli'
        });
        
        // İçerik sayfaları
        const paragraphsPerPage = Math.max(1, Math.ceil(paragraphs.length / contentPageCount));
        
        for (let i = 0; i < contentPageCount; i++) {
          const startIdx = i * paragraphsPerPage;
          const endIdx = Math.min(startIdx + paragraphsPerPage, paragraphs.length);
          const pageContent = paragraphs.slice(startIdx, endIdx).join('\n\n');
          
      pages.push({
        id: uuidv4(),
            pageNumber: i + 2,
            content: pageContent || `Bu hikayenin ${i + 1}. sayfasının içeriğidir.`,
            title: `Sayfa ${i + 2}`,
            imagePrompt: `Sayfa ${i + 2} için görsel: ${pageContent.substring(0, 100)}...`
          });
        }
        
        // Son kapak sayfası
        pages.push({
          id: uuidv4(),
          pageNumber: totalPageCount,
          content: 'Son\n\nHikayenin sonu',
          title: 'Son Sayfa',
          isTitle: true,
          isBackCoverPage: true, // Son sayfa olarak işaretle
          imagePrompt: 'Kitap arka kapağı'
      });
    }
    
    setStoryData(prev => ({ ...prev, pages }));
      console.log(`Hikaye ${pages.length} sayfaya bölündü. Her sayfada yaklaşık ${wordsPerPage} kelime hedeflendi.`);
      
    } catch (error) {
      console.error('Sayfa organizasyon hatası:', error);
      toast.error('Sayfalar organize edilirken hata oluştu');
    }
  };

  // Sayfa için görsel oluştur - Layout tipine göre - GÜNCELLENMIŞ
  const generateImageForPage = async (pageIndex: number) => {
    try {
    const page = storyData.pages[pageIndex];
      if (!page) return;

      // Layout tipine göre görsel stratejisi belirle
      const layoutType = storyData.pageLayout || TemplateType.CLASSIC;
      
      if (layoutType === TemplateType.CLASSIC) {
        // Klasik mod: Her sayfa için ayrı görsel
        console.log(`Klasik mod: Sayfa ${pageIndex + 1} için görsel oluşturuluyor`);
        const prompt = `${page.content.substring(0, 200)}... çocuk kitabı illüstrasyonu`;
        const imageUrl = await generateTemporaryImage(prompt);
        
        setStoryData(prev => ({
          ...prev,
          pages: prev.pages.map((p, index) => 
            index === pageIndex ? { ...p, image: imageUrl } : p
          )
        }));

        return imageUrl;
      } else if (layoutType === TemplateType.PANORAMIC) {
        // Panoramik mod: İki sayfa için bir görsel
        const isLeftPage = pageIndex % 2 === 1; // Tek sayfa numaraları sol sayfa (1, 3, 5...)
        const isRightPage = pageIndex % 2 === 0 && pageIndex > 0; // Çift sayfa numaraları sağ sayfa (2, 4, 6...)
        
        if (isLeftPage) {
          // Sol sayfa için görsel oluştur ve bir sonraki sayfaya da kopyala
          console.log(`Panoramik mod: Sayfa ${pageIndex + 1}-${pageIndex + 2} için paylaşılan görsel oluşturuluyor`);
          const combinedContent = `${page.content} ${storyData.pages[pageIndex + 1]?.content || ''}`;
          const prompt = `${combinedContent.substring(0, 200)}... çocuk kitabı panoramik illüstrasyon`;
          const imageUrl = await generateTemporaryImage(prompt);
          
          setStoryData(prev => ({
            ...prev,
            pages: prev.pages.map((p, index) => 
              index === pageIndex || index === pageIndex + 1 ? { ...p, image: imageUrl } : p
            )
          }));

          return imageUrl;
        } else if (isRightPage && !storyData.pages[pageIndex].image) {
          // Sağ sayfa ama henüz görseli yok - sol sayfanın görselini kullan
          const leftPageImage = storyData.pages[pageIndex - 1]?.image;
          if (leftPageImage) {
            setStoryData(prev => ({
              ...prev,
              pages: prev.pages.map((p, index) => 
                index === pageIndex ? { ...p, image: leftPageImage } : p
              )
            }));
          }
        }
      }
    } catch (error) {
      console.error('Görsel oluşturma hatası:', error);
      return null;
    }
  };

  // Tüm sayfalar için görsel oluştur - Layout tipine göre
  const generateAllImages = async () => {
    setIsLoading(true);
    showNotification('Tüm sayfalar için görseller oluşturuluyor...', 'info');
    
    try {
      const layoutType = storyData.pageLayout || TemplateType.CLASSIC;
      
      if (layoutType === TemplateType.CLASSIC) {
        // Klasik mod: Her sayfa için ayrı görsel (toplam 16+2=18 görsel)
        console.log(`Klasik mod: ${storyData.pages.length} sayfa için ${storyData.pages.length} görsel oluşturulacak`);
        
        for (let i = 0; i < storyData.pages.length; i++) {
          await generateImageForPage(i);
          setCurrentImagePageIndex(i);
          
          // Kullanıcıya ilerleme göster
          showNotification(`Sayfa ${i + 1}/${storyData.pages.length} görseli oluşturuldu`, 'info');
          
          // API limitlerini aşmamak için kısa bekle
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        showNotification(`Klasik mod: ${storyData.pages.length} görsel başarıyla oluşturuldu!`, 'success');
        
      } else if (layoutType === TemplateType.PANORAMIC) {
        // Panoramik mod: İki sayfa için bir görsel (16+2 sayfa için 9 görsel)
        // Kapak sayfası (1) + 8 çift sayfa grubu (2-3, 4-5, 6-7, 8-9, 10-11, 12-13, 14-15, 16-17) + Son kapak (18)
        
        console.log(`Panoramik mod: ${storyData.pages.length} sayfa için yaklaşık ${Math.ceil(storyData.pages.length / 2)} görsel oluşturulacak`);
        
        for (let i = 0; i < storyData.pages.length; i += 2) {
          // Her iki sayfada bir görsel oluştur
          await generateImageForPage(i);
          
          const groupNumber = Math.floor(i / 2) + 1;
          showNotification(`Sayfa grubu ${groupNumber} görseli oluşturuldu`, 'info');
          
          // API limitlerini aşmamak için kısa bekle
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        const totalImages = Math.ceil(storyData.pages.length / 2);
        showNotification(`Panoramik mod: ${totalImages} paylaşılan görsel başarıyla oluşturuldu!`, 'success');
      }
      
    } catch (error) {
      console.error('Toplu görsel oluşturma hatası:', error);
      showNotification('Görsel oluşturma sırasında hata oluştu', 'error');
    } finally {
      setIsLoading(false);
      setCurrentImagePageIndex(-1);
    }
  };

  // Hikaye stilini ayarla
  const setStoryStyle = (style: ThemeStyle) => {
    setStoryData(prev => ({ ...prev, style }));
    showNotification(`Tema "${
      style === ThemeStyle.CHILDREN ? 'Çocuk Masalı' :
      style === ThemeStyle.MODERN ? 'Modern' :
      style === ThemeStyle.FANTASY ? 'Fantastik' :
      style === ThemeStyle.ADVENTURE ? 'Macera' : style
    }" seçildi ve önizlemeye uygulandı`, 'success');
  };

  // Kapak stilini ayarla
  const setCoverStyle = (coverStyle: 'light' | 'dark' | 'colorful' | 'minimal') => {
    setStoryData(prev => ({ ...prev, coverStyle }));
    showNotification(`Kapak stili "${
      coverStyle === 'light' ? 'Açık' :
      coverStyle === 'dark' ? 'Koyu' :
      coverStyle === 'colorful' ? 'Renkli' :
      coverStyle === 'minimal' ? 'Minimal' : coverStyle
    }" seçildi ve önizlemeye uygulandı`, 'success');
  };

  // Sayfa düzenini ayarla
  const setPageLayout = (layout: TemplateType) => {
    setStoryData(prev => ({ ...prev, pageLayout: layout }));
    showNotification(`Sayfa düzeni "${
      layout === TemplateType.CLASSIC ? 'Klasik' :
      layout === TemplateType.PANORAMIC ? 'Panoramik' : layout
    }" seçildi ve önizlemeye uygulandı`, 'success');
  };

  // Render step indicator fonksiyonunu burada tanımlıyoruz
  const renderStepIndicator = () => {
    const steps = [
      { id: StoryCreationStep.USER_TYPE_SELECTION, label: 'Kullanıcı Tipi' },
      { id: StoryCreationStep.IDEA_CREATION, label: 'Hikaye Fikri' },
      { id: StoryCreationStep.STORY_WRITING, label: 'Hikaye Yazımı' },
      { id: StoryCreationStep.STYLE_SELECTION, label: 'Stil ve Düzen' },
      { id: StoryCreationStep.IMAGE_CREATION, label: 'Görseller' },
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

  // Hikayeyi kaydet ve yayınla - DATABASE ENTEGRASYONU
  const publishStory = async () => {
    if (!user) {
      showNotification('Hikaye yayınlamak için giriş yapmalısınız', 'error');
      return;
    }
    
    if (!storyData.title.trim()) {
      showNotification('Hikayenize bir başlık vermelisiniz', 'error');
      return;
    }
    
    if (storyData.pages.length === 0) {
      showNotification('Yayınlamak için en az bir sayfa oluşturmalısınız', 'error');
      return;
    }
    
    setIsLoading(true);
    showNotification('Hikayeniz yayınlanıyor...', 'info');
    
    try {
      // Önce taslak olarak kaydet
      await saveStoryAsDraft();
      
      // Sonra yayınla
      const publishResult = await storyDb.stories.publishStory(storyData.id);
      
      if (!publishResult.success) {
        throw new Error(publishResult.error || 'Hikaye yayınlanamadı');
      }
      
      // State'i güncelle
      setStoryData(prev => ({ 
        ...prev, 
        published: true 
      }));
      
      showNotification('🎉 Hikayeniz başarıyla yayınlandı!', 'success');
      
      // Kullanıcıyı bilgilendir
      setTimeout(() => {
        showNotification('Hikayeniz artık StoryVista\'da herkes tarafından görülebilir', 'info');
      }, 2000);
      
    } catch (error) {
      console.error('Hikaye yayınlama hatası:', error);
      showNotification(
        error instanceof Error ? error.message : 'Hikaye yayınlanırken bir hata oluştu', 
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Input değişikliklerini işle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoryData(prev => ({ ...prev, [name]: value }));
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
            className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Ne kadar yardıma ihtiyacın var?
            </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Size en uygun deneyimi sunmak için lütfen seçim yapın
              </p>
            </div>
            
            {/* Ortalanmış ve düzenli kullanıcı tipi seçimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center max-w-3xl mx-auto">
              {Object.values(UserExperienceType).map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUserTypeSelection(type)}
                  className={`p-8 rounded-xl border-2 transition-all duration-300 text-left h-48 flex flex-col justify-between ${
                    storyData.userType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="text-3xl mb-4">
                      {type === UserExperienceType.STANDARD ? '🚀' : '💎'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                      {type === UserExperienceType.STANDARD ? 'Standart Kullanıcı' : 'Premium Kullanıcı'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {type === UserExperienceType.STANDARD 
                        ? 'Temel hikaye oluşturma özellikleri ile yaratıcılığınızı keşfedin'
                        : 'Gelişmiş özellikler ve sınırsız erişim ile profesyonel hikayeler oluşturun'
                      }
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {type === UserExperienceType.STANDARD ? 'Hemen Başla' : 'Premium Deneyim'}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      storyData.userType === type 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 dark:border-gray-500'
                    }`} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* İlerleme butonu */}
            {storyData.userType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => setCurrentStep(StoryCreationStep.IDEA_CREATION)}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Devam Et →
                </button>
              </motion.div>
            )}
          </motion.div>
        );
        
      case StoryCreationStep.IDEA_CREATION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Hikaye Fikrini Paylaş
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Hikayenin temel unsurlarını girin. İstediğiniz kadar düzenleme yapabilirsiniz.
              </p>
              
              {/* Yardım Al butonu */}
              <div className="text-center mb-6">
                <button
                  onClick={generateMockStory}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  🎲 Yardım Al - Rastgele Hikaye Fikri
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Esinlenmeniz için hazır hikaye fikirlerinden birini seçer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hikaye Başlığı
                </label>
                <input
                  type="text"
                  name="title"
                  value={storyData.title}
                  onChange={(e) => {
                    setStoryData(prev => ({ ...prev, title: e.target.value }));
                    // OTOMATİK GEÇİŞ KALDIRILDI - kullanıcı manuel kontrol
                  }}
                  onKeyDown={(e) => {
                    // Enter tuşuna basıldığında form submit'ini engelle
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Örn: Ayşe'nin Orman Macerası"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ana Karakter
                </label>
                <input
                  type="text"
                  name="character"
                  value={storyData.character}
                  onChange={(e) => {
                    setStoryData(prev => ({ ...prev, character: e.target.value }));
                    // OTOMATİK GEÇİŞ KALDIRILDI
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Örn: Meraklı bir kız"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mekan/Ortam
                </label>
                <input
                  type="text"
                  name="setting"
                  value={storyData.setting}
                  onChange={(e) => {
                    setStoryData(prev => ({ ...prev, setting: e.target.value }));
                    // OTOMATİK GEÇİŞ KALDIRILDI
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Örn: Büyülü orman"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yazar Adı
                </label>
                <input
                  type="text"
                  name="authorName"
                  value={storyData.authorName}
                  onChange={(e) => {
                    setStoryData(prev => ({ ...prev, authorName: e.target.value }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Sizin adınız"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ek Detaylar (İsteğe bağlı)
              </label>
              <textarea
                name="description"
                value={storyData.description}
                onChange={(e) => {
                  setStoryData(prev => ({ ...prev, description: e.target.value }));
                }}
                placeholder="Hikayede olmasını istediğiniz özel detaylar, karakterin özellikleri veya hikayenin gidişatı hakkında notlar..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Sayfa Sayısı Seçimi */}
            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Sayfa Sayısı Seçimi
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Hikayenizin kaç sayfa olmasını istiyorsunuz? (+2 format: hikaye sayfaları + ön ve arka kapak)
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {[6, 8, 10, 12, 14, 16, 18, 20, 22, 24].map((count) => (
                  <button
                    key={count}
                    onClick={() => setStoryData(prev => ({ ...prev, pageCount: count }))}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      storyData.pageCount === count 
                        ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold">{count}+2</div>
                      <div className="text-xs opacity-75">
                        {count === 6 ? 'Kısa' : count === 12 ? 'Orta' : count >= 18 ? 'Uzun' : 'Normal'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Seçilen:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {storyData.pageCount}+2 sayfa ({storyData.pageCount} hikaye + 2 kapak = {storyData.pageCount + 2} toplam)
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Tahmini okuma:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {Math.ceil((storyData.pageCount * 50) / 200)} dakika
                  </span>
                </div>
              </div>
            </div>

            {/* Manuel ilerleme kontrolü */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(StoryCreationStep.USER_TYPE_SELECTION)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                ← Geri
              </button>
              
              <button
                onClick={() => {
                  // Minimum gereksinimler kontrolü
                  if (storyData.title.trim() && storyData.character.trim()) {
                    setCurrentStep(StoryCreationStep.STORY_WRITING);
                  } else {
                    showNotification('Lütfen en azından başlık ve karakter bilgisi girin', 'warning');
                  }
                }}
                disabled={!storyData.title.trim() || !storyData.character.trim()}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  storyData.title.trim() && storyData.character.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }`}
              >
                Devam Et →
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
                  <p className="font-medium">{storyData.title || 'Belirtilmemiş'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ana Karakter</p>
                  <p className="font-medium">{storyData.character || storyData.mainCharacter || 'Belirtilmemiş'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mekan</p>
                  <p className="font-medium">{storyData.setting || 'Belirtilmemiş'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Yazar</p>
                  <p className="font-medium">{storyData.authorName || 'Belirtilmemiş'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg md:col-span-2">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ek Detaylar</p>
                  <p className="font-medium">{storyData.description || 'Ek detay belirtilmemiş'}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sayfa Sayısı</p>
                  <p className="font-medium">{storyData.pageCount || 6}+2 sayfa (toplam {(storyData.pageCount || 6) + 2} sayfa)</p>
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
                
                {/* Debug bilgileri */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <p className="text-blue-700 dark:text-blue-300">
                    Gemini AI ile {storyData.pageCount + 2} sayfalık "{storyData.title || 'İsimsiz Hikaye'}" oluşturuluyor...
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 mt-1">
                    Karakter: {storyData.character}, Mekan: {storyData.setting}
                  </p>
                </div>
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
                  <div className="flex-grow overflow-auto p-4">
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
                    onClick={() => setCoverStyle("light")}
                  />
                  <CoverStyleCard 
                    title="Koyu" 
                    description="Koyu renkli, ciddi ve zarif tasarım" 
                    theme="dark"
                    isSelected={storyData.coverStyle === "dark"}
                    onClick={() => setCoverStyle("dark")}
                  />
                  <CoverStyleCard 
                    title="Renkli" 
                    description="Canlı ve dikkat çekici renkli kapak" 
                    theme="colorful"
                    isSelected={storyData.coverStyle === "colorful" || !storyData.coverStyle}
                    onClick={() => setCoverStyle("colorful")}
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Sayfa Düzeni</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PageLayoutCard 
                    title="Klasik Düzen" 
                    description="Her sayfa için ayrı görsel - Resim üstte, metin altta olan geleneksel düzen" 
                    layout={TemplateType.CLASSIC}
                    isSelected={storyData.pageLayout === TemplateType.CLASSIC || !storyData.pageLayout}
                    onClick={() => setPageLayout(TemplateType.CLASSIC)}
                  />
                  <PageLayoutCard 
                    title="Panoramik Düzen" 
                    description="İki sayfa için bir görsel - Geniş format tam sayfa resim üzerinde metin" 
                    layout={TemplateType.PANORAMIC}
                    isSelected={storyData.pageLayout === TemplateType.PANORAMIC}
                    onClick={() => setPageLayout(TemplateType.PANORAMIC)}
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
      
      case StoryCreationStep.IMAGE_CREATION:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Görsel Oluşturma</h1>
            
            <div className="mb-4 md:mb-6 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <p>Seçtiğiniz stil ve düzen temasına göre hikayeniz için görsel oluşturun. Bu görsel tüm sayfalarınızda kullanılacaktır.</p>
            </div>
            
            {/* Ana görsel oluşturma alanı */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-medium text-sm md:text-base">
                  Hikaye Ana Görseli
                    </h3>
                <div className="flex items-center space-x-2 text-xs">
                  <span>Düzen: {
                    storyData.pageLayout === TemplateType.CLASSIC ? 'Klasik' :
                    storyData.pageLayout === TemplateType.PANORAMIC ? 'Panoramik' : 'Klasik'
                  }</span>
                  <span>•</span>
                  <span>Stil: {
                    storyData.style === ThemeStyle.CHILDREN ? 'Çocuk Masalı' :
                    storyData.style === ThemeStyle.MODERN ? 'Modern' :
                    storyData.style === ThemeStyle.FANTASY ? 'Fantastik' :
                    storyData.style === ThemeStyle.ADVENTURE ? 'Macera' : 'Çocuk Masalı'
                  }</span>
                      </div>
                  </div>
                  
                  <div className="p-4">
                {storyData.coverImage ? (
                      <div className="relative">
                        <img 
                      src={storyData.coverImage} 
                      alt="Hikaye ana görseli"
                      className="w-full h-96 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 flex space-x-2">
                          <button
                        onClick={async () => {
                          const prompt = `${storyData.storyIdea} - ${storyData.style} stilinde, ${storyData.mainCharacter} karakteri ile ${storyData.setting} mekanında`;
                          const imageUrl = await generateTemporaryImage(prompt);
                          setStoryData(prev => ({
                            ...prev,
                            coverImage: imageUrl,
                            pages: prev.pages.map((page, index) => 
                              index === 0 ? { ...page, image: imageUrl } : page
                            )
                          }));
                        }}
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
                              setStoryData(prev => ({ 
                                ...prev, 
                            coverImage: undefined,
                            pages: prev.pages.map((page, index) => 
                              index === 0 ? { ...page, image: undefined } : page
                            )
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
                    <div className="relative w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {isLoading ? (
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
                          <button
                        onClick={async () => {
                          setIsLoading(true);
                          showNotification('Ana görsel oluşturuluyor...', 'info');
                          
                          try {
                            const prompt = `${storyData.storyIdea} - ${storyData.style} stilinde, ${storyData.mainCharacter} karakteri ile ${storyData.setting} mekanında`;
                            const imageUrl = await generateTemporaryImage(prompt);
                            
                            setStoryData(prev => ({
                              ...prev,
                              coverImage: imageUrl,
                              pages: prev.pages.map((page, index) => 
                                index === 0 ? { ...page, image: imageUrl } : page
                              )
                            }));
                            
                            showNotification('Ana görsel başarıyla oluşturuldu!', 'success');
                          } catch (error) {
                            console.error('Görsel oluşturma hatası:', error);
                            showNotification('Görsel oluşturulamadı.', 'error');
                          } finally {
                            setIsLoading(false);
                          }
                            }}
                            disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                        {isLoading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Oluşturuluyor...
                              </>
                            ) : (
                          'Ana Görsel Oluştur'
                            )}
                          </button>
                      
                      <button
                        onClick={generateAllImages}
                        disabled={isLoading || storyData.pages.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? 'Oluşturuluyor...' : 
                         storyData.pageLayout === TemplateType.PANORAMIC 
                           ? `Tüm Panoramik Görselleri Oluştur (${Math.ceil(storyData.pages.length / 2)} görsel)`
                           : `Tüm Sayfa Görsellerini Oluştur (${storyData.pages.length} görsel)`
                        }
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
                                    setStoryData(prev => ({ 
                                      ...prev, 
                                  coverImage: reader.result as string,
                                  pages: prev.pages.map((page, index) => 
                                    index === 0 ? { ...page, image: reader.result as string } : page
                                  )
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
            
            <div className={`p-4 rounded-lg ${
              storyData.pageLayout === TemplateType.PANORAMIC 
                ? 'bg-purple-50 dark:bg-purple-900/20' 
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <h3 className="font-medium mb-2">
                {storyData.pageLayout === TemplateType.PANORAMIC ? 'Panoramik Düzen Nasıl Çalışır?' : 'Klasik Düzen Nasıl Çalışır?'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {storyData.pageLayout === TemplateType.PANORAMIC ? (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">2:1</span>
            </div>
                      <p>İki sayfa tek görsel paylaşır</p>
            </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">Sol</span>
                      </div>
                      <p>Sol sayfa sadece metin</p>
                      </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">Sağ</span>
                      </div>
                      <p>Sağ sayfa tam görsel</p>
                      </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">1:1</span>
                </div>
                      <p>Her sayfa kendi görselini alır</p>
              </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">Üst</span>
                </div>
                      <p>Görsel sayfa üstünde</p>
              </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/30 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">Alt</span>
                </div>
                      <p>Metin sayfa altında</p>
                    </div>
                  </>
                )}
              </div>
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
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-8 text-center">
                                <h3 className="text-white text-xl font-bold mb-2">{storyData.title}</h3>
                                <p className="text-white/80 text-sm">{storyData.authorName}</p>
                                <p className="text-white/70 text-xs mt-2">StoryVista</p>
                              </div>
                            )}
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
  const NotificationComponent = () => {
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

  // Önizleme adımını render et - YENİDEN YAZILDI
  const renderPreviewPublishStep = () => {
    // Dijital kitap deneyimi için sayfa hesaplama
    const isSpreadView = currentPreviewPageIndex > 0 && currentPreviewPageIndex < storyData.pages.length - 1;
    const leftPageIndex = isSpreadView ? currentPreviewPageIndex : null;
    const rightPageIndex = isSpreadView ? currentPreviewPageIndex + 1 : null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-6xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Kitap Önizleme</h2>
          <div className="flex space-x-3">
                <button 
              onClick={saveStoryAsDraft}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                </button>
            <button
              onClick={publishStory}
              className={`px-4 py-2 rounded-lg transition-colors ${
                storyData.published
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              disabled={isLoading || storyData.published}
            >
              {isLoading ? 'Yayınlanıyor...' : 
               storyData.published ? 'Yayınlandı ✓' : 'Hikayeyi Yayınla'}
            </button>
          </div>
        </div>

        {/* Dijital Kitap Önizleme */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-8 min-h-[600px] flex items-center justify-center">
          <div className="relative">
            {/* Kapak sayfası - Tek sayfa */}
            {currentPreviewPageIndex === 0 && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: '350px', height: '450px' }}>
                        {storyData.coverImage ? (
                          <img 
                            src={storyData.coverImage} 
                            alt="Kitap Kapağı" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-4">{storyData.title || 'Hikaye Başlığı'}</h2>
                      <p className="text-lg opacity-90">{storyData.authorName || 'Yazar'}</p>
                      <p className="text-sm opacity-70 mt-2">StoryVista</p>
                    </div>
                  </div>
                )}
                {/* Kitap kenarı efekti */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20"></div>
                          </div>
                        )}
                        
            {/* Son kapak sayfası - Tek sayfa */}
            {currentPreviewPageIndex === storyData.pages.length - 1 && currentPreviewPageIndex > 0 && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: '350px', height: '450px' }}>
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center p-8">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-4">Son</h3>
                    <p className="text-sm opacity-90">{storyData.title}</p>
                    <p className="text-xs opacity-70 mt-2">StoryVista</p>
                          </div>
                        </div>
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-black/20"></div>
              </div>
            )}

            {/* İçerik sayfaları - İkişerli görünüm */}
            {isSpreadView && leftPageIndex && rightPageIndex && (
              <div className="flex gap-1">
                {/* Sol sayfa */}
                <div className="relative rounded-l-lg overflow-hidden shadow-2xl" style={{ width: '350px', height: '450px' }}>
                  <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
                    {/* Panoramik düzen kontrol */}
                    {storyData.pageLayout === TemplateType.PANORAMIC ? (
                      // Panoramik: Sol sayfa sadece metin
                      <div className="h-full p-6 flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                          {storyData.pages[leftPageIndex]?.title || `Sayfa ${leftPageIndex + 1}`}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {storyData.pages[leftPageIndex]?.content}
                        </p>
                        <div className="absolute bottom-4 left-4 text-gray-500 dark:text-gray-400 text-xs">
                          {leftPageIndex + 1}
                        </div>
                      </div>
                    ) : (
                      // Klasik: Sol sayfa üstte görsel, altta metin
                      <>
                        <div className="h-1/2 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          {storyData.pages[leftPageIndex]?.image || storyData.coverImage ? (
                            <img 
                              src={storyData.pages[leftPageIndex]?.image || storyData.coverImage} 
                              alt={`Sayfa ${leftPageIndex + 1} görseli`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">Görsel yok</span>
                          </div>
                          )}
                        </div>
                        <div className="h-1/2 p-4 overflow-y-auto">
                          <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">
                            {storyData.pages[leftPageIndex]?.title || `Sayfa ${leftPageIndex + 1}`}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                            {storyData.pages[leftPageIndex]?.content}
                          </p>
                          <div className="absolute bottom-2 left-2 text-gray-500 dark:text-gray-400 text-xs">
                            {leftPageIndex + 1}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Sol sayfa kenarı */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10"></div>
                </div>

                {/* Sağ sayfa */}
                <div className="relative rounded-r-lg overflow-hidden shadow-2xl" style={{ width: '350px', height: '450px' }}>
                  <div className="h-full bg-white dark:bg-gray-800 flex flex-col">
                    {storyData.pageLayout === TemplateType.PANORAMIC ? (
                      // Panoramik: Sağ sayfa tam görsel
                      <div className="h-full relative overflow-hidden">
                        {storyData.coverImage ? (
                          <img 
                            src={storyData.coverImage} 
                            alt="Panoramik görsel"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                            <span className="text-white text-sm">Panoramik Görsel</span>
                          </div>
                        )}
                        <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
                          {rightPageIndex + 1}
                        </div>
                      </div>
                    ) : (
                      // Klasik: Sağ sayfa da üstte görsel, altta metin
                      <>
                        <div className="h-1/2 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          {storyData.pages[rightPageIndex]?.image || storyData.coverImage ? (
                            <img 
                              src={storyData.pages[rightPageIndex]?.image || storyData.coverImage} 
                              alt={`Sayfa ${rightPageIndex + 1} görseli`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400">Görsel yok</span>
                            </div>
                          )}
                        </div>
                        <div className="h-1/2 p-4 overflow-y-auto">
                          <h3 className="text-sm font-semibold mb-2 text-gray-800 dark:text-white">
                            {storyData.pages[rightPageIndex]?.title || `Sayfa ${rightPageIndex + 1}`}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                            {storyData.pages[rightPageIndex]?.content}
                          </p>
                          <div className="absolute bottom-2 right-2 text-gray-500 dark:text-gray-400 text-xs">
                            {rightPageIndex + 1}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {/* Sağ sayfa kenarı */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-black/10"></div>
                </div>
                          </div>
                        )}
                        
            {/* Orta sayfa için tek sayfa görünümü (gerekirse) */}
            {currentPreviewPageIndex > 0 && currentPreviewPageIndex === storyData.pages.length - 1 && storyData.pages.length % 2 === 0 && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: '350px', height: '450px' }}>
                <div className="h-full bg-white dark:bg-gray-800 p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    {storyData.pages[currentPreviewPageIndex]?.title || `Sayfa ${currentPreviewPageIndex + 1}`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {storyData.pages[currentPreviewPageIndex]?.content}
                  </p>
                  <div className="absolute bottom-4 right-4 text-gray-500 dark:text-gray-400 text-xs">
                    {currentPreviewPageIndex + 1}
                  </div>
                        </div>
                      </div>
                    )}
          </div>
                  </div>
                  
                  {/* Sayfa kontrolleri */}
        <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => {
                        if (currentPreviewPageIndex > 0) {
                // İkişerli sayfa sistemine göre geri git
                if (currentPreviewPageIndex === storyData.pages.length - 1 && storyData.pages.length > 2) {
                  // Son sayfadaysak, ikişerli görünümün son sayfasına git
                  setCurrentPreviewPageIndex(Math.max(1, storyData.pages.length - 3));
                } else if (currentPreviewPageIndex > 1) {
                  // İkişerli görünümde 2 sayfa geri git
                  setCurrentPreviewPageIndex(Math.max(1, currentPreviewPageIndex - 2));
                } else {
                  // Kapak sayfasına git
                  setCurrentPreviewPageIndex(0);
                }
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
            Önceki
                    </button>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1 justify-center mb-2">
              {/* Sayfa göstergesi - dijital kitap mantığına göre */}
                          <button 
                onClick={() => setCurrentPreviewPageIndex(0)}
                className={`w-3 h-3 rounded-full ${currentPreviewPageIndex === 0 ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                title="Kapak"
              />
              {storyData.pages.slice(1, -1).map((_, index) => {
                const pageIndex = index + 1;
                const isActive = currentPreviewPageIndex === pageIndex || currentPreviewPageIndex === pageIndex + 1;
                return (
                  <button 
                    key={pageIndex}
                    onClick={() => setCurrentPreviewPageIndex(pageIndex)}
                    className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                    title={`Sayfa ${pageIndex}-${pageIndex + 1}`}
                  />
                );
              }).filter((_, index) => index % 2 === 0)} {/* Sadece çift indexleri göster */}
              {storyData.pages.length > 1 && (
                <button 
                  onClick={() => setCurrentPreviewPageIndex(storyData.pages.length - 1)}
                  className={`w-3 h-3 rounded-full ${currentPreviewPageIndex === storyData.pages.length - 1 ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                  title="Son kapak"
                />
              )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentPreviewPageIndex === 0 ? 'Kapak Sayfası' : 
               currentPreviewPageIndex === storyData.pages.length - 1 ? 'Son Kapak' :
               isSpreadView ? `Sayfa ${leftPageIndex + 1}-${rightPageIndex + 1}` :
               `Sayfa ${currentPreviewPageIndex + 1}`}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        if (currentPreviewPageIndex < storyData.pages.length - 1) {
                if (currentPreviewPageIndex === 0) {
                  // Kapaktan ikişerli görünüme geç
                  setCurrentPreviewPageIndex(1);
                } else if (currentPreviewPageIndex < storyData.pages.length - 2) {
                  // İkişerli görünümde 2 sayfa ileri git
                  setCurrentPreviewPageIndex(Math.min(storyData.pages.length - 1, currentPreviewPageIndex + 2));
                } else {
                  // Son kapağa git
                  setCurrentPreviewPageIndex(storyData.pages.length - 1);
                }
              }
            }}
            disabled={currentPreviewPageIndex >= storyData.pages.length - 1}
                      className={`flex items-center px-4 py-2 rounded-lg ${
              currentPreviewPageIndex >= storyData.pages.length - 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
            Sonraki
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
        {/* Hikaye bilgileri ve yayınlama */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
              <h3 className="text-lg font-semibold mb-4">Hikaye Bilgileri</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={storyData.title}
                    onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yazar</label>
                  <input
                    type="text"
                    value={storyData.authorName}
                    onChange={(e) => setStoryData(prev => ({ ...prev, authorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
                </div>
                
            <div>
              <h3 className="text-lg font-semibold mb-4">İstatistikler</h3>
              <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                  <span>Toplam Sayfa:</span>
                      <span className="font-medium">{storyData.pages.length}</span>
                    </div>
                    <div className="flex justify-between">
                  <span>Sayfa Düzeni:</span>
                  <span className="font-medium">
                    {storyData.pageLayout === TemplateType.CLASSIC ? 'Klasik' : 'Panoramik'}
                  </span>
                    </div>
                    <div className="flex justify-between">
                  <span>Tahmini Okuma:</span>
                      <span className="font-medium">{Math.ceil(storyData.content.length / 1000)} dk</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
      </motion.div>
    );
  };

  // Ana render fonksiyonunda bildirim bileşenini ekleyelim ve case'leri güncelle
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-4 md:py-8">
      {/* Bildirim */}
      <AnimatePresence>
        {notificationMessage && <NotificationComponent />}
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
