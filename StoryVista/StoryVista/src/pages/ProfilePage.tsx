import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/authContext';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('stories');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  
  // Renkler - sky ve blue temalarına uyumlu hale getirildi
  const avatarColors = [
    { bg: "bg-sky-100", text: "text-sky-600", dark: "dark:bg-sky-900 dark:text-sky-300" },
    { bg: "bg-blue-100", text: "text-blue-600", dark: "dark:bg-blue-900 dark:text-blue-300" },
    { bg: "bg-indigo-100", text: "text-indigo-600", dark: "dark:bg-indigo-900 dark:text-indigo-300" },
    { bg: "bg-cyan-100", text: "text-cyan-600", dark: "dark:bg-cyan-900 dark:text-cyan-300" },
    { bg: "bg-teal-100", text: "text-teal-600", dark: "dark:bg-teal-900 dark:text-teal-300" },
    { bg: "bg-blue-100", text: "text-blue-600", dark: "dark:bg-blue-900 dark:text-blue-300" }
  ];
  
  // Avatar seçenekleri
  const avatarOptions = [
    "/avatars/avatar1.svg",
    "/avatars/avatar2.svg",
    "/avatars/avatar3.svg",
    "/avatars/avatar4.svg",
    "/avatars/avatar5.svg",
    "/avatars/avatar6.svg",
  ];
  
  // Kullanıcının adının harflerine göre rastgele ama tutarlı renk seçimi
  const getUserColorIndex = () => {
    if (!user) return 0;
    
    const name = user.user_metadata?.full_name || user.email || '';
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return sum % avatarColors.length;
  };
  
  const colorIndex = getUserColorIndex();
  const avatarColor = avatarColors[colorIndex];

  // Örnek hikayeler - şimdi kapak resimleriyle
  const userStories = [
    { 
      id: 1, 
      title: 'Uzayda Kaybolmuş', 
      category: 'Bilim Kurgu', 
      createdAt: '2023-06-15', 
      reads: 124, 
      rating: 4.5,
      coverImage: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=2074&auto=format&fit=crop',
      description: "2050 yılında Mars'a ilk insan kolonisini kuran bilim insanlarının karşılaştığı zorlukları anlatıyor."
    },
    { 
      id: 2, 
      title: 'Ejderha Vadisi', 
      category: 'Fantastik', 
      createdAt: '2023-05-22', 
      reads: 87, 
      rating: 4.2,
      coverImage: 'https://images.unsplash.com/photo-1500043357830-5e8e3a41c0da?q=80&w=2070&auto=format&fit=crop',
      description: "Genç bir ejderha eğiticisinin, kaybolduğu adada dostluk kurduğu minik bir ejderha ile yaşadığı maceralar."
    },
    { 
      id: 3, 
      title: 'Gizli Görev', 
      category: 'Macera', 
      createdAt: '2023-04-10', 
      reads: 203, 
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=2070&auto=format&fit=crop',
      description: "Ünlü bir kütüphanede çalışan genç bir kütüphanecinin, eski bir kitapta bulduğu şifreli notlarla bir kasanın peşine düşmesini konu alıyor."
    }
  ];
  
  // Örnek beğenilen hikayeler
  const favoriteStories = [
    { 
      id: 1, 
      title: 'Titanik\'in Son Yolcusu', 
      author: 'Ahmet K.', 
      category: 'Tarihi', 
      rating: 4.7,
      coverImage: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=1974&auto=format&fit=crop'
    },
    { 
      id: 2, 
      title: 'Karanlık Oda', 
      author: 'Zeynep T.', 
      category: 'Gizem', 
      rating: 4.6,
      coverImage: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=2080&auto=format&fit=crop'
    },
    { 
      id: 3, 
      title: 'Son Kumsal', 
      author: 'Mehmet D.', 
      category: 'Dram', 
      rating: 4.9,
      coverImage: 'https://images.unsplash.com/photo-1472173148041-00294f0814a2?q=80&w=2070&auto=format&fit=crop'
    },
    { 
      id: 4, 
      title: 'Ay\'ın Ötesinde', 
      author: 'Elif S.', 
      category: 'Bilim Kurgu', 
      rating: 4.4,
      coverImage: 'https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Giriş Yapın</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Profil sayfanızı görüntülemek için lütfen giriş yapın.</p>
            <Link 
              to="/login" 
              className="inline-block bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-medium"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Profil Başlığı */}
        <div className="max-w-4xl mx-auto mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
          >
            <div className="relative">
              {/* Arka plan banner */}
              <div className="h-32 sm:h-40 bg-gradient-to-r from-sky-400 to-blue-500"></div>
              
              <div className="absolute -bottom-16 left-0 w-full px-6 sm:px-8 flex justify-between">
                {/* Avatar */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${avatarColor.bg} ${avatarColor.text} ${avatarColor.dark} shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden`}>
                  {selectedAvatar > 0 ? (
                    <img src={avatarOptions[selectedAvatar - 1]} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.user_metadata?.full_name 
                      ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                      : user.email?.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* Hikaye oluştur butonu */}
                <div className="self-end mb-4">
                  <Link 
                    to="/create-story" 
                    className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-300 rounded-full font-medium shadow-md hover:bg-sky-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Yeni Hikaye
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="pt-20 px-6 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {user.user_metadata?.full_name || 'Kullanıcı'}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-3">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
                      Hikaye Yazarı
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {userStories.length} Hikaye
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={signOut}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0011 2H4a1 1 0 00-1 1zm0 2a1 1 0 011-1h6v4a1 1 0 001 1h4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5z" clipRule="evenodd" />
                    </svg>
                    Çıkış Yap
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 max-w-xl">
                StoryVista'da hayal gücümü hikayelere dönüştürüyorum. Fantastik ve bilim kurgu türlerinde hikayeler yazmayı seviyorum.
              </p>
            </div>
            
            {/* Tablar */}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <div className="flex overflow-x-auto px-6 sm:px-8">
                <button 
                  onClick={() => setActiveTab('stories')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'stories' 
                      ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Hikayelerim
                </button>
                <button 
                  onClick={() => setActiveTab('favorites')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'favorites' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Beğendiklerim
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'settings' 
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Ayarlar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Tab İçeriği */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'stories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hikayelerim</h2>
              </div>
              
              {userStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userStories.map(story => (
                    <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={story.coverImage} 
                          alt={story.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
                            {story.category}
                          </span>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-300">{story.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{story.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">{story.description}</p>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{story.createdAt}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                            {story.reads} okuma
                          </span>
                        </div>
                        <Link 
                          to={`/read-story/${story.id}`}
                          className="mt-4 block bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white text-center py-2 rounded-lg transition-colors"
                        >
                          Hikayeyi Düzenle
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Henüz Hikayen Yok</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    İlk hikayeni oluşturarak yazarlık yolculuğuna başla. İster yapay zeka yardımıyla, ister tamamen kendi hayal gücünle!
                  </p>
                  <Link 
                    to="/create-story" 
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-medium rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    İlk Hikayeni Oluştur
                  </Link>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'favorites' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Beğendiğim Hikayeler</h2>
              </div>
              
              {favoriteStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {favoriteStories.map(story => (
                    <div key={story.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={story.coverImage} 
                          alt={story.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {story.category}
                          </span>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-300">{story.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{story.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">Yazar: {story.author}</p>
                        <Link 
                          to={`/read-story/${story.id}`}
                          className="mt-auto block bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white text-center py-2 rounded-lg transition-colors"
                        >
                          Hikayeyi Oku
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Henüz Beğendiğin Hikaye Yok</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Diğer yazarların hikayelerini keşfet ve favorilerine ekle. Burada hepsi bir arada görünecek!
                  </p>
                  <Link 
                    to="/categories" 
                    className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-medium rounded-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    Hikayeleri Keşfet
                  </Link>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Hesap Ayarları</h2>
                
                <div className="space-y-8">
                  {/* Profil Bilgileri */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Profil Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
                        <input 
                          type="text" 
                          defaultValue={user.user_metadata?.full_name || ''} 
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                        <input 
                          type="email" 
                          value={user.email} 
                          disabled
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Avatar Seçimi */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Avatar Seçimi</h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Profilinizde görünecek bir avatar seçin:</p>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => setSelectedAvatar(0)}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${avatarColor.bg} ${avatarColor.text} ${avatarColor.dark} ${selectedAvatar === 0 ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''}`}
                        >
                          {user.user_metadata?.full_name 
                            ? user.user_metadata.full_name.charAt(0).toUpperCase() 
                            : user.email?.charAt(0).toUpperCase()}
                        </button>
                        
                        {avatarOptions.map((avatar, index) => (
                          <button 
                            key={index}
                            onClick={() => setSelectedAvatar(index + 1)}
                            className={`w-16 h-16 rounded-full overflow-hidden ${selectedAvatar === index + 1 ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''}`}
                          >
                            <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bildirim Ayarları */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Bildirim Ayarları</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="email_notifications" 
                          defaultChecked 
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                        />
                        <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          E-posta bildirimleri
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="story_comments" 
                          defaultChecked 
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                        />
                        <label htmlFor="story_comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Hikaye yorumları
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="new_features" 
                          defaultChecked 
                          className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                        />
                        <label htmlFor="new_features" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Yeni özellik haberleri
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium mr-3">
                      İptal
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg font-medium">
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 