import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  // Takım üyeleri
  const teamMembers = [
    {
      name: "Ahmet Yılmaz",
      role: "Kurucu & CEO",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "10 yıllık yazılım deneyimiyle hikaye anlatımını teknolojiyle buluşturmak amacıyla StoryVista'yı kurdu."
    },
    {
      name: "Zeynep Kaya",
      role: "Yaratıcı Direktör",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "Çocuk kitapları yazarı ve illüstratör. StoryVista'da hikaye içeriklerinin geliştirilmesini yönetiyor."
    },
    {
      name: "Mehmet Demir",
      role: "Yapay Zeka Uzmanı",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "Doğal dil işleme alanında uzman. StoryVista'nın yapay zeka altyapısını geliştiriyor."
    },
    {
      name: "Ayşe Şahin",
      role: "Ürün Müdürü",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80",
      bio: "Kullanıcı deneyimi tasarımcısı. StoryVista'nın sezgisel ve çocuk dostu arayüzünü tasarlıyor."
    }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-r from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Hero Bölümü */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold mb-6 text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">StoryVista</span> Hakkında
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Çocuklar ve yetişkinler için özelleştirilmiş, yapay zeka destekli hikaye platformu.
          </motion.p>
        </div>

        {/* Hikayemiz */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:shrink-0">
                <img 
                  className="h-48 w-full object-cover md:h-full md:w-48" 
                  src="https://images.unsplash.com/photo-1519682577862-22b62b24e493?ixlib=rb-4.0.3&auto=format&fit=crop&q=80&w=2670"
                  alt="StoryVista Ofisi" 
                />
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-sky-500 font-semibold">Hikayemiz</div>
                <h2 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white">Hayal Gücünü Serbest Bırakmak</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  StoryVista, 2021 yılında çocukların ve yetişkinlerin yaratıcılığını geliştirmek amacıyla kuruldu. Amacımız, yapay zeka teknolojisini kullanarak herkese özel, eğitici ve eğlenceli hikayeler sunmaktır.
                </p>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Küçük bir ekip olarak başladığımız yolculuğumuzda, bugün dünya genelinde yüz binlerce kullanıcıya hizmet veriyoruz. Her gün binlerce yeni hikaye oluşturuluyor ve okuyucularla buluşuyor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Misyon ve Vizyon */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border-l-4 border-sky-400"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Misyonumuz</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Yapay zeka teknolojisini kullanarak, her çocuğun hayal gücünü geliştirecek, değerli hayat dersleri içeren hikayeler sunmak. Okuma sevgisini artırarak, çocukların zihinsel ve duygusal gelişimlerine katkıda bulunmak.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border-l-4 border-sky-400"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Vizyonumuz</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Dünyanın en kapsamlı ve kişiselleştirilmiş hikaye platformu olmak. Yapay zeka ile desteklenen içeriklerimizle her yaştan insanın hikayeler aracılığıyla öğrenmesini ve eğlenmesini sağlamak.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Ekibimiz */}
        <section className="mb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-10 text-center text-gray-800 dark:text-white">Ekibimizle Tanışın</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:shrink-0">
                      <img className="h-48 w-full object-cover md:h-full md:w-48" src={member.image} alt={member.name} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{member.name}</h3>
                      <p className="text-sky-500 text-sm font-medium">{member.role}</p>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">{member.bio}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* İletişim */}
        <section>
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Bize Ulaşın</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">İletişim Bilgileri</h3>
                  <div className="space-y-3">
                    <p className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      İstanbul, Türkiye
                    </p>
                    <p className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      iletisim@storyvista.com
                    </p>
                    <p className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-sky-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      +90 212 123 45 67
                    </p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Bizi Takip Edin</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63z" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 7h-2v-3c0-.55-.45-1-1-1s-1 .45-1 1v3h-2v-6h2v1.1c.52-.7 1.37-1.1 2-1.1 1.66 0 3 1.34 3 3v3z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Mesaj Gönderin</h3>
                  <form>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                        Adınız
                      </label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Adınız Soyadınız" 
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                        E-posta Adresiniz
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 dark:bg-gray-700 dark:text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="message">
                        Mesajınız
                      </label>
                      <textarea 
                        id="message" 
                        rows={4} 
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Bize nasıl yardımcı olabiliriz?"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      Mesajı Gönder
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage; 