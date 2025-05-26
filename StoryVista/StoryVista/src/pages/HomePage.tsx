import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/authContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  
  // Animasyon başlangıç değerleri
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  };

  // Hikaye türleri
  const storyCategories = [
    {
      id: "macera",
      name: "Macera",
      description: "Heyecan dolu macera hikayeleri",
      image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=2070&auto=format&fit=crop",
      color: "from-yellow-400 to-orange-400",
      borderColor: "border-yellow-400 dark:border-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
      iconColor: "text-yellow-500 dark:text-yellow-400",
      stories: [
        { title: "Kayıp Hazine", author: "Ahmet K.", rating: 4.7 },
        { title: "Gizli Vadi", author: "Zeynep L.", rating: 4.5 },
        { title: "Aslanın İzinde", author: "Mehmet N.", rating: 4.8 }
      ]
    },
    {
      id: "bilim-kurgu",
      name: "Bilim Kurgu",
      description: "Bilim ve teknolojiyi keşfeden hikayeler",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      color: "from-blue-400 to-cyan-400",
      borderColor: "border-blue-400 dark:border-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      iconColor: "text-blue-500 dark:text-blue-400",
      stories: [
        { title: "Mars'ta Bir Gün", author: "Ali Ç.", rating: 4.9 },
        { title: "Yapay Zeka", author: "Selin T.", rating: 4.6 },
        { title: "Uzay İstasyonu", author: "Emre D.", rating: 4.7 }
      ]
    },
    {
      id: "fantastik",
      name: "Fantastik",
      description: "Büyülü dünyalara yolculuk hikayeleri",
      image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=2070&auto=format&fit=crop",
      color: "from-sky-400 to-blue-400",
      borderColor: "border-sky-400",
      bgColor: "bg-sky-50",
      iconColor: "text-sky-500",
      stories: [
        { title: "Ejderha Vadisi", author: "Ayşe Y.", rating: 4.8 },
        { title: "Büyücünün Kitabı", author: "Murat K.", rating: 4.6 },
        { title: "Orman Krallığı", author: "Deniz F.", rating: 4.7 }
      ]
    },
    {
      id: "gizem",
      name: "Gizem",
      description: "Sürükleyici gizem hikayeleri",
      image: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=2070&auto=format&fit=crop",
      color: "from-blue-400 to-sky-400",
      borderColor: "border-blue-400",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      stories: [
        { title: "Eski Malikane", author: "Canan D.", rating: 4.5 },
        { title: "Karanlık Sırlar", author: "Burak T.", rating: 4.9 },
        { title: "Gece Yarısı", author: "Elif S.", rating: 4.7 }
      ]
    }
  ];

  return (
    <div className="dark:bg-gray-900 dark:text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 pb-24 text-gray-700 dark:text-gray-200 relative overflow-hidden">
        {/* Dekoratif Elementler */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-sky-200 dark:bg-sky-800 opacity-50 blur-3xl -translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-200 dark:bg-blue-800 opacity-50 blur-3xl translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-sky-200 dark:bg-sky-800 opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight dark:text-white">
                Hayal Gücünüzü <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-300 dark:to-blue-400">Hikayelere</span> Dönüştürün
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl">
                StoryVista ile yapay zeka desteğiyle benzersiz hikayeler oluşturun, 
                görselleştirin ve seslendirin. Yaratıcılığınızın sınırlarını keşfedin.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Link 
                    to="/create-story" 
                    className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all shadow-md"
                  >
                    Hikaye Oluştur
                  </Link>
                ) : (
                  <Link 
                    to="/login" 
                    className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all shadow-md"
                  >
                    Giriş Yap
                  </Link>
                )}
                <Link 
                  to="/categories" 
                  className="inline-block bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-full font-medium transition-all shadow-md"
                >
                  Hikayeleri Keşfet
                </Link>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1 relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80" 
                  alt="StoryVista App Preview" 
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Özet Tanıtım Kartları */}
      <section className="py-12 bg-white dark:bg-gray-900 relative">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-16"
          >
            {[
              {
                title: "Yapay Zeka Hikayeler",
                description: "Birkaç tıklama ile yapay zeka destekli özgün hikayeler oluşturun",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                ),
                color: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
                border: "border-sky-300 dark:border-sky-700"
              },
              {
                title: "Sesli Hikayeler",
                description: "Tüm hikayelerinizi doğal sesle dinleyin ve paylaşın",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                ),
                color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                border: "border-blue-300 dark:border-blue-700"
              },
              {
                title: "Görselli Kitaplık",
                description: "Benzersiz görsellerle hikayelerinizi zenginleştirin",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                ),
                color: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
                border: "border-sky-300 dark:border-sky-700"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border ${feature.border}`}
              >
                <div className={`mb-4 rounded-full w-12 h-12 flex items-center justify-center ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popüler Hikayeler */}
      <section className="py-16 bg-sky-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Popüler Hikayeler</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              En sevilen hikayelerimizi keşfedin ve okuma maceranıza başlayın
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex space-x-6 py-4 pb-8"
              animate={{ x: [0, -1800, 0] }}
              transition={{ 
                duration: 30, 
                ease: "linear", 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            >
              {Array(10).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-gray-900 shadow-md rounded-xl w-72 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <img 
                    src={`https://picsum.photos/300/180?random=${i+1}`}
                    alt={`Story ${i+1}`}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">Hikaye Başlığı {i+1}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Kısa bir hikaye açıklaması burada yer alacak şekilde tasarlanmıştır.
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-500">Yazar Adı</span>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                          {(4 + Math.random()).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hikaye Türleri */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Hikaye Türleri</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Farklı türlerde binlerce hikaye arasından zevkinize uygun olanları keşfedin
            </p>
          </div>
          
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {storyCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className={`overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border ${category.borderColor}`}
                variants={itemVariants}
              >
                <div className="h-40 overflow-hidden relative">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60`}></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{category.description}</p>
                  <div className="space-y-2">
                    {category.stories.map((story, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{story.title}</span>
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${category.iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-xs">{story.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Link 
                  to={`/categories?category=${category.id}`}
                  className={`block text-center py-3 text-white ${category.color}`}
                >
                  Hepsini Gör
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Harekete Geçme Bölümü */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80" 
                  alt="Write Your Story" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Hayal Gücünüz Sınır Tanımasın</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Yapay zeka teknolojimizle hikayelerinizi hayata geçirin. İster macera, ister bilim kurgu, ister fantastik - tüm hikayeleriniz gerçeğe dönüşsün.
                </p>
                {user ? (
                  <Link 
                    to="/create-story" 
                    className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all shadow-md text-center"
                  >
                    Hikaye Oluşturmaya Başla
                  </Link>
                ) : (
                  <Link 
                    to="/register" 
                    className="inline-block bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all shadow-md text-center"
                  >
                    Hemen Kaydol
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 