import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookPage, { Page } from './BookPage';
import BookCover from './BookCover';

interface FullBookPreviewProps {
  pages: Page[];
  title: string;
  authorName: string;
  coverImage?: string;
  onClose?: () => void;
}

const FullBookPreview: React.FC<FullBookPreviewProps> = ({
  pages,
  title,
  authorName,
  coverImage,
  onClose
}) => {
  // Geçerli sayfa indeksi (-1: kapak, 0: ilk içerik sayfası)
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  
  // Animasyon durumu
  const [isAnimating, setIsAnimating] = useState(false);
  
  // İçerik sayfaları (kapak hariç)
  const contentPages = pages.filter(page => !page.isTitle);
  
  // Kapak sayfası
  const coverPage = pages.find(page => page.isTitle);
  
  // Son sayfa (arka kapak)
  const hasBackCover = pages.length % 2 === 0; // Çift sayfa sayısı varsa, son sayfa arka kapaktır
  
  // Toplam açılış sayısı (kapak + içerik sayfaları çiftleri + arka kapak)
  const totalSpreads = 1 + Math.ceil(contentPages.length / 2) + (hasBackCover ? 1 : 0);
  
  // Sayfa çevirme işlevi
  const flipPage = (direction: 'next' | 'prev') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (direction === 'next' && currentPageIndex < totalSpreads - 2) {
      setCurrentPageIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentPageIndex > -1) {
      setCurrentPageIndex(prev => prev - 1);
    }
    
    // Animasyon süresi sonunda isAnimating'i false yap
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };
  
  // Tuş kontrollerini ayarla
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        flipPage('next');
      } else if (e.key === 'ArrowLeft') {
        flipPage('prev');
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, isAnimating, onClose]);
  
  // Geçerli açılışta gösterilecek sayfaları belirle
  const getCurrentPages = () => {
    if (currentPageIndex === -1) {
      // Kapak sayfası
      return [coverPage];
    } else {
      // İçerik sayfaları (ikişerli gruplar)
      const startIdx = currentPageIndex * 2;
      return [
        contentPages[startIdx] || null,
        contentPages[startIdx + 1] || null
      ];
    }
  };
  
  const currentPages = getCurrentPages();
  
  // Sayfa numaraları gösterimi
  const getPageNumbers = () => {
    if (currentPageIndex === -1) {
      return 'Kapak';
    } else if (currentPageIndex === totalSpreads - 1 && hasBackCover) {
      return 'Arka Kapak';
    } else {
      const leftPageNum = currentPageIndex * 2 + 1;
      const rightPageNum = leftPageNum + 1;
      const maxPageNum = contentPages.length;
      
      if (rightPageNum <= maxPageNum) {
        return `Sayfa ${leftPageNum}-${rightPageNum} / ${maxPageNum}`;
      } else {
        return `Sayfa ${leftPageNum} / ${maxPageNum}`;
      }
    }
  };
  
  // onClose olmadığında buton görüntülenmez ve sadece önizleme gösterilir
  if (!onClose) {
    return (
      <button 
        className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded text-xs flex items-center text-gray-700 dark:text-gray-300"
        onClick={() => {
          // Modal açmak için state oluştur
          const modal = document.createElement('div');
          modal.id = 'book-preview-modal';
          document.body.appendChild(modal);
          
          // Basit bir uyarı göster
          alert('Tam ekran önizleme henüz geliştirme aşamasındadır.');
          
          // Temizle
          document.body.removeChild(modal);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Tam Ekran Önizleme
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="relative max-w-5xl w-full h-[90vh] flex justify-center items-center">
        {/* Kapat butonu */}
        <button 
          className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 z-10 transition-all"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Kitap alanı */}
        <div className="relative w-full max-w-4xl aspect-[2/1] bg-gray-100 dark:bg-gray-800 rounded-xl shadow-2xl flex overflow-hidden">
          {currentPageIndex === -1 ? (
            // Kapak sayfası (tek sayfa)
            <div className="w-full h-full flex justify-center items-center p-4">
              <BookCover
                title={title}
                author={authorName}
                coverImage={coverImage}
                theme="minimal"
              />
            </div>
          ) : (
            // İçerik sayfaları (çift sayfa)
            <div className="w-full h-full flex">
              {/* Sol sayfa */}
              <div className="w-1/2 h-full p-4 relative flex justify-center items-center border-r border-gray-300 dark:border-gray-700">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-left-${currentPageIndex}`}
                    className="w-full h-full"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentPages[0] && (
                      <BookPage 
                        page={currentPages[0]} 
                        position="left"
                        showFlipButtons={false}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Sağ sayfa */}
              <div className="w-1/2 h-full p-4 relative flex justify-center items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-right-${currentPageIndex}`}
                    className="w-full h-full"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentPages[1] ? (
                      <BookPage 
                        page={currentPages[1]} 
                        position="right"
                        showFlipButtons={false}
                      />
                    ) : (
                      currentPageIndex !== totalSpreads - 1 && (
                        <div className="w-full h-full flex justify-center items-center text-gray-400">
                          <p className="text-xl italic">Kitap sonu</p>
                        </div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
          
          {/* Sayfa çevirme kontrolleri */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
            onClick={() => flipPage('prev')}
            disabled={currentPageIndex === -1 || isAnimating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all"
            onClick={() => flipPage('next')}
            disabled={currentPageIndex >= totalSpreads - 1 || isAnimating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Sayfa numarası göstergesi */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white">
          <span>{getPageNumbers()}</span>
        </div>
      </div>
    </div>
  );
};

export default FullBookPreview; 