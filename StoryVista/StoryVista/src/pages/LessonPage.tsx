import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonDetail from '../components/LessonDetail';

interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  level: string;
  author: string;
  authorImage: string;
  coverImage: string;
  description: string;
  content: string[];
}

const LessonPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gerçek uygulamada bu verileri API'den çekeceğiz
    // Şimdilik mock veri kullanıyoruz
    const mockLesson: Lesson = {
      id: id || '1',
      title: 'Yapay Zeka İle Hikaye Oluşturma',
      category: 'Workshop',
      duration: '30 dk',
      level: 'Orta Seviye',
      author: 'Ahmet Yılmaz',
      authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
      description: 'StoryVista yapay zeka araçlarını kullanarak etkileyici hikayeler oluşturmayı öğrenin. Bu ders, yaratıcı yazım sürecinizi hızlandıracak teknikleri kapsar.',
      content: [
        'Yapay zeka teknolojileri, hikaye yazma sürecini kökten değiştiriyor. Bu derste, StoryVista platformundaki yapay zeka araçlarını kullanarak nasıl etkileyici hikayeler oluşturabileceğinizi öğreneceksiniz.',
        'Öncelikle, etkili bir yapay zeka destekli hikaye oluşturmanın temel prensiplerini ele alacağız. İyi bir hikaye için net bir amaç, hedef kitle ve çekici bir tema belirlemeniz gerekir. Bu unsurları belirledikten sonra, yapay zekaya doğru yönlendirmeyi sağlayabilirsiniz.',
        'StoryVista platformunda, hikaye oluşturma süreci üç ana adımdan oluşur: Temel ayarların seçilmesi, prompt (yönlendirme) yazımı ve hikayenin üretilmesi. Dersin ilk bölümünde, etkili promptlar yazmanın inceliklerini öğreneceksiniz.',
        'İyi bir prompt, yapay zekanın ürettiği hikayenin kalitesini doğrudan etkiler. Detaylı, net ve yaratıcı promptlar yazarak, ayırt edici ve özgün hikayeler oluşturabilirsiniz. Bu derste, prompt yazımında kullanabileceğiniz teknikleri ve yapıları inceleyeceğiz.',
        'Hikaye türüne göre prompt stratejileri de değişiklik gösterir. Macera, romantizm, bilim kurgu veya fantastik gibi farklı türlerde hikayeler için nasıl promptlar yazabileceğinizi öğreneceksiniz.',
        'Ayrıca, yapay zeka tarafından üretilen hikayeleri nasıl düzenleyebileceğinizi ve geliştirebileceğinizi de ele alacağız. Yapay zeka hikayenizin ilk taslağını oluşturabilir, ancak gerçek bir yazar olarak sizin dokunuşlarınız hikayeyi benzersiz kılacaktır.',
        'Son olarak, yapay zeka ile üretilen hikayelere görsel ve sesli unsurlar eklemeyi öğreneceksiniz. StoryVista platformu, hikayeleriniz için görsel üretme ve seslendirme özellikleri sunar. Bu özellikleri kullanarak, hikayelerinizi çok boyutlu deneyimlere dönüştürebilirsiniz.',
        'Bu dersin sonunda, yapay zeka teknolojilerini kullanarak yaratıcı sürecinizi zenginleştirme becerisi kazanacaksınız. Hadi başlayalım!'
      ]
    };

    // API çağrısını simüle ediyoruz
    setTimeout(() => {
      setLesson(mockLesson);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="animate-pulse w-full max-w-4xl">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-4 mx-auto"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mb-8 mx-auto"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Ders Bulunamadı</h1>
          <p className="text-gray-600 dark:text-gray-400">Aradığınız ders bulunamadı veya bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <LessonDetail 
          id={lesson.id}
          title={lesson.title}
          category={lesson.category}
          duration={lesson.duration}
          level={lesson.level}
          author={lesson.author}
          authorImage={lesson.authorImage}
          coverImage={lesson.coverImage}
          description={lesson.description}
          content={lesson.content}
        />
      </div>
    </div>
  );
};

export default LessonPage; 