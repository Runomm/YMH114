import React from 'react';
import { motion } from 'framer-motion';

// Tema türü
type ThemeStyle = 'children' | 'modern' | 'fantasy' | 'adventure';

interface StyleThemeCardProps {
  theme: ThemeStyle;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
  preview?: React.ReactNode;
}

const StyleThemeCard: React.FC<StyleThemeCardProps> = ({
  theme,
  title,
  description,
  icon,
  isSelected = false,
  onClick,
  preview
}) => {
  // Tema renkleri
  const getThemeColors = () => {
    switch (theme) {
      case 'children':
        return {
          bg: 'bg-gradient-to-br from-sky-400 to-indigo-500',
          border: 'border-sky-300',
          text: 'text-white'
        };
      case 'modern':
        return {
          bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
          border: 'border-gray-300',
          text: 'text-gray-800'
        };
      case 'fantasy':
        return {
          bg: 'bg-gradient-to-br from-purple-600 to-pink-500',
          border: 'border-purple-400',
          text: 'text-white'
        };
      case 'adventure':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-teal-600',
          border: 'border-green-400',
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          text: 'text-gray-800'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-500 border-transparent scale-105' : colors.border}`}
      onClick={onClick}
    >
      {/* Arkaplan */}
      <div className={`${colors.bg} p-5 h-full`}>
        {/* İkon ve başlık */}
        <div className="flex flex-col items-center mb-4">
          <div className="p-3 bg-white/20 rounded-full mb-3">
            {icon || (
              <img 
                src={`https://cdn-icons-png.flaticon.com/512/3460/3460329.png`} 
                alt={title} 
                className="w-12 h-12"
              />
            )}
          </div>
          <h3 className={`text-xl font-bold ${colors.text}`}>{title}</h3>
        </div>
        
        {/* Açıklama */}
        <p className={`text-sm ${colors.text} text-center opacity-80 mb-4`}>
          {description}
        </p>
        
        {/* Önizleme */}
        {preview && (
          <div className="mt-3 p-2 bg-white/10 rounded-lg">
            <p className="text-xs text-center font-medium mb-1">Hikayeniz bu şekilde görünecektir:</p>
            {preview}
          </div>
        )}
        
        {/* Seçim işareti */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StyleThemeCard; 