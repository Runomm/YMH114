import React from 'react';
import { Page } from './BookEditor';

interface EditorToolbarProps {
  activeTool: 'text' | 'image' | 'ai';
  onToolChange: (tool: 'text' | 'image' | 'ai') => void;
  onAddImage: (pageId: string, imageUrl: string) => void;
  onGenerateAiContent: (pageId: string, prompt: string) => void;
  currentPage: Page | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onToolChange,
  onAddImage,
  onGenerateAiContent,
  currentPage
}) => {
  const [imageUrl, setImageUrl] = React.useState('');
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [showImagePreview, setShowImagePreview] = React.useState(false);
  
  const handleAddImage = () => {
    if (currentPage && imageUrl) {
      onAddImage(currentPage.id, imageUrl);
      setImageUrl('');
    }
  };
  
  const handleGenerateContent = () => {
    if (currentPage && aiPrompt) {
      onGenerateAiContent(currentPage.id, aiPrompt);
      setAiPrompt('');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Araç seçim butonları */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
        <button 
          className={`flex-1 py-2 px-3 rounded-md text-sm ${
            activeTool === 'text' 
              ? 'bg-white dark:bg-gray-800 shadow-sm text-sky-600 dark:text-sky-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600'
          }`}
          onClick={() => onToolChange('text')}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Metin</span>
          </div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 rounded-md text-sm ${
            activeTool === 'image' 
              ? 'bg-white dark:bg-gray-800 shadow-sm text-sky-600 dark:text-sky-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600'
          }`}
          onClick={() => onToolChange('image')}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Görsel</span>
          </div>
        </button>
        <button 
          className={`flex-1 py-2 px-3 rounded-md text-sm ${
            activeTool === 'ai' 
              ? 'bg-white dark:bg-gray-800 shadow-sm text-sky-600 dark:text-sky-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600'
          }`}
          onClick={() => onToolChange('ai')}
        >
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI</span>
          </div>
        </button>
      </div>
      
      {/* Aktif araca göre içerik */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        {activeTool === 'text' && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Metin Düzenleme</h4>
            <div className="grid grid-cols-2 gap-2">
              <select className="p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <option value="default">Yazı Tipi</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
              </select>
              <select className="p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <option value="normal">Normal</option>
                <option value="small">Küçük</option>
                <option value="large">Büyük</option>
              </select>
            </div>
            
            <div className="flex space-x-1 border border-gray-300 dark:border-gray-600 rounded-md p-1">
              <button className="flex-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="flex-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="flex-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Metin stilini ve formatını düzenleyin.
            </div>
          </div>
        )}
        
        {activeTool === 'image' && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Görsel Ekle</h4>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Görsel URL'si"
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            
            {imageUrl && (
              <div className="relative">
                <button 
                  className="text-xs text-sky-600 dark:text-sky-400 mb-1"
                  onClick={() => setShowImagePreview(!showImagePreview)}
                >
                  {showImagePreview ? 'Önizlemeyi Gizle' : 'Önizlemeyi Göster'}
                </button>
                
                {showImagePreview && (
                  <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 h-20">
                    <img 
                      src={imageUrl} 
                      alt="Önizleme" 
                      className="w-full h-full object-cover"
                      onError={() => alert("Görsel yüklenirken hata oluştu. URL'i kontrol edin.")}
                    />
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleAddImage}
              disabled={!imageUrl || !currentPage}
              className={`w-full p-2 rounded-md text-sm ${
                imageUrl && currentPage
                  ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/40'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Sayfaya Ekle
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Not: Görseller için URL ekleyin veya AI ile görsel oluşturun.
            </div>
          </div>
        )}
        
        {activeTool === 'ai' && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">AI ile İçerik Oluşturma</h4>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Oluşturmak istediğiniz içeriği açıklayın..."
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-800 dark:text-gray-200 min-h-[80px] resize-none"
            ></textarea>
            
            <button
              onClick={handleGenerateContent}
              disabled={!aiPrompt || !currentPage}
              className={`w-full p-2 rounded-md text-sm ${
                aiPrompt && currentPage
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              İçerik Oluştur
            </button>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Örnek: "Dağın tepesindeki küçük kulübeyi ve etrafındaki manzarayı betimleyen bir paragraf yaz."
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolbar; 