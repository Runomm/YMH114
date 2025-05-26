import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BookCover from './BookCover';
import TemplateType from '../lib/templateType';

// Page ve TemplateType ara yüzleri
export interface Page {
  id: string;
  pageNumber: number;
  content: string;
  image?: string;
  title?: string;
  isTitle?: boolean; // Başlık sayfası mı?
  template?: TemplateType;
}

interface BookPageProps {
  page: Page;
  position?: 'left' | 'right' | 'center';
  onContentChange?: (pageId: string, content: string) => void;
  isCoverPage?: boolean;
  isBackCoverPage?: boolean;
  bookTitle?: string;
  authorName?: string;
  coverImage?: string;
  onPageFlip?: () => void;
  showFlipButtons?: boolean;
}

const BookPage: React.FC<BookPageProps> = ({
  page,
  position = 'left',
  onContentChange = () => {},
  isCoverPage = false,
  isBackCoverPage = false,
  bookTitle = '',
  authorName = '',
  coverImage,
  onPageFlip,
  showFlipButtons = false
}) => {
  // Sayfa animasyon durumu
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Standart sayfa boyutları (kare format 1:1 - 20x20cm standart çocuk kitabı)
  const PAGE_WIDTH = '100%';
  const PAGE_HEIGHT = '100%';
  const MAX_WIDTH = '500px';
  const ASPECT_RATIO = '1/1';
  
  // Animasyonlu sayfa çevirme fonksiyonu
  const handlePageFlip = (direction: 'next' | 'prev') => {
    if (onPageFlip) {
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipping(false);
        onPageFlip();
      }, 500); // Animasyon süresi
    }
  };

  // Temel sayfa stili
  const pageStyle = {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    aspectRatio: ASPECT_RATIO,
    maxWidth: MAX_WIDTH,
    margin: '0 auto',
    padding: '1rem',
    boxSizing: 'border-box' as 'border-box',
    position: 'relative' as 'relative',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden' as 'hidden',
    transition: 'all 0.3s ease',
  };

  // Görsel alanı stili (tüm şablonlar için)
  const imageContainerStyle = {
    width: '100%',
    height: '55%',
    overflow: 'hidden' as 'hidden',
    borderRadius: '0.5rem',
    marginBottom: '0.75rem',
    position: 'relative' as 'relative',
    backgroundColor: '#f3f4f6', // Hafif gri arkaplan (görsel yoksa)
  };

  // İçerik alanı stili
  const contentContainerStyle = {
    width: '100%',
    padding: '0.5rem',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: page.isTitle ? 'center' : 'flex-start',
    textAlign: page.isTitle ? 'center' as 'center' : 'left' as 'left',
    fontFamily: 'var(--font-body, sans-serif)',
  };

  // Başlık metni stili
  const titleStyle = {
    fontSize: page.isTitle ? '1.5rem' : '1.25rem',
    fontWeight: 'bold' as 'bold',
    marginBottom: '0.75rem',
    color: '#1f2937', // Koyu gri
    textShadow: page.isTitle ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    lineHeight: '1.3',
  };

  // İçerik metni stili
  const textStyle = {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#374151', // Gri
  };

  // Sayfa numarası stili
  const pageNumberStyle = {
    position: 'absolute' as 'absolute',
    bottom: '0.5rem',
    right: '0.75rem',
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontStyle: 'italic' as 'italic',
  };

  // Sayfa çevirme butonları
  const flipButtonsContainer = {
    position: 'absolute' as 'absolute',
    bottom: '50%',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 0.25rem',
    zIndex: 10,
  };

  // Kapak sayfası için özel düzen (kapak ile diğer sayfalar aynı boyutta olacak şekilde)
  if (isCoverPage) {
    return (
      <div className="w-full h-full relative" style={{ maxWidth: MAX_WIDTH, aspectRatio: ASPECT_RATIO, margin: '0 auto' }}>
        <motion.div 
          className="w-full h-full"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isFlipping ? -180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <BookCover 
            title={bookTitle || page.content} 
            author={authorName}
            coverImage={coverImage || page.image}
            isEditable={false}
            theme="colorful"
          />
        </motion.div>
        
        {showFlipButtons && (
          <div style={{ position: 'absolute', right: '-1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
            <button
              className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-all"
              onClick={() => handlePageFlip('next')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Sayfa şablonuna göre içerik düzeni
  const renderPageContent = () => {
    const template = page.template || TemplateType.CLASSIC;
    
    switch (template) {
      case TemplateType.CLASSIC:
        return (
          <>
            {page.image ? (
              <div style={imageContainerStyle}>
                <img 
                  src={page.image} 
                  alt={`Sayfa ${page.pageNumber}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ) : (
              <div style={{...imageContainerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div style={contentContainerStyle}>
              {page.title && <h2 style={titleStyle}>{page.title}</h2>}
              {page.content.split('\n').map((paragraph, index) => (
                <p key={index} style={textStyle} className="mb-3">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
            
            <div style={pageNumberStyle}>Sayfa {page.pageNumber}</div>
          </>
        );
        
      case TemplateType.VISUAL_TEXT:
        return (
          <div className="flex flex-row h-full">
            <div className="w-1/2 h-full pr-2">
              {page.image ? (
                <div style={{height: '100%', borderRadius: '0.5rem', overflow: 'hidden'}}>
                  <img 
                    src={page.image} 
                    alt={`Sayfa ${page.pageNumber}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <div style={{height: '100%', borderRadius: '0.5rem', backgroundColor: '#f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="w-1/2 h-full pl-2 flex flex-col">
              {page.title && <h2 style={titleStyle}>{page.title}</h2>}
              <div className="flex-grow overflow-auto">
                {page.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={textStyle} className="mb-3">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
            
            <div style={pageNumberStyle}>Sayfa {page.pageNumber}</div>
          </div>
        );
        
      case TemplateType.PANORAMIC:
        return (
          <div className="flex flex-col h-full relative">
            {/* Panoramik görsel - sayfanın tamamını kaplar */}
            {page.image ? (
              <div style={{
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                top: 0,
                left: 0,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                zIndex: 1
              }}>
                <img 
                  src={page.image} 
                  alt={`Sayfa ${page.pageNumber}`} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
            ) : (
              <div style={{
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                top: 0,
                left: 0,
                borderRadius: '0.5rem',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* İçerik metni - yarı saydam arka plan ile */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: '0 0 0.5rem 0.5rem',
              zIndex: 2
            }}>
              {page.title && <h2 style={{...titleStyle, color: '#000'}}>{page.title}</h2>}
              <div>
                {page.content.split('\n').map((paragraph, index) => (
                  <p key={index} style={{...textStyle, color: '#000'}} className="mb-2">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
            
            <div style={{...pageNumberStyle, color: '#fff', zIndex: 3, textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
              Sayfa {page.pageNumber}
            </div>
          </div>
        );
        
      default:
        return (
          <>
            {page.image ? (
              <div style={imageContainerStyle}>
                <img 
                  src={page.image} 
                  alt={`Sayfa ${page.pageNumber}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ) : (
              <div style={{...imageContainerStyle, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div style={contentContainerStyle}>
              {page.title && <h2 style={titleStyle}>{page.title}</h2>}
              {page.content.split('\n').map((paragraph, index) => (
                <p key={index} style={textStyle} className="mb-3">
                  {paragraph.trim()}
                </p>
              ))}
            </div>
            
            <div style={pageNumberStyle}>Sayfa {page.pageNumber}</div>
          </>
        );
    }
  };

  // Sayfa çevirme efekti için sayfayı bir motion.div içine alıyoruz
  return (
    <div className="relative w-full h-full" style={{ maxWidth: MAX_WIDTH, aspectRatio: ASPECT_RATIO, margin: '0 auto' }}>
      <motion.div
        style={pageStyle}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipping ? (position === 'left' ? 90 : position === 'right' ? -90 : 0) : 0 }}
        transition={{ duration: 0.5 }}
        className="book-page-content"
      >
        {renderPageContent()}
      </motion.div>

      {/* Kitap kapağı üzerindeki parlaklık efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-10 pointer-events-none"></div>
      
      {/* Sayfa kenarı gölgesi */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-700 opacity-50"></div>
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-700 opacity-50"></div>

      {showFlipButtons && (
        <div style={flipButtonsContainer}>
          <div style={{ position: 'absolute', left: '-1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
            <button
              className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-all"
              onClick={() => handlePageFlip('prev')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div style={{ position: 'absolute', right: '-1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
            <button
              className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600 transition-all"
              onClick={() => handlePageFlip('next')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookPage; 