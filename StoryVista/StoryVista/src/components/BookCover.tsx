import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BookCoverProps {
  title: string;
  author: string;
  coverImage?: string;
  onEdit?: () => void;
  isEditable?: boolean;
  theme?: 'dark' | 'light' | 'colorful' | 'minimal' | 'classic' | 'fantasy' | 'sci-fi';
}

const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverImage,
  onEdit,
  isEditable = false,
  theme = 'colorful'
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Tema renkleri ve stilleri
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          bg: 'bg-gray-800',
          spine: 'bg-gray-900',
          text: 'text-white',
          accent: 'bg-blue-600',
          overlay: 'rgba(0, 0, 0, 0.4)',
          fontDisplay: 'font-serif',
          fontBody: 'font-sans',
          shadow: 'shadow-xl shadow-gray-800/20'
        };
      case 'light':
        return {
          bg: 'bg-gray-100',
          spine: 'bg-gray-300',
          text: 'text-gray-800',
          accent: 'bg-sky-500',
          overlay: 'rgba(255, 255, 255, 0.2)',
          fontDisplay: 'font-sans',
          fontBody: 'font-sans',
          shadow: 'shadow-lg shadow-gray-300/30'
        };
      case 'minimal':
        return {
          bg: 'bg-white',
          spine: 'bg-gray-200',
          text: 'text-gray-900',
          accent: 'bg-gray-400',
          overlay: 'rgba(250, 250, 250, 0.1)',
          fontDisplay: 'font-sans',
          fontBody: 'font-sans',
          shadow: 'shadow-md shadow-gray-200/40'
        };
      case 'classic':
        return {
          bg: 'bg-amber-100',
          spine: 'bg-amber-800',
          text: 'text-amber-900',
          accent: 'bg-amber-600',
          overlay: 'rgba(245, 225, 200, 0.2)',
          fontDisplay: 'font-serif',
          fontBody: 'font-serif',
          shadow: 'shadow-xl shadow-amber-900/20'
        };
      case 'fantasy':
        return {
          bg: 'bg-gradient-to-br from-purple-800 via-purple-600 to-indigo-800',
          spine: 'bg-purple-900',
          text: 'text-white',
          accent: 'bg-yellow-400',
          overlay: 'rgba(76, 29, 149, 0.3)',
          fontDisplay: 'font-serif',
          fontBody: 'font-serif',
          shadow: 'shadow-xl shadow-purple-900/30'
        };
      case 'sci-fi':
        return {
          bg: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-gray-900',
          spine: 'bg-cyan-950',
          text: 'text-cyan-100',
          accent: 'bg-cyan-400',
          overlay: 'rgba(8, 47, 73, 0.3)',
          fontDisplay: 'font-mono',
          fontBody: 'font-mono',
          shadow: 'shadow-xl shadow-cyan-900/40'
        };
      case 'colorful':
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
          spine: 'bg-blue-800',
          text: 'text-white',
          accent: 'bg-yellow-400',
          overlay: 'rgba(30, 64, 175, 0.3)',
          fontDisplay: 'font-sans',
          fontBody: 'font-sans',
          shadow: 'shadow-xl shadow-blue-700/20'
        };
    }
  };

  const colors = getThemeColors();

  // CSS sınıfları
  const perspectiveClass = "relative perspective-1000 cursor-pointer";
  const writingModeClass = "writing-mode-vertical flex flex-col items-center";

  // Kapak için dekoratif desenler
  const renderCoverPattern = () => {
    switch (theme) {
      case 'fantasy':
        return (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="fantasy-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0L40 20L20 40L0 20Z" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#fantasy-pattern)" />
            </svg>
          </div>
        );
      case 'sci-fi':
        return (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="scifi-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="30" height="30" fill="white" />
                <rect x="30" y="30" width="30" height="30" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#scifi-pattern)" />
            </svg>
          </div>
        );
      case 'classic':
        return (
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="classic-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#classic-pattern)" stroke="none" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`${perspectiveClass} ${colors.shadow}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isEditable && onEdit ? onEdit : undefined}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ perspective: "1000px" }}
    >
      {/* Kitap cilt kısmı */}
      <motion.div
        className={`absolute h-full w-[30px] left-0 top-0 ${colors.spine} rounded-l-lg shadow-inner transform origin-right z-10`}
        animate={{ 
          rotateY: isHovered ? -30 : 0,
          x: isHovered ? -15 : 0
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="h-full flex flex-col justify-center items-center py-4">
          <div className="w-full h-full flex flex-col justify-between items-center">
            <div className={`w-6 h-1 ${colors.accent} rounded mb-4`}></div>
            
            <div className={`${writingModeClass} ${colors.fontDisplay}`} style={{ writingMode: "vertical-lr", textOrientation: "mixed" }}>
              <span className={`${colors.text} uppercase text-xs tracking-wider font-bold transform rotate-180`}>
                {title.length > 20 ? title.substring(0, 18) + '...' : title}
              </span>
            </div>
            
            <div className={`w-6 h-1 ${colors.accent} rounded mt-4`}></div>
          </div>
        </div>
      </motion.div>
      
      {/* Kitap kapağı */}
      <motion.div 
        className={`relative h-[400px] w-[300px] rounded-lg overflow-hidden ${colors.bg}`}
        animate={{ 
          rotateY: isHovered ? -20 : 0,
          x: isHovered ? 15 : 0 
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Kapak deseni */}
        {renderCoverPattern()}
        
        {/* Kapak görseli */}
        {coverImage ? (
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={coverImage} 
              alt={title} 
              className="w-full h-full object-cover"
            />
            {/* Hafif renkli katman */}
            <div className="absolute inset-0" style={{ backgroundColor: colors.overlay }}></div>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-600 to-purple-700"></div>
        )}
        
        {/* Kapak içeriği */}
        <div className="absolute inset-0 flex flex-col justify-between p-8">
          <div className="space-y-2">
            <div className={`${colors.accent} h-1 w-20 rounded mb-4`}></div>
            <h1 className={`${colors.text} text-3xl md:text-4xl font-black leading-tight drop-shadow-2xl ${colors.fontDisplay}`}
                style={{ 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.3)',
                  fontWeight: '900'
                }}>
              {title || "Hikaye Başlığı"}
            </h1>
          </div>
          
          <div className="space-y-4">
            {author && (
              <p className={`${colors.text} opacity-95 font-bold text-lg ${colors.fontBody}`}
                 style={{ 
                   textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                   fontWeight: '700'
                 }}>
                Yazar: {author}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              <div className={`${colors.accent} h-1 w-10 rounded`}></div>
              <span className={`${colors.text} opacity-90 text-sm font-bold`}
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                StoryVista
              </span>
            </div>
          </div>
        </div>
        
        {/* Düzenleme uyarısı */}
        {isEditable && (
          <motion.div 
            className="absolute bottom-4 right-4"
            initial={{ opacity: 0.7, y: 0 }}
            animate={{ opacity: 1, y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white px-3 py-1 rounded-full text-xs font-medium">
              Düzenlemek için tıkla
            </div>
          </motion.div>
        )}
        
        {/* Kitap kapağı üzerindeki parlaklık efekti */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-10 pointer-events-none"></div>
        
        {/* Kapak köşe efekti */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none"></div>
      </motion.div>
      
      {/* Kitap sayfaları */}
      <div className="absolute top-1 left-[29px] h-[398px] w-[298px] bg-white dark:bg-gray-200 rounded-r-lg transform -z-10"></div>
      <div className="absolute top-0.5 left-[28px] h-[399px] w-[299px] bg-gray-100 dark:bg-gray-300 rounded-r-lg transform -z-20"></div>
      <div className="absolute top-0 left-[27px] h-[400px] w-[300px] bg-gray-200 dark:bg-gray-400 rounded-r-lg transform -z-30 opacity-50"></div>
    </motion.div>
  );
};

export default BookCover; 