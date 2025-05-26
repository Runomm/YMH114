import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import BookPage from './BookPage';
import EditorToolbar from './EditorToolbar';
import PageNavigator from './PageNavigator';
import TemplateType from '../lib/templateType';

// Sayfa tipini tanımlama
export interface Page {
  id: string;
  content: string;
  image?: string;
  pageNumber: number;
  template?: TemplateType;
  title?: string;
  isCoverPage?: boolean;
  isBackCoverPage?: boolean;
  isSinglePage?: boolean; // Tek sayfa gösterimi için yeni özellik
}

interface BookEditorProps {
  pages: Page[];
  onUpdatePages: (pages: Page[]) => void;
  onSave?: () => void;
  onPublish?: () => void;
  coverImage?: string;
  bookTitle: string;
  authorName: string;
  selectedTemplate: TemplateType;
}

const BookEditor: React.FC<BookEditorProps> = ({
  pages,
  onUpdatePages,
  onSave,
  onPublish,
  coverImage,
  bookTitle,
  authorName,
  selectedTemplate
}) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isOpenBook, setIsOpenBook] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [activeTool, setActiveTool] = useState<'text' | 'image' | 'ai'>('text');
  const [showToolbar, setShowToolbar] = useState(true);
  const [pageTransition, setPageTransition] = useState<'next' | 'prev' | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Kitabı açma animasyonu
    const timer = setTimeout(() => {
      setIsOpenBook(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Aktif olan sayfa çiftini hesapla (spread)
  const getActivePages = () => {
    // Eğer mevcut sayfa kapak veya arka kapaksa tek sayfa göster
    const currentIndex = currentSpread * 2;
    
    // Kapak sayfası için
    if (currentIndex === 0 && pages[0]?.isCoverPage && pages[0]?.isSinglePage) {
      return {
        leftPage: pages[0],
        rightPage: null
      };
    }
    
    // Arka kapak sayfası için
    if (currentIndex >= pages.length - 2 && pages[pages.length - 1]?.isBackCoverPage && pages[pages.length - 1]?.isSinglePage) {
      return {
        leftPage: null,
        rightPage: pages[pages.length - 1]
      };
    }
    
    // Normal çift sayfa gösterimi
    return {
      leftPage: pages[currentIndex] || null,
      rightPage: pages[currentIndex + 1] || null
    };
  };

  // Sayfa içeriğini güncelle
  const updatePageContent = (pageId: string, newContent: string) => {
    const updatedPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, content: newContent } 
        : page
    );
    onUpdatePages(updatedPages);
  };

  // Sayfaya görsel ekle
  const addImageToPage = (pageId: string, imageUrl: string) => {
    const updatedPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, image: imageUrl } 
        : page
    );
    onUpdatePages(updatedPages);
  };

  // Yeni sayfa ekle
  const addNewSpread = () => {
    const lastPageNumber = pages.length > 0 
      ? pages[pages.length - 1].pageNumber 
      : 0;
    
    const leftPage: Page = {
      id: uuidv4(),
      content: '',
      pageNumber: lastPageNumber + 1,
      template: selectedTemplate
    };
    
    const rightPage: Page = {
      id: uuidv4(),
      content: '',
      pageNumber: lastPageNumber + 2,
      template: selectedTemplate
    };
    
    onUpdatePages([...pages, leftPage, rightPage]);
  };

  // Sayfa çiftini sil
  const deleteSpread = (spreadIndex: number) => {
    if (pages.length <= 2) {
      alert('En az bir sayfa çifti olmalıdır.');
      return;
    }
    
    const startIdx = spreadIndex * 2;
    const updatedPages = [
      ...pages.slice(0, startIdx),
      ...pages.slice(startIdx + 2)
    ].map((page, idx) => ({
      ...page,
      pageNumber: idx + 1
    }));
    
    onUpdatePages(updatedPages);
    
    // Eğer silinen spread aktif olandıysa, önceki spreade dön
    if (currentSpread === spreadIndex) {
      setCurrentSpread(Math.max(0, spreadIndex - 1));
    } else if (currentSpread > spreadIndex) {
      // Silinen spreadden sonraki bir spreaddeyse, indeksi güncelle
      setCurrentSpread(currentSpread - 1);
    }
  };

  // Sonraki veya önceki spreade git
  const flipPage = (direction: 'next' | 'prev') => {
    if (
      (direction === 'next' && currentSpread >= Math.ceil(pages.length / 2) - 1) ||
      (direction === 'prev' && currentSpread <= 0)
    ) {
      return; // Sınırlar dışındaysa işlem yapma
    }
    
    setIsFlipping(true);
    setPageTransition(direction);
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentSpread(currentSpread + 1);
      } else {
        setCurrentSpread(currentSpread - 1);
      }
      
      setTimeout(() => {
        setIsFlipping(false);
        setPageTransition(null);
      }, 300);
    }, 300);
  };

  // AI ile içerik oluştur
  const generateContentWithAi = (pageId: string, prompt: string) => {
    // AI entegrasyonu burada yapılacak
    console.log(`AI ile içerik oluşturuluyor: ${prompt} (sayfa: ${pageId})`);
    // API entegrasyonu sonrası updatePageContent kullanılacak
  };

  const { leftPage, rightPage } = getActivePages();

  // Otomatik kaydetme göstergesi
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Değişiklik olduğunda otomatik kaydetme göstergesi
    if (pages.length > 0) {
      setIsSaving(true);
      
      const timer = setTimeout(() => {
        setIsSaving(false);
        if (onSave) onSave();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [pages, onSave]);

  return (
    <div className="flex flex-col h-full">
      {/* Üst Menü Çubuğu */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 flex justify-between items-center rounded-lg">
        <div className="flex items-center">
          <input 
            type="text"
            value={bookTitle}
            onChange={() => {}} // Bu örnek için sadece görünüm amaçlı
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-xl font-bold mr-3"
            placeholder="Hikaye Başlığı"
          />
          <span className={`text-xs px-2 py-1 rounded-full ${isSaving ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'}`}>
            {isSaving ? 'Kaydediliyor...' : 'Kaydedildi'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowToolbar(!showToolbar)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {showToolbar ? 'Araçları Gizle' : 'Araçları Göster'}
          </button>
          
          <button 
            onClick={() => alert('Önizleme özelliği geliştiriliyor')}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Önizleme
          </button>
          
          <button 
            onClick={onPublish}
            className="px-4 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 rounded-md shadow-sm hover:shadow flex items-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Yayınla
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 min-h-0">
        {/* Sol Panel - Sayfa Yönetimi */}
        <AnimatePresence>
          {showToolbar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mr-4"
            >
              <div className="p-4">
                <div className="flex flex-col h-full">
                  {/* Sekmeli Araçlar */}
                  <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTool('text')}
                      className={`px-3 py-2 text-sm font-medium flex items-center ${
                        activeTool === 'text'
                          ? 'text-sky-600 border-b-2 border-sky-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-sky-500 hover:border-b-2 hover:border-sky-300'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Metin
                    </button>
                    
                    <button
                      onClick={() => setActiveTool('image')}
                      className={`px-3 py-2 text-sm font-medium flex items-center ${
                        activeTool === 'image'
                          ? 'text-purple-600 border-b-2 border-purple-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-purple-500 hover:border-b-2 hover:border-purple-300'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Görsel
                    </button>
                    
                    <button
                      onClick={() => setActiveTool('ai')}
                      className={`px-3 py-2 text-sm font-medium flex items-center ${
                        activeTool === 'ai'
                          ? 'text-green-600 border-b-2 border-green-500'
                          : 'text-gray-600 dark:text-gray-400 hover:text-green-500 hover:border-b-2 hover:border-green-300'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI
                    </button>
                  </div>
                  
                  {/* Araç İçeriği */}
                  <div className="flex-1">
                    {activeTool === 'text' && (
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-3">Metin Düzenle</h3>
                        
                        {/* Yazı Tipi Seçimi */}
                        <div className="mb-4">
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Yazı Tipi</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
                            defaultValue="default"
                            onChange={(e) => console.log('Yazı tipi değişti:', e.target.value)}
                          >
                            <option value="default">Varsayılan</option>
                            <option value="serif">Serif</option>
                            <option value="sans-serif">Sans Serif</option>
                            <option value="monospace">Monospace</option>
                            <option value="cursive">El Yazısı</option>
                          </select>
                        </div>
                        
                        {/* Renk Seçimi */}
                        <div className="mb-4">
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Metin Rengi</label>
                          <div className="flex flex-wrap gap-2">
                            {['#000000', '#FF5733', '#33A1FF', '#33FF57', '#F033FF', '#FF3333'].map(color => (
                              <button 
                                key={color}
                                className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transform transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => console.log('Renk seçildi:', color)}
                              ></button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Metin Stili */}
                        <div className="mb-4">
                          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Metin Stili</label>
                          <div className="flex space-x-1">
                            <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <span className="font-bold">B</span>
                            </button>
                            <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <span className="italic">I</span>
                            </button>
                            <button className="p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                              <span className="underline">U</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTool === 'image' && (
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-3">Görsel Ekle</h3>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('Görsel Yükle')} 
                            className="w-full py-2 px-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Bilgisayardan Yükle
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('Stok Görsel Ara')} 
                            className="w-full py-2 px-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Stok Görsellerde Ara
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('AI ile Görsel Oluştur')} 
                            className="w-full py-2 px-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md hover:from-green-500 hover:to-blue-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            AI İle Görsel Oluştur
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {activeTool === 'ai' && (
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-white mb-3">AI Araçları</h3>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('AI Hikaye Oluştur')} 
                            className="w-full py-2 px-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-md hover:from-green-600 hover:to-teal-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            AI İle Hikaye Metni Oluştur
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('AI İçerik Düzenleme')} 
                            className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-md hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Mevcut İçeriği AI İle Düzenle
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <button 
                            onClick={() => console.log('AI Görsel Oluştur')} 
                            className="w-full py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            AI İle Görsel Oluştur
                          </button>
                        </div>
                        
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
                          <p className="font-medium mb-1">İpucu:</p>
                          <p>Sayfayı seçip AI araçlarını kullanarak hikayenizi zenginleştirebilirsiniz.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">Sayfalar</h3>
                  
                  <PageNavigator 
                    pages={pages} 
                    currentSpread={currentSpread} 
                    onSpreadChange={setCurrentSpread}
                    onAddSpread={addNewSpread}
                    onDeleteSpread={deleteSpread}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ana Kitap Alanı */}
        <div 
          ref={bookRef}
          className="flex-1 flex justify-center items-center bg-gray-100 dark:bg-gray-900 rounded-lg relative"
          style={{ perspective: "1000px" }}
        >
          {/* Kitap Kaplumbağası */}
          <div 
            className={`book-container ${isOpenBook ? 'book-open' : ''} ${isFlipping ? 'flipping' : ''}`}
          >
            {/* Kapak veya iç sayfalar */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSpread}-${pageTransition}`}
                initial={
                  pageTransition === 'next' 
                    ? { rotateY: 0, opacity: 1 } 
                    : pageTransition === 'prev' 
                      ? { rotateY: -180, opacity: 0 } 
                      : { rotateY: 0, opacity: 1 }
                }
                animate={{ rotateY: 0, opacity: 1 }}
                exit={
                  pageTransition === 'next' 
                    ? { rotateY: 180, opacity: 0 } 
                    : pageTransition === 'prev' 
                      ? { rotateY: -180, opacity: 0 } 
                      : { rotateY: 0, opacity: 1 }
                }
                transition={{ duration: 0.5 }}
                className="book-pages-container"
              >
                {/* Tek Sayfa (Kapak) */}
                {leftPage?.isSinglePage && (
                  <div className="flex justify-center w-full">
                    <div className="single-page-container">
                      {leftPage && (
                        <BookPage 
                          page={leftPage} 
                          position="center"
                          onContentChange={updatePageContent}
                          isCoverPage={leftPage.isCoverPage}
                          isBackCoverPage={leftPage.isBackCoverPage}
                          bookTitle={bookTitle}
                          authorName={authorName}
                          coverImage={coverImage}
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Tek Sayfa (Arka Kapak) */}
                {rightPage?.isSinglePage && (
                  <div className="flex justify-center w-full">
                    <div className="single-page-container">
                      {rightPage && (
                        <BookPage 
                          page={rightPage} 
                          position="center"
                          onContentChange={updatePageContent}
                          isCoverPage={rightPage.isCoverPage}
                          isBackCoverPage={rightPage.isBackCoverPage}
                          bookTitle={bookTitle}
                          authorName={authorName}
                          coverImage={coverImage}
                        />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Çift Sayfa */}
                {(!leftPage?.isSinglePage && !rightPage?.isSinglePage) && (
                  <div className="flex w-full">
                    <div className="book-page left">
                      {leftPage && (
                        <BookPage 
                          page={leftPage} 
                          position="left"
                          onContentChange={updatePageContent}
                        />
                      )}
                    </div>
                    
                    <div className="book-page right">
                      {rightPage && (
                        <BookPage 
                          page={rightPage} 
                          position="right"
                          onContentChange={updatePageContent}
                        />
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Sayfa Geçiş Butonları */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-20 z-10">
              <button 
                onClick={() => flipPage('prev')}
                disabled={currentSpread === 0}
                className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm ${
                  currentSpread === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:scale-110 transition-all'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                onClick={() => flipPage('next')}
                disabled={currentSpread >= Math.ceil(pages.length / 2) - 1}
                className={`p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm ${
                  currentSpread >= Math.ceil(pages.length / 2) - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:scale-110 transition-all'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Kitap stil tanımları */}
      <style>{`
        .book-container {
          position: relative;
          width: 800px;
          height: 500px;
          transition: transform 0.5s;
          transform-style: preserve-3d;
          box-shadow: 0 15px 25px -12px rgba(0,0,0,0.3);
        }
        
        .book-open {
          transform: rotateY(-10deg);
        }
        
        .flipping {
          transition: transform 0.3s;
          transform: rotateY(-30deg);
        }
        
        .book-pages-container {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          display: flex;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .single-page-container {
          width: 70%;
          height: 100%;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          border-radius: 5px;
          overflow: hidden;
        }
        
        .book-page {
          flex: 1;
          height: 100%;
          background-color: white;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .book-page.left {
          border-radius: 5px 0 0 5px;
        }
        
        .book-page.right {
          border-radius: 0 5px 5px 0;
        }
      `}</style>
    </div>
  );
};

export default BookEditor;