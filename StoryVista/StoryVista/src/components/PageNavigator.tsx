import React from 'react';
import { Page } from './BookEditor';

interface PageNavigatorProps {
  pages: Page[];
  currentSpread: number;
  onSpreadChange: (spreadIndex: number) => void;
  onAddSpread: () => void;
  onDeleteSpread: (spreadIndex: number) => void;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentSpread,
  onSpreadChange,
  onAddSpread,
  onDeleteSpread
}) => {
  // Toplam spread (sayfa çifti) sayısı
  const totalSpreads = Math.ceil(pages.length / 2);
  
  const getSpreadPages = (spreadIndex: number) => {
    const startIdx = spreadIndex * 2;
    return {
      leftPage: pages[startIdx] || null,
      rightPage: pages[startIdx + 1] || null
    };
  };
  
  return (
    <div className="space-y-4">
      {/* Sayfa navigasyonu */}
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={() => onSpreadChange(Math.max(0, currentSpread - 1))}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
          disabled={currentSpread === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex-1 text-center text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
          {currentSpread + 1} / {totalSpreads}
        </div>
        
        <button 
          onClick={() => onSpreadChange(Math.min(totalSpreads - 1, currentSpread + 1))}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
          disabled={currentSpread >= totalSpreads - 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Sayfa küçük resimleri */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {Array.from({ length: totalSpreads }).map((_, spreadIndex) => {
          const { leftPage, rightPage } = getSpreadPages(spreadIndex);
          const isActive = currentSpread === spreadIndex;
          
          return (
            <div 
              key={spreadIndex}
              className={`p-2 border rounded-md cursor-pointer ${
                isActive 
                  ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/30' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700'
              }`}
              onClick={() => onSpreadChange(spreadIndex)}
            >
              <div className="flex items-center">
                <div className="w-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {leftPage?.pageNumber || '-'}
                </div>
                
                <div className="flex-1 flex">
                  {/* Sol sayfa önizleme */}
                  <div className="flex-1 h-12 bg-white dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600 rounded-l-sm relative overflow-hidden">
                    {leftPage?.image && (
                      <div className="absolute inset-0">
                        <img 
                          src={leftPage.image} 
                          alt={`Sayfa ${leftPage.pageNumber}`} 
                          className="w-full h-full object-cover opacity-30"
                        />
                      </div>
                    )}
                    
                    {leftPage?.isCoverPage && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-sky-500 dark:text-sky-400">
                        Kapak
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 truncate">
                      {leftPage?.content?.substring(0, 20) || 'Boş sayfa'}
                    </div>
                  </div>
                  
                  {/* Sağ sayfa önizleme */}
                  <div className="flex-1 h-12 bg-white dark:bg-gray-700 rounded-r-sm relative overflow-hidden">
                    {rightPage?.image && (
                      <div className="absolute inset-0">
                        <img 
                          src={rightPage.image} 
                          alt={`Sayfa ${rightPage?.pageNumber}`} 
                          className="w-full h-full object-cover opacity-30"
                        />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 truncate">
                      {rightPage?.content?.substring(0, 20) || 'Boş sayfa'}
                    </div>
                  </div>
                </div>
                
                <div className="w-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {rightPage?.pageNumber || '-'}
                </div>
              </div>
              
              {/* Silme butonu */}
              {spreadIndex > 0 && (
                <div className="mt-1 flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSpread(spreadIndex);
                    }}
                    className="text-[10px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Sil
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Yeni sayfa ekleme */}
      <button 
        onClick={onAddSpread}
        className="w-full p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-sky-500 dark:hover:border-sky-400 text-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default PageNavigator; 