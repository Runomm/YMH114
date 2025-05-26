import React from 'react';
import { motion } from 'framer-motion';

interface CoverStyleCardProps {
  title: string;
  description: string;
  theme: 'light' | 'dark' | 'colorful' | 'minimal';
  isSelected?: boolean;
  onClick: () => void;
}

const CoverStyleCard: React.FC<CoverStyleCardProps> = ({
  title,
  description,
  theme,
  isSelected = false,
  onClick
}) => {
  // Tema renklerini belirle (3D efekti ve neon renkler olmadan, basit düz renkler)
  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          title: 'text-gray-800',
          text: 'text-gray-600'
        };
      case 'dark':
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-700',
          title: 'text-gray-100',
          text: 'text-gray-300'
        };
      case 'colorful':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          title: 'text-blue-800',
          text: 'text-blue-600'
        };
      case 'minimal':
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          title: 'text-gray-700',
          text: 'text-gray-500'
        };
      default:
        return {
          bg: 'bg-white',
          border: 'border-gray-200',
          title: 'text-gray-700',
          text: 'text-gray-500'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 transition-all duration-300 h-full ${isSelected ? 'ring-4 ring-blue-500 border-transparent' : 'border-gray-200 dark:border-gray-700'}`}
      onClick={onClick}
    >
      <div className="p-4 flex flex-col items-center">
        {/* Kapak önizlemesi */}
        <div className="w-full h-48 flex justify-center items-center mb-4">
          <div className={`w-32 h-44 ${colors.bg} ${colors.border} border rounded-md flex flex-col justify-between p-3 shadow-md`}>
            <div className="text-center">
              <div className="h-12 flex items-center justify-center">
                <h3 className={`text-sm font-bold ${colors.title}`}>Hikaye Başlığı</h3>
              </div>
            </div>
            
            <div className="flex justify-center items-center h-16 my-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
            
            <div className="text-center">
              <p className={`text-xs ${colors.text}`}>Yazar Adı</p>
            </div>
          </div>
        </div>
        
        {/* Kart başlığı ve açıklaması */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        
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

export default CoverStyleCard; 