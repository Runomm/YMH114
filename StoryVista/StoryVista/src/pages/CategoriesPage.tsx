import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Kategoriler
  const categories = [
    {
      id: 'all',
      name: 'Tümü',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      color: "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
    },
    {
      id: 'macera',
      name: 'Macera',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-gradient-to-r from-yellow-300 to-orange-400 dark:from-yellow-600 dark:to-orange-700"
    },
    {
      id: 'bilim-kurgu',
      name: 'Bilim Kurgu',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-gradient-to-r from-blue-300 to-cyan-400 dark:from-blue-600 dark:to-cyan-700"
    },
    {
      id: 'fantastik',
      name: 'Fantastik',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 7H7v6h6V7z" />
          <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-gradient-to-r from-sky-300 to-blue-400 dark:from-sky-600 dark:to-blue-700"
    },
    {
      id: 'gizem',
      name: 'Gizem',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-gradient-to-r from-green-300 to-teal-400 dark:from-green-600 dark:to-teal-700"
    },
    {
      id: 'komedi',
      name: 'Komedi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
        </svg>
      ),
      color: "bg-gradient-to-r from-amber-300 to-yellow-400 dark:from-amber-600 dark:to-yellow-700"
    }
  ];
  
  // Hikayeler
  const stories = [
    {
      id: 1,
      title: "Kayıp Hazinenin İzinde",
      author: "Ahmet Yılmaz",
      categoryId: "macera",
      rating: 4.7,
      readTime: "18 dk",
      image: "https://images.unsplash.com/photo-1472173148041-00294f0814a2?q=80&w=2070&auto=format&fit=crop",
      description: "Genç bir kâşif olan Ayşe, büyük babasından kalan eski bir harita ile kayıp bir hazinenin izini sürer."
    },
    {
      id: 2,
      title: "Mars'ta Bir Gün",
      author: "Zeynep Kaya",
      categoryId: "bilim-kurgu",
      rating: 4.5,
      readTime: "12 dk",
      image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?q=80&w=2074&auto=format&fit=crop",
      description: "2050 yılında Mars'a ilk insan kolonisini kuran bilim insanlarının karşılaştığı zorlukları anlatıyor."
    },
    {
      id: 3,
      title: "Sihirli Orman",
      author: "Mehmet Demir",
      categoryId: "fantastik",
      rating: 4.9,
      readTime: "15 dk",
      image: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop",
      description: "Gizemli bir ormanda kaybolan üç arkadaşın, konuşan hayvanlar ve sihirli yaratıklarla karşılaştıkları macerayı konu alıyor."
    },
    {
      id: 4,
      title: "Eski Köşkün Sırrı",
      author: "Ayşe Öztürk",
      categoryId: "gizem",
      rating: 4.6,
      readTime: "20 dk",
      image: "https://images.unsplash.com/photo-1588421357574-87938a86fa28?q=80&w=2070&auto=format&fit=crop",
      description: "Bir yaz tatilinde dedelerinin eski köşküne giden çocukların, evdeki gizli geçitleri ve eski bir aile sırrını keşfetmeleri anlatılıyor."
    },
    {
      id: 5,
      title: "Komik Robot",
      author: "Ali Can",
      categoryId: "komedi",
      rating: 4.3,
      readTime: "10 dk",
      image: "https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=1974&auto=format&fit=crop",
      description: "Komik şakalar yapan ve kendini insan sanan bir robotun, bir aileyle yaşadığı eğlenceli olayları konu alıyor."
    },
    {
      id: 6,
      title: "Derin Uzaydan Sinyal",
      author: "Burak Şahin",
      categoryId: "bilim-kurgu",
      rating: 4.8,
      readTime: "22 dk",
      image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=2080&auto=format&fit=crop",
      description: "Dünya'dan milyonlarca ışık yılı uzaklıktan gelen gizemli bir sinyali çözmeye çalışan bilim insanlarının hikayesi."
    },
    {
      id: 7,
      title: "Ejderha Adası",
      author: "Deniz Yıldız",
      categoryId: "fantastik",
      rating: 4.4,
      readTime: "18 dk",
      image: "https://images.unsplash.com/photo-1500043357830-5e8e3a41c0da?q=80&w=2070&auto=format&fit=crop",
      description: "Genç bir ejderha eğiticisinin, kaybolduğu adada dostluk kurduğu minik bir ejderha ile yaşadığı maceralar."
    },
    {
      id: 8,
      title: "Saklı Kasa",
      author: "Gizem Acar",
      categoryId: "gizem",
      rating: 4.7,
      readTime: "16 dk",
      image: "https://images.unsplash.com/photo-1553481187-be93c21490a9?q=80&w=2070&auto=format&fit=crop",
      description: "Ünlü bir kütüphanede çalışan genç bir kütüphanecinin, eski bir kitapta bulduğu şifreli notlarla bir kasanın peşine düşmesini konu alıyor."
    }
  ];
  
  // Filtrelenmiş hikayeler
  const filteredStories = stories.filter(story => {
    // Kategori filtresi
    const matchesCategory = selectedCategory === null || selectedCategory === 'all' || story.categoryId === selectedCategory;
    
    // Arama filtresi (başlık veya yazar ismine göre)
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          story.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Sayfa yüklendiğinde kategorileri sıfırla
  useEffect(() => {
    setSelectedCategory('all');
  }, []);
  
  // Kategori adına göre kategori nesnesini bul
  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Sayfa Başlığı */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold mb-4 text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">Hikaye</span> Kategorileri
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            İlgi alanlarınıza göre hikayeleri keşfedin ve okuyun. Her yaşa uygun binlerce hikaye içinde kaybolun.
          </motion.p>
        </div>
        
        {/* Arama ve Filtreler */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Hikaye veya yazar ara..."
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-800 dark:placeholder-gray-400 transition-colors"
                  />
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-4 top-3.5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Kategori Kartları */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl ${category.color} ${
                  selectedCategory === category.id ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''
                } transition-all flex flex-col items-center`}
              >
                <div className="mb-2">{category.icon}</div>
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Hikaye Listesi */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            {selectedCategory && selectedCategory !== 'all' 
              ? `${getCategoryById(selectedCategory).name} Hikayeleri` 
              : 'Tüm Hikayeler'}
            {searchTerm && ` - "${searchTerm}" için sonuçlar`}
          </h2>
          
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden h-full flex flex-col"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${getCategoryById(story.categoryId).color} bg-opacity-20`}>
                        {getCategoryById(story.categoryId).name}
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
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{story.author}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                        {story.readTime}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/read-story/${story.id}`}
                    className="block bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white text-center py-3 transition-colors"
                  >
                    Hikayeyi Oku
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Hikaye Bulunamadı</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Aramanıza uygun hikaye bulamadık. Lütfen farklı anahtar kelimelerle tekrar deneyin veya başka bir kategori seçin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage; 