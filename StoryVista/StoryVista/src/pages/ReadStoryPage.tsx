import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CommentSection from '../components/CommentSection';
import AudioPlayer from '../components/AudioPlayer';
import { useAuth } from '../lib/authContext';
import { getStory, getStoryPages, toggleLibrary } from '../lib/storyService';
import { supabase } from '../lib/supabase';
import StoryRating from '../components/StoryRating';
import { FaBookmark, FaRegBookmark, FaComments, FaPlay, FaPause, FaPlus, FaShare, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import BookReader from '../components/BookReader';
import Spinner from '../components/Spinner';

// Tipleri tanımlıyoruz
type ReadingMode = 'day' | 'night' | 'sepia';
type FontSize = 'small' | 'medium' | 'large';

interface Story {
  id: string;
  title: string;
  content: string;
  image_url: string;
  category: string;
  rating: number;
  author: {
    username: string;
    id: string;
  };
  created_at: string;
  audio_url?: string;
  estimated_read_time?: string;
}

interface StoryPage {
  id: string;
  story_id: string;
  page_number: number;
  content: string;
  image_url?: string;
  template?: string;
  is_cover_page?: boolean;
  is_back_cover_page?: boolean;
}

const ReadStoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [readingMode, setReadingMode] = useState<ReadingMode>('day');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [pagesContent, setPagesContent] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  
  // Hikaye verilerini yükleme
  useEffect(() => {
    if (id) {
      fetchStory(id);
      if (user) {
        checkUserLibrary(id);
      }
    }
  }, [id, user]);
  
  // Hikaye içeriğini sayfalara bölme
  useEffect(() => {
    if (storyPages && storyPages.length > 0) {
      const contentPages = storyPages.map(page => page.content);
      setPagesContent(contentPages);
      setTotalPages(contentPages.length - 1); // Kapak sayfası hariç
    } else if (story) {
      // Eğer sayfa yapısı yoksa, hikaye içeriğini paragraflar halinde bölüyoruz
      const paragraphs = story.content.trim().split('\n\n');
      
      // Her sayfada 3 paragraf olacak şekilde sayfalama yapıyoruz
      const paragraphsPerPage = 3;
      const pages: string[] = [];
      
      for (let i = 0; i < paragraphs.length; i += paragraphsPerPage) {
        pages.push(paragraphs.slice(i, i + paragraphsPerPage).join('\n\n'));
      }
      
      // En az 1 sayfa olmasını sağlayalım
      if (pages.length === 0) {
        pages.push(story.content);
      }
      
      setPagesContent(pages);
      setTotalPages(pages.length);
    }
  }, [story, storyPages]);
  
  const fetchStory = async (storyId: string) => {
    try {
      setLoading(true);
      
      // Hikaye bilgilerini getir
      const storyData = await getStory(storyId);
      
      if (!storyData) {
        throw new Error('Hikaye bulunamadı');
      }
      
      // Hikaye sayfalarını getir
      const pages = await getStoryPages(storyId);
      
      if (pages && pages.length > 0) {
        setStoryPages(pages);
      }
      
      // Hikaye verilerini formatla
      const formattedStory: Story = {
        id: storyData.id,
        title: storyData.title,
        content: storyData.content,
        image_url: storyData.image_url || "https://source.unsplash.com/random/1200x600/?story",
        category: storyData.category?.name || "Genel",
        rating: 0, // Değerlendirme verileri ayrıca getirilecek
        audio_url: storyData.audio_url,
        created_at: storyData.created_at || new Date().toISOString(),
        estimated_read_time: storyData.read_time ? `${storyData.read_time} dk` : '5 dk',
        author: {
          id: storyData.user_id,
          username: 'Yazar' // Yazar bilgileri ayrıca getirilecek
        }
      };
      
      // Yazar bilgilerini getir
      const { data: authorData, error: authorError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', storyData.user_id)
        .single();
      
      if (!authorError && authorData) {
        formattedStory.author.username = authorData.username || 'Yazar';
      }
      
      // Hikaye değerlendirmesini getir
      const { data: ratingData, error: ratingError } = await supabase
        .rpc('get_average_rating', { story_id_param: storyId });
      
      if (!ratingError && ratingData) {
        formattedStory.rating = parseFloat(ratingData) || 0;
      }
      
      setStory(formattedStory);
      setLoading(false);
    } catch (error) {
      console.error('Hikaye yüklenirken hata oluştu:', error);
      setLoading(false);
    }
  };
  
  const checkUserLibrary = async (storyId: string) => {
    if (!user) return;
    
    try {
      // Kullanıcının kütüphanesinde hikaye var mı kontrol et
      const { data, error } = await supabase
        .from('library')
        .select('*')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single();
      
      setInLibrary(!!data);
    } catch (error) {
      console.error('Kütüphane kontrolünde hata:', error);
    }
  };
  
  const handleToggleLibrary = async () => {
    if (!id || !user) {
      alert('Kütüphaneye eklemek için giriş yapmalısınız.');
      return;
    }
    
    try {
      // Kütüphaneye ekle/çıkar
      const result = await toggleLibrary(user.id, id);
      setInLibrary(result);
    } catch (error) {
      console.error('Kütüphane işleminde hata:', error);
    }
  };
  
  const sendMessage = () => {
    if (!user) {
      alert('Mesaj göndermek için giriş yapmalısınız.');
      return;
    }
    
    if (!story) return;
    
    // Mesaj gönderme formunu aç veya modal göster
    alert(`${story.author.username} adlı yazara mesaj göndermek için gerekli form burada açılacak.`);
  };
  
  // Font boyutunu CSS sınıfına dönüştürme
  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];
  
  // Okuma modunu CSS sınıfına dönüştürme
  const readingModeClass = {
    day: 'bg-white text-gray-900',
    night: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  }[readingMode];
  
  // Sayfa değiştirme işlevleri
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(curr => curr + 1);
      // Sayfa başına scroll
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(curr => curr - 1);
      // Sayfa başına scroll
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };
  
  // Belirli bir sayfaya gitme
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      // Sayfa başına scroll
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!story) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Hikaye Bulunamadı</h1>
        <p className="mb-6">Aradığınız hikaye bulunamadı veya bir hata oluştu.</p>
      </div>
    );
  }
  
  // Her sayfadaki paragrafları ayırma
  const currentPageParagraphs = pagesContent[currentPage]?.split('\n\n') || [];
  
  return (
    <div className={`pt-24 pb-16 min-h-screen ${readingModeClass}`}>
      {loading ? (
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 bg-sky-200 dark:bg-sky-800 rounded-full mb-4"></div>
            <div className="h-6 bg-sky-200 dark:bg-sky-800 rounded w-48 mb-3"></div>
            <div className="h-4 bg-sky-100 dark:bg-sky-900 rounded w-64"></div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4">
          {/* Kapak Sayfası - Animasyonlu geçiş */}
          <AnimatePresence mode="wait">
            {currentPage === 0 && (
              <motion.div 
                key="cover"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto mb-8"
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl mb-8">
                  <img 
                    src={story.image_url} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block px-3 py-1 mb-3 text-sm bg-sky-500 text-white rounded-full">
                      {story.category}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{story.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <span>{story.author.username}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{story.estimated_read_time}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{story.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span>{story.created_at}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mb-8">
                  <button 
                    onClick={() => setCurrentPage(1)}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-50 flex items-center"
                  >
                    <span>Okumaya Başla</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
            
            {currentPage > 0 && (
              <motion.div
                key={`page-${currentPage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto"
              >
                {/* Okuma kontrolü */}
                <div className="sticky top-20 z-10 flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-3 px-4 rounded-lg shadow-md mb-8">
                  <div className="flex gap-2 mr-6">
                    <button 
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} 
                      disabled={currentPage === 0}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 focus:outline-none"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setReadingMode(readingMode === 'day' ? 'night' : 'day')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 ml-auto focus:outline-none"
                    title={readingMode === 'day' ? 'Gece Modu' : 'Gündüz Modu'}
                  >
                    {readingMode === 'day' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex ml-4">
                    <button 
                      onClick={() => setFontSize('small')} 
                      className={`px-3 py-1 rounded-l-md ${fontSize === 'small' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      A<span className="text-xs">-</span>
                    </button>
                    <button 
                      onClick={() => setFontSize('medium')} 
                      className={`px-3 py-1 ${fontSize === 'medium' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      A
                    </button>
                    <button 
                      onClick={() => setFontSize('large')} 
                      className={`px-3 py-1 rounded-r-md ${fontSize === 'large' ? 'bg-sky-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      A<span className="text-xs">+</span>
                    </button>
                  </div>
                </div>
                
                {/* Hikaye içeriği */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-10">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">{currentPage === 1 ? story.title : `${story.title} - Sayfa ${currentPage}`}</h2>
                  <div className="flex items-center mb-8">
                    <div className="h-0.5 flex-grow bg-sky-100 dark:bg-sky-900/30"></div>
                    <span className="px-4 text-sm text-gray-500 dark:text-gray-400">{currentPage} / {totalPages}</span>
                    <div className="h-0.5 flex-grow bg-sky-100 dark:bg-sky-900/30"></div>
                  </div>
                  
                  <div className={`space-y-6 ${fontSizeClass}`}>
                    {currentPageParagraphs.map((paragraph, index) => (
                      <p key={index} className="leading-relaxed text-gray-800 dark:text-gray-200">
                        {paragraph.split(' ').map((word, i) => (
                          <span 
                            key={i}
                            className={`word-highlight inline-block mx-0.5`}
                            data-word-id={`p${index}-w${i}`}
                          >
                            {word}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
                
                {/* Sesli Dinleme Alanı */}
                <div className="bg-sky-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-10">
                  <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.06-.366m5.617-10.042a5 5 0 011.06-.366M3 4l9 16 9-16H3z" />
                    </svg>
                    Sesli Dinle
                  </h3>
                  <AudioPlayer 
                    audioUrl={story.audio_url} 
                    storyText={currentPageParagraphs.join('\n\n')} 
                    onWordHighlight={(wordId) => {
                      // Kelime vurgulamayı vurgula
                      const allWords = document.querySelectorAll('.word-highlight');
                      allWords.forEach(word => {
                        word.classList.remove('bg-sky-200', 'dark:bg-sky-800');
                      });
                      
                      const highlightedWord = document.querySelector(`[data-word-id="${wordId}"]`);
                      if (highlightedWord) {
                        highlightedWord.classList.add('bg-sky-200', 'dark:bg-sky-800');
                      }
                    }} 
                  />
                </div>
                
                {/* Sayfa navigasyonu */}
                <div className="flex justify-center items-center gap-3 mb-10">
                  <button 
                    onClick={() => setCurrentPage(0)}
                    className="p-2 text-sm text-sky-600 dark:text-sky-400 hover:underline flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Kapak
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                          currentPage === page 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  {currentPage < totalPages && (
                    <button 
                      onClick={nextPage}
                      className="p-2 text-sm text-sky-600 dark:text-sky-400 hover:underline flex items-center"
                    >
                      Sonraki
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Etkileşim bölümü - sayfanın sonunda */}
                {currentPage === totalPages && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-10">
                      <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Bu hikayeyi değerlendirin</h3>
                      
                      {/* Oylama */}
                      <div className="mb-8">
                        <StoryRating storyId={story.id} initialRating={story.rating} />
                      </div>
                      
                      {/* Paylaşım ve Kütüphaneye Ekleme */}
                      <div className="flex flex-wrap gap-4 mb-8">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 dark:bg-sky-800/30 dark:text-sky-300 rounded-md hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          Paylaş
                        </button>
                        <button 
                          className={`flex items-center gap-2 px-4 py-2 ${
                            inLibrary 
                              ? 'bg-green-600 text-white dark:bg-green-600' 
                              : 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300'
                          } rounded-md hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors`}
                          onClick={handleToggleLibrary}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          {inLibrary ? 'Kütüphanede' : 'Kütüphaneye Ekle'}
                        </button>
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                          onClick={sendMessage}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Yazara Mesaj Gönder
                        </button>
                      </div>
                      
                      {/* Yorumlar */}
                      <CommentSection storyId={story.id} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReadStoryPage; 