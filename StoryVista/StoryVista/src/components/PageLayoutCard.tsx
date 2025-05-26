import React from 'react';
import { motion } from 'framer-motion';
import TemplateType from '../lib/templateType';

interface PageLayoutCardProps {
  title: string;
  description: string;
  layout: TemplateType;
  isSelected?: boolean;
  onClick: () => void;
}

const PageLayoutCard: React.FC<PageLayoutCardProps> = ({
  title,
  description,
  layout,
  isSelected = false,
  onClick
}) => {
  // Düzene göre önizleme görseli (çift sayfa görünümü)
  const renderLayoutPreview = () => {
    switch (layout) {
      case TemplateType.CLASSIC:
        return (
          <div className="w-full h-full border border-gray-300 rounded-md overflow-hidden flex flex-row">
            {/* Sol sayfa */}
            <div className="w-1/2 h-full bg-white border-r border-gray-300 flex flex-col">
              <div className="h-2/3 bg-blue-100 border-b border-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="h-1/3 p-2">
                <div className="w-3/4 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
            
            {/* Sağ sayfa */}
            <div className="w-1/2 h-full bg-white flex flex-col">
              <div className="h-2/3 bg-blue-100 border-b border-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="h-1/3 p-2">
                <div className="w-3/4 h-2 bg-gray-300 rounded mb-1"></div>
                <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
                <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        );
        
      case TemplateType.VISUAL_TEXT:
        return (
          <div className="w-full h-full border border-gray-300 rounded-md overflow-hidden flex flex-row">
            {/* Sol sayfa (metin) */}
            <div className="w-1/2 h-full bg-white border-r border-gray-300 p-2">
              <div className="w-3/4 h-2 bg-gray-300 rounded mb-2"></div>
              <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
              <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
              <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded mb-2"></div>
              <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
              <div className="w-full h-2 bg-gray-200 rounded mb-1"></div>
              <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
            </div>
            
            {/* Sağ sayfa (görsel) */}
            <div className="w-1/2 h-full bg-purple-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-500 border-transparent' : 'border-gray-200 dark:border-gray-700'}`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Düzen önizlemesi */}
        <div className="w-full h-48 mb-4">
          {renderLayoutPreview()}
        </div>
        
        {/* Başlık ve açıklama */}
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

export default PageLayoutCard; 