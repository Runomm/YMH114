import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/authContext';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-stories' | 'favorites' | 'recent'>('my-stories');
  
  // Bu veriler normalde bir API'den çekilecek
  const [myStories, setMyStories] = useState([
    {
      id: '1',
      title: 'Ormandaki Macera',
      cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=2070',
      category: 'Macera',
      createdAt: '2023-10-15',
      rating: 4.7,
      duration: '8 dk'
    },
    {
      id: '2',
      title: 'Uzay Yolculuğu',
      cover: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=2071',
      category: 'Bilim Kurgu',
      createdAt: '2023-10-10',
      rating: 4.5,
      duration: '12 dk'
    },
    {
      id: '3',
      title: 'Gizemli Köy',
      cover: 'https://images.unsplash.com/photo-1588001400947-6385aef4ab0e?auto=format&fit=crop&q=80&w=2069',
      category: 'Gizem',
      createdAt: '2023-10-05',
      rating: 4.8,
      duration: '10 dk'
    }
  ]);
  
  const [favoriteStories, setFavoriteStories] = useState([
    {
      id: '4',
      title: 'Denizin Derinlikleri',
      cover: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&q=80&w=2070',
      category: 'Macera',
      createdAt: '2023-09-20',
      rating: 4.9,
      duration: '15 dk'
    },
    {
      id: '5',
      title: 'Kayıp Şehir',
      cover: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&q=80&w=2070',
      category: 'Fantastik',
      createdAt: '2023-09-15',
      rating: 4.6,
      duration: '11 dk'
    }
  ]);
  
  const [recentlyViewed, setRecentlyViewed] = useState([
    {
      id: '6',
      title: 'Gece Bekçileri',
      cover: 'https://images.unsplash.com/photo-1507676385008-e7fb562d11f8?auto=format&fit=crop&q=80&w=2069',
      category: 'Gizem',
      createdAt: '2023-09-10',
      rating: 4.3,
      duration: '9 dk'
    },
    {
      id: '2',
      title: 'Uzay Yolculuğu',
      cover: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&q=80&w=2071',
      category: 'Bilim Kurgu',
      createdAt: '2023-10-10',
      rating: 4.5,
      duration: '12 dk'
    }
  ]);
  
  const renderStories = (stories: any[]) => {
    if (stories.length === 0) {
      return (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13c-1.168-.776-2.754-1.253-4.5-1.253-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Henüz hikaye yok</h3>
          <p className="text-gray-500 dark:text-gray-500 mt-2 mb-6">Burası biraz boş görünüyor.</p>
          <Link 
            to="/create-story" 
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Yeni Hikaye Oluştur
          </Link>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto pb-6">
        <div className="flex space-x-6 px-2 py-4">
          {stories.map((story, index) => (
            <motion.div 
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="min-w-[240px] max-w-[240px] bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 group"
            >
              <div className="relative h-36">
                <img 
                  src={story.cover} 
                  alt={story.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2 py-1 mb-1 text-xs bg-orange-500 text-white rounded-full">
                    {story.category}
                  </span>
                  <h3 className="text-sm font-bold text-white line-clamp-1">{story.title}</h3>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs text-gray-700 dark:text-gray-300 ml-1">{story.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{story.duration}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{story.createdAt}</span>
                  <div className="flex space-x-2">
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Link 
                    to={`/read-story/${story.id}`}
                    className="block w-full text-center py-1.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm rounded-lg transition-colors"
                  >
                    Hikayeyi Oku
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          <Link 
            to="/create-story"
            className="min-w-[240px] max-w-[240px] bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center"
          >
            <div className="text-center p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 dark:text-orange-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yeni Hikaye Oluştur</span>
            </div>
          </Link>
        </div>
      </div>
    );
  };
  
  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-r from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Başlık ve Üst Bölüm */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Kitaplığım</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Hikayelerinizi yönetin, düzenleyin ve okuyun.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link 
                  to="/create-story"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Yeni Hikaye Oluştur
                </Link>
              </div>
            </div>
            
            {/* Tablar */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('my-stories')}
                  className={`py-3 px-1 inline-flex items-center text-sm font-medium border-b-2 ${
                    activeTab === 'my-stories'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Hikayelerim
                  <span className="ml-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 py-0.5 px-2 rounded-full text-xs">
                    {myStories.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`py-3 px-1 inline-flex items-center text-sm font-medium border-b-2 ${
                    activeTab === 'favorites'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Favorilerim
                  <span className="ml-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 py-0.5 px-2 rounded-full text-xs">
                    {favoriteStories.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`py-3 px-1 inline-flex items-center text-sm font-medium border-b-2 ${
                    activeTab === 'recent'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Son Okunanlar
                  <span className="ml-2 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 py-0.5 px-2 rounded-full text-xs">
                    {recentlyViewed.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Hikaye Listesi Bölümü */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            {activeTab === 'my-stories' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Hikayelerim</h2>
                </div>
                {renderStories(myStories)}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Favorilerim</h2>
                </div>
                {renderStories(favoriteStories)}
              </div>
            )}
            
            {activeTab === 'recent' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-white">Son Okunanlar</h2>
                </div>
                {renderStories(recentlyViewed)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 