// Kütüphane Sayfası - Kullanıcı Hikayeleri
// Kullanıcının oluşturduğu, kaydettiği ve favorilediği hikayeleri görüntüler

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/authContext';
import { storyDb } from '../lib/storyDatabase';
import { StoryWithDetails } from '../lib/database.types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface LibraryState {
  myStories: StoryWithDetails[];
  favoriteStories: StoryWithDetails[];
  isLoading: boolean;
  currentTab: 'my-stories' | 'favorites' | 'drafts';
  searchQuery: string;
  sortBy: 'newest' | 'oldest' | 'title' | 'pages';
}

const LibraryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [state, setState] = useState<LibraryState>({
    myStories: [],
    favoriteStories: [],
    isLoading: true,
    currentTab: 'my-stories',
    searchQuery: '',
    sortBy: 'newest'
  });

  // Sayfa yüklendiğinde kullanıcı hikayelerini getir
  useEffect(() => {
    if (user) {
      loadUserStories();
      loadFavoriteStories();
    }
  }, [user]);

  // Kullanıcının hikayelerini yükle
  const loadUserStories = async () => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await storyDb.stories.getUserStories(
        user.id,
        state.currentTab === 'drafts' ? 'draft' : 'published',
        1,
        50 // İlk 50 hikayeyi getir
      );
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          myStories: result.data,
          isLoading: false 
        }));
      } else {
        console.error('Hikaye yükleme hatası:', result.error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Favori hikayeleri yükle
  const loadFavoriteStories = async () => {
    if (!user) return;
    
    try {
      const result = await storyDb.library.getUserLibrary(user.id, 1, 50);
      
      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          favoriteStories: result.data 
        }));
      }
    } catch (error) {
      console.error('Favori hikayeler yüklenemedi:', error);
    }
  };

  // Hikaye silme
  const deleteStory = async (storyId: string) => {
    if (!confirm('Bu hikayeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      const result = await storyDb.stories.deleteStory(storyId);
      
      if (result.success) {
        toast.success('Hikaye başarıyla silindi');
        loadUserStories(); // Listeyi yenile
      } else {
        toast.error(result.error || 'Hikaye silinemedi');
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu');
    }
  };

  // Hikaye yayınlama/gizleme
  const toggleStoryVisibility = async (storyId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'published') {
        // Hikayeyi gizle (taslak yap)
        const result = await storyDb.stories.updateStory(storyId, { status: 'draft' });
        
        if (result.success) {
          toast.success('Hikaye taslak olarak ayarlandı');
          loadUserStories();
        } else {
          toast.error('İşlem başarısız');
        }
      } else {
        // Hikayeyi yayınla
        const result = await storyDb.stories.publishStory(storyId);
        
        if (result.success) {
          toast.success('Hikaye başarıyla yayınlandı');
          loadUserStories();
        } else {
          toast.error('Yayınlama başarısız');
        }
      }
    } catch (error) {
      toast.error('Beklenmeyen bir hata oluştu');
    }
  };

  // Hikaye düzenleme
  const editStory = (storyId: string) => {
    navigate(`/create?edit=${storyId}`);
  };

  // Hikaye kartı bileşeni
  const StoryCard: React.FC<{ story: StoryWithDetails; showActions?: boolean }> = ({ story, showActions = true }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Kapak görseli */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
        {story.cover_image_url ? (
          <img 
            src={story.cover_image_url} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        
        {/* Durum rozeti */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            story.status === 'published' 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-black'
          }`}>
            {story.status === 'published' ? 'Yayınlandı' : 'Taslak'}
          </span>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {story.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {story.story_description || 'Açıklama bulunmuyor'}
        </p>
        
        {/* Meta bilgiler */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>{story.page_count} sayfa</span>
          <span>{story.read_time} dk okuma</span>
          <span>{story.view_count || 0} görüntülenme</span>
        </div>
        
        {/* Etiketler */}
        <div className="flex flex-wrap gap-2 mb-4">
          {story.category && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
              {story.category.name}
            </span>
          )}
          {story.theme && (
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
              {story.theme.name}
            </span>
          )}
        </div>
        
        {/* Aksiyon butonları */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => editStory(story.id)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Düzenle
            </button>
            
            <button
              onClick={() => toggleStoryVisibility(story.id, story.status)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                story.status === 'published'
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {story.status === 'published' ? 'Gizle' : 'Yayınla'}
            </button>
            
            <button
              onClick={() => deleteStory(story.id)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Sil
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Filtreleme ve sıralama
  const getFilteredAndSortedStories = () => {
    let stories = state.currentTab === 'favorites' ? state.favoriteStories : state.myStories;
    
    // Arama filtresi
    if (state.searchQuery) {
      stories = stories.filter(story => 
        story.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (story.story_description || '').toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
    
    // Sıralama
    switch (state.sortBy) {
      case 'newest':
        return stories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return stories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'title':
        return stories.sort((a, b) => a.title.localeCompare(b.title));
      case 'pages':
        return stories.sort((a, b) => (b.page_count || 0) - (a.page_count || 0));
      default:
        return stories;
    }
  };

  // Giriş kontrolü
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Kütüphaneye Erişim
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Kütüphanenizi görüntülemek için giriş yapmanız gerekiyor.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Hikaye Kütüphanem
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Oluşturduğunuz ve kaydettiğiniz hikayeleri yönetin
              </p>
            </div>
            
            <button
              onClick={() => navigate('/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Hikaye
            </button>
          </div>
        </div>
      </div>

      {/* Kontroller */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sekme navigasyonu */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
          {[
            { key: 'my-stories', label: 'Hikayelerim', count: state.myStories.length },
            { key: 'drafts', label: 'Taslaklar', count: state.myStories.filter(s => s.status === 'draft').length },
            { key: 'favorites', label: 'Favoriler', count: state.favoriteStories.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setState(prev => ({ ...prev, currentTab: tab.key as any }));
                if (tab.key !== 'favorites') {
                  loadUserStories();
                }
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                state.currentTab === tab.key
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Arama ve sıralama */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Hikaye ara..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={state.sortBy}
            onChange={(e) => setState(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
            <option value="title">Başlığa Göre</option>
            <option value="pages">Sayfa Sayısına Göre</option>
          </select>
        </div>

        {/* İçerik */}
        {state.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {getFilteredAndSortedStories().map(story => (
                <StoryCard 
                  key={story.id} 
                  story={story} 
                  showActions={state.currentTab !== 'favorites'}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Boş durum */}
        {!state.isLoading && getFilteredAndSortedStories().length === 0 && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {state.currentTab === 'favorites' ? 'Henüz favori hikayen yok' : 'Henüz hikaye oluşturmamışsın'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {state.currentTab === 'favorites' 
                ? 'Beğendiğin hikayeleri kütüphanene ekleyebilirsin'
                : 'İlk hikayeni oluşturmak için hemen başla!'
              }
            </p>
            {state.currentTab !== 'favorites' && (
              <button
                onClick={() => navigate('/create')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                İlk Hikayeni Oluştur
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage; 