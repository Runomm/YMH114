import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LessonCard from '../components/LessonCard';
import CategoryCard from '../components/CategoryCard';

const LearnPage: React.FC = () => {
  // Öğrenme içeriği kategorileri
  const learningCategories = [
    {
      id: 'writing-basics',
      title: 'Hikaye Yazmanın Temelleri',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      color: 'bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-700',
      description: 'Hikaye yapısını, karakterleri ve etkileyici bir anlatım oluşturmayı öğrenin.',
      lessons: [
        { title: 'Hikaye Yapısı', duration: '10 dk', level: 'Başlangıç' },
        { title: 'Karakter Geliştirme', duration: '12 dk', level: 'Orta' },
        { title: 'Etkileyici Diyaloglar', duration: '8 dk', level: 'Orta' },
        { title: 'Mekan ve Atmosfer', duration: '15 dk', level: 'İleri' },
      ]
    },
    {
      id: 'story-types',
      title: 'Hikaye Türleri',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700',
      description: 'Farklı türlerde hikayeler yazmanın inceliklerini keşfedin.',
      lessons: [
        { title: 'Macera Hikayeleri', duration: '8 dk', level: 'Başlangıç' },
        { title: 'Fantastik Hikayeler', duration: '10 dk', level: 'Orta' },
        { title: 'Bilim Kurgu', duration: '12 dk', level: 'Orta' },
        { title: 'Gizem ve Gerilim', duration: '9 dk', level: 'İleri' },
      ]
    },
    {
      id: 'creative-techniques',
      title: 'Yaratıcı Teknikleri',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-800 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-700',
      description: 'Yaratıcı düşünme, beyin fırtınası ve özgün hikayeler üretme teknikleri.',
      lessons: [
        { title: 'Beyin Fırtınası', duration: '6 dk', level: 'Başlangıç' },
        { title: 'Görselleştirme', duration: '8 dk', level: 'Orta' },
        { title: 'Merak Uyandırma', duration: '10 dk', level: 'Orta' },
        { title: 'Plot Twist Teknikleri', duration: '15 dk', level: 'İleri' },
      ]
    },
    {
      id: 'ai-storytelling',
      title: 'Yapay Zeka ile Hikaye',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-700',
      description: 'Yapay zeka araçlarını kullanarak hikaye yaratma ve geliştirme.',
      lessons: [
        { title: 'AI Hikaye Temelleri', duration: '10 dk', level: 'Başlangıç' },
        { title: 'Etkili Promtlar', duration: '12 dk', level: 'Orta' },
        { title: 'AI Görsel Üretimi', duration: '8 dk', level: 'Orta' },
        { title: 'İnsan+AI İşbirliği', duration: '14 dk', level: 'İleri' },
      ]
    }
  ];

  // Öne çıkan dersler
  const featuredLessons = [
    {
      title: 'Çocuklar İçin Hikaye Yazma',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
      category: 'Ders',
      duration: '25 dk',
      description: 'Çocukların hayal gücünü cezbedecek hikayeler nasıl yazılır? Adım adım öğrenin!'
    },
    {
      title: 'Hikaye Yazarken Yapılan Yaygın Hatalar',
      image: 'https://images.unsplash.com/photo-1456081101716-74e616ab23d8?q=80&w=1976&auto=format&fit=crop',
      category: 'İpuçları',
      duration: '18 dk',
      description: 'Yeni başlayan yazarların sıklıkla yaptığı hataları öğrenin ve hikayelerinizi geliştirin.'
    },
    {
      title: 'Sesli Hikaye Anlatımı',
      image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=2070&auto=format&fit=crop',
      category: 'Atölye',
      duration: '20 dk',
      description: 'Hikayelerinizi sesli anlatırken ses tonunuzu ve vurguları nasıl kullanacağınızı öğrenin.'
    },
    {
      title: 'Yapay Zeka İle Hikaye Oluşturma',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
      category: 'Workshop',
      duration: '30 dk',
      description: 'StoryVista yapay zeka araçlarını kullanarak etkileyici hikayeler oluşturmayı öğrenin.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Hero Bölümü */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative pt-24">
          {/* Dekoratif öğeler */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-sky-100 opacity-50 dark:opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-blue-100 opacity-50 dark:opacity-10 blur-3xl translate-x-1/2 translate-y-1/2"></div>
          
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Hikaye Anlatıcılığı <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-500">Öğrenme Merkezi</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Hayal gücünü hikayelere dönüştürme sanatını keşfedin. Kapsamlı dersler, pratik ipuçları ve yaratıcı egzersizlerle hikaye anlatıcılığı becerilerinizi geliştirin.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/learn/beginner" className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-medium rounded-full shadow-md transition-all">
                Başlangıç Dersleri
              </Link>
              <Link to="/learn/advanced" className="inline-block px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium rounded-full shadow-md transition-all">
                İleri Seviye İçerik
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Öne Çıkan Dersler */}
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Öne Çıkan Dersler</h2>
            <Link to="/learn/all" className="text-sky-600 dark:text-sky-400 font-medium hover:underline flex items-center">
              Tümünü Gör
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredLessons.map((lesson, index) => (
              <LessonCard
                key={index}
                title={lesson.title}
                image={lesson.image}
                category={lesson.category}
                duration={lesson.duration}
                description={lesson.description}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Öğrenme Kategorileri */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Öğrenme Yolculuğun</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {learningCategories.map((category, index) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                border={category.border}
                lessons={category.lessons}
                index={index}
              />
            ))}
          </div>
        </div>
        
        {/* Alt Banner - Abonelik */}
        <div className="max-w-5xl mx-auto mb-20">
          <motion.div 
            className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Dekoratif elementler */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-100 opacity-10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Premium İçeriklerle Becerilerini Geliştir</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl">
                Premium üyelik ile özel atölyelere, gelişmiş içeriklere ve profesyonel geri bildirimlere erişin. Hikaye yazma becerilerinizi bir sonraki seviyeye taşıyın.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/pricing" className="inline-block px-6 py-3 bg-white text-sky-600 hover:bg-sky-50 rounded-full font-medium shadow-md transition-all">
                  Premium'a Geç
                </Link>
                <button className="inline-block px-6 py-3 bg-sky-400 bg-opacity-20 hover:bg-opacity-30 text-white border border-white/30 rounded-full font-medium transition-all">
                  Daha Fazla Bilgi
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Başarı Hikayeleri */}
        <div className="max-w-4xl mx-auto mb-20 text-center">
          <h2 className="text-2xl font-bold mb-12 text-gray-800 dark:text-white">Öğrencilerimizin Başarı Hikayeleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVvcGxlfGVufDB8fDB8fHww" 
                  alt="Kullanıcı" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                "StoryVista'nın eğitimleri sayesinde ilk çocuk kitabımı yazmayı başardım. Harika bir deneyimdi!"
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-medium">Ahmet K.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                  alt="Kullanıcı" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                "Karakter geliştirme derslerinden sonra hikayelerim çok daha derinlikli ve etkileyici olmaya başladı."
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-medium">Zeynep M.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D" 
                  alt="Kullanıcı" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                "Yapay zeka ile hikaye oluşturma atölyesi inanılmazdı. Artık çok daha hızlı içerik üretebiliyorum."
              </p>
              <p className="text-sky-600 dark:text-sky-400 font-medium">Murat S.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage; 