import React, { useState } from 'react';
import { StoryPrompt } from '../lib/aiService';
import { useAuth } from '../lib/authContext';

interface StoryFormProps {
  onSubmit: (prompt: StoryPrompt) => Promise<void>;
  loading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, loading }) => {
  const { user } = useAuth();
  
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('Macera');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [tone, setTone] = useState<'serious' | 'humorous' | 'romantic' | 'thriller'>('serious');
  const [characterCount, setCharacterCount] = useState<number>(2);
  const [inspiration, setInspiration] = useState<string>('');
  const [mainCharacter, setMainCharacter] = useState<string>('');
  const [setting, setSetting] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');
  
  // Kategori seçenekleri
  const categories = [
    'Macera',
    'Romantizm',
    'Bilim Kurgu',
    'Gerilim',
    'Fantastik',
    'Tarih'
  ];
  
  // Uzunluk seçenekleri
  const lengthOptions = [
    { value: 'short', label: 'Kısa (300 kelime)' },
    { value: 'medium', label: 'Orta (600 kelime)' },
    { value: 'long', label: 'Uzun (1000 kelime)' }
  ];
  
  // Ton seçenekleri
  const toneOptions = [
    { value: 'serious', label: 'Ciddi' },
    { value: 'humorous', label: 'Mizahi' },
    { value: 'romantic', label: 'Romantik' },
    { value: 'thriller', label: 'Gerilim' }
  ];
  
  // Örnek fikirler
  const exampleInspirations = [
    'Bir uzay gemisinde kaybolan astronot',
    'Orta Çağ\'da bir büyücü çırak',
    'Modern dünyaya gelen bir zaman yolcusu',
    'Gizemli bir adada mahsur kalan bir grup turist',
    'Unutulmuş bir antik tapınak keşfeden arkeolog'
  ];
  
  // Formu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Hikaye oluşturmak için giriş yapmalısınız.');
      return;
    }
    
    if (!inspiration) {
      alert('Lütfen hikaye için bir fikir girin.');
      return;
    }
    
    const prompt: StoryPrompt = {
      title,
      category,
      length,
      tone,
      characterCount,
      inspiration,
      mainCharacter: mainCharacter || undefined,
      setting: setting || undefined,
      timeline: timeline || undefined
    };
    
    await onSubmit(prompt);
  };
  
  // Sonraki adıma geç
  const nextStep = () => {
    if (step === 1 && !category) {
      alert('Lütfen bir kategori seçin.');
      return;
    }
    
    if (step === 2 && !inspiration) {
      alert('Lütfen hikaye için bir fikir girin.');
      return;
    }
    
    setStep(step + 1);
  };
  
  // Önceki adıma dön
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Örnek bir fikir seç
  const selectExample = (example: string) => {
    setInspiration(example);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
            Adım {step}/3
          </span>
        </div>
        
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Hikayenizi Özelleştirin</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hikaye Başlığı (Opsiyonel)</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ör: Ay'da Bir Gece"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      className={`px-4 py-2 rounded-md ${
                        category === cat 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hikaye Uzunluğu</label>
                <div className="grid grid-cols-3 gap-2">
                  {lengthOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`px-4 py-2 rounded-md ${
                        length === option.value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => setLength(option.value as 'short' | 'medium' | 'long')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ton</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {toneOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`px-4 py-2 rounded-md ${
                        tone === option.value 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => setTone(option.value as 'serious' | 'humorous' | 'romantic' | 'thriller')}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Karakter Sayısı</label>
                <div className="flex items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={characterCount}
                    onChange={(e) => setCharacterCount(parseInt(e.target.value))}
                    className="flex-grow mr-4"
                  />
                  <span className="w-8 text-center">{characterCount}</span>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Hikayenize İlham Verin</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hikaye Fikri</label>
                <textarea 
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hikaye fikrinizi buraya yazın..."
                  rows={4}
                />
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Örnek fikirler:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleInspirations.map((example, index) => (
                      <button
                        key={index}
                        type="button"
                        className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => selectExample(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="font-medium mb-2">Gelişmiş Seçenekler (Opsiyonel)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Ana Karakter Adı</label>
                    <input 
                      type="text"
                      value={mainCharacter}
                      onChange={(e) => setMainCharacter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ör: Ali"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Mekan</label>
                    <input 
                      type="text"
                      value={setting}
                      onChange={(e) => setSetting(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ör: Uzay gemisi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Zaman Dilimi</label>
                    <input 
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ör: Gelecek"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Hikayenizi Tamamlayın</h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Hikaye Özeti</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Başlık:</span> {title || 'Belirtilmedi'}</p>
                <p><span className="font-medium">Kategori:</span> {category}</p>
                <p><span className="font-medium">Uzunluk:</span> {lengthOptions.find(opt => opt.value === length)?.label}</p>
                <p><span className="font-medium">Ton:</span> {toneOptions.find(opt => opt.value === tone)?.label}</p>
                <p><span className="font-medium">Karakter Sayısı:</span> {characterCount}</p>
                <p><span className="font-medium">Hikaye Fikri:</span> {inspiration}</p>
                {mainCharacter && <p><span className="font-medium">Ana Karakter:</span> {mainCharacter}</p>}
                {setting && <p><span className="font-medium">Mekan:</span> {setting}</p>}
                {timeline && <p><span className="font-medium">Zaman Dilimi:</span> {timeline}</p>}
              </div>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Hazırsanız, "Hikayeyi Oluştur" butonuna tıklayarak yapay zeka destekli hikaye oluşturma sürecini başlatabilirsiniz.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            disabled={loading}
          >
            Geri
          </button>
        ) : (
          <div></div>
        )}
        
        {step < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sonraki Adım
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Hikaye Oluşturuluyor...
              </>
            ) : (
              'Hikayeyi Oluştur'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryForm; 