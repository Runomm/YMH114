import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Fiyatlandırma planları
  const pricingPlans = [
    {
      name: "Ücretsiz",
      description: "Temel özelliklerle başlayın",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "Ayda 5 hikaye oluşturma",
        "Basit hikaye özellikleri",
        "Reklam destekli",
        "Topluluk desteği",
        "Mobil uygulama erişimi"
      ],
      buttonText: "Ücretsiz Başla",
      buttonColor: "bg-white text-sky-500 border border-sky-500",
      hoverColor: "hover:bg-sky-50",
      popular: false
    },
    {
      name: "Premium",
      description: "Sınırsız hikayeler için ideal",
      monthlyPrice: 29.99,
      annualPrice: 19.99,
      features: [
        "Sınırsız hikaye oluşturma",
        "Gelişmiş hikaye özellikleri",
        "Reklamsız deneyim",
        "Öncelikli destek",
        "Özel hikaye şablonları",
        "Hikaye paylaşımı",
        "Sesli hikaye dinleme"
      ],
      buttonText: "Premium'a Geç",
      buttonColor: "bg-gradient-to-r from-sky-500 to-blue-600 text-white",
      hoverColor: "hover:from-sky-600 hover:to-blue-700",
      popular: true
    },
    {
      name: "Aile",
      description: "Tüm aile için ideal paket",
      monthlyPrice: 49.99,
      annualPrice: 39.99,
      features: [
        "5 kullanıcı hesabı",
        "Sınırsız hikaye oluşturma",
        "Tüm premium özellikler",
        "Ebeveyn kontrolleri",
        "Aile paylaşım kütüphanesi",
        "7/24 öncelikli destek",
        "Özel aile temaları"
      ],
      buttonText: "Aile Paketi Al",
      buttonColor: "bg-gradient-to-r from-sky-500 to-blue-600 text-white",
      hoverColor: "hover:from-sky-600 hover:to-blue-700",
      popular: false
    }
  ];

  // Sık sorulan sorular
  const faqs = [
    {
      question: "Aboneliğimi istediğim zaman iptal edebilir miyim?",
      answer: "Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal işleminiz, mevcut fatura döneminin sonunda geçerli olacaktır. İptal sonrası fatura döneminin sonuna kadar premium özelliklerden yararlanmaya devam edersiniz."
    },
    {
      question: "Ödeme yöntemleri nelerdir?",
      answer: "Kredi kartı, banka kartı, PayPal ve mobil ödeme yöntemlerini destekliyoruz. Türkiye'deki kullanıcılar için havale/EFT seçeneğimiz de bulunmaktadır."
    },
    {
      question: "Deneme süresi var mı?",
      answer: "Evet, Premium ve Aile paketlerimiz için 7 günlük ücretsiz deneme süresi sunuyoruz. Deneme süresi içinde istediğiniz zaman iptal edebilirsiniz."
    },
    {
      question: "Aile planı nasıl çalışır?",
      answer: "Aile planı, bir ana hesap ve toplam 5 ayrı profil içerir. Her profil kendi hikayelerini oluşturabilir ve kaydedebilir. Ana hesap sahibi tüm profilleri yönetebilir ve içerik kontrolü sağlayabilir."
    },
    {
      question: "Ücretsiz plandan Premium'a geçebilir miyim?",
      answer: "Evet, dilediğiniz zaman ücretsiz plandan premium plana yükseltme yapabilirsiniz. Hesap ayarlarınızdan kolayca plan değişikliği yapabilirsiniz."
    }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-r from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Başlık */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold mb-6 text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Fiyatlandırma</span> Planları
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            İhtiyaçlarınıza uygun bir plan seçin ve hikaye maceranıza başlayın
          </motion.p>
          
          {/* Fiyat Geçiş Butonu */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-full inline-flex">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isAnnual ? 'bg-white dark:bg-gray-800 shadow text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Yıllık
                <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">%33 İndirim</span>
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual ? 'bg-white dark:bg-gray-800 shadow text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Aylık
              </button>
            </div>
          </div>
        </div>
        
        {/* Fiyat Planları */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden ${
                  plan.popular ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-center py-1.5 text-sm font-medium">
                    En Popüler Plan
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}{plan.monthlyPrice > 0 ? '₺' : ''}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.monthlyPrice > 0 ? '/ay' : ''}
                    </span>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Yıllık faturalandırma ile {plan.annualPrice * 12}₺/yıl
                      </div>
                    )}
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600 dark:text-gray-300">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-sky-500 mr-2" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button 
                    className={`w-full py-3 px-4 rounded-lg font-medium ${plan.buttonColor} ${plan.hoverColor} transition-all shadow-sm`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* SSS Bölümü */}
        <div className="max-w-4xl mx-auto mb-10">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-white">Sık Sorulan Sorular</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {faqs.map((faq, index) => (
                <div key={index} className="p-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alt Çağrı */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Hemen Hikaye Maceranıza Başlayın</h2>
            <p className="mb-8 max-w-2xl mx-auto text-white/90">
              Hayal gücünüzü serbest bırakın ve StoryVista'nın eğlenceli dünyasına adım atın. Ücretsiz planımızla başlayabilir, istediğiniz zaman yükseltme yapabilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="px-6 py-3 bg-white text-sky-600 hover:bg-sky-50 rounded-full font-medium shadow-sm transition-colors"
              >
                Ücretsiz Kaydol
              </Link>
              <Link 
                to="/create-story" 
                className="px-6 py-3 bg-sky-400 bg-opacity-20 hover:bg-opacity-30 text-white border border-white/30 rounded-full font-medium transition-colors"
              >
                Demo Deneyin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 