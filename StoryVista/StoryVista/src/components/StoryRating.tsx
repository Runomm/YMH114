import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryRatingProps {
  storyId: string;
  initialRating?: number;
}

const StoryRating: React.FC<StoryRatingProps> = ({ storyId, initialRating = 0 }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [userHasRated, setUserHasRated] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserRating();
    }
  }, [user, storyId]);

  const checkUserRating = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('story_id', storyId)
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Kullanıcı değerlendirmesi kontrol edilirken hata:', error);
        return;
      }
      
      // Kullanıcı önceden değerlendirmiş mi?
      if (data) {
        setUserHasRated(true);
        setRating(initialRating);
      }
    } catch (error) {
      console.error('Bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const rateStory = async (starRating: number) => {
    if (!user) {
      alert('Hikayeyi değerlendirmek için giriş yapmalısınız.');
      return;
    }

    if (userHasRated) {
      alert('Bu hikayeyi zaten değerlendirdiniz.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Beğeni ekliyoruz
      const { error } = await supabase
        .from('likes')
        .insert({
          story_id: storyId,
          user_id: user.id
        });
      
      if (error) {
        console.error('Değerlendirme eklenirken hata:', error);
        return;
      }
      
      setRating(starRating);
      setUserHasRated(true);
      
      // Başarı mesajını göster ve 3 saniye sonra gizle
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (error) {
      console.error('Bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yıldız için animasyon varyantları
  const starVariants = {
    selected: { 
      scale: [1, 1.5, 1.2],
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.5 } 
    },
    hovered: { 
      scale: 1.2,
      transition: { duration: 0.2 } 
    },
    idle: { 
      scale: 1,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-sm"
    >
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200"
      >
        Bu hikayeyi değerlendirin
      </motion.h3>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            variants={starVariants}
            initial="idle"
            animate={
              (rating && star <= rating) || (userHasRated && star <= initialRating)
                ? "selected"
                : (hover && star <= hover) ? "hovered" : "idle"
            }
            type="button"
            disabled={loading || userHasRated || !user}
            onClick={() => rateStory(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className={`transition-colors ${loading ? 'cursor-wait' : userHasRated ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-10 w-10 drop-shadow-md transition-colors ${
                (hover && star <= hover) || (rating && star <= rating) || (userHasRated && star <= initialRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
          </motion.button>
        ))}
      </div>
      
      <AnimatePresence>
        {!user && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center"
          >
            Değerlendirme yapmak için <span className="text-blue-600 dark:text-blue-400 font-medium">giriş yapmalısınız</span>.
          </motion.p>
        )}
        
        {userHasRated && !showSuccessMessage && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium"
          >
            Bu hikayeyi değerlendirdiniz. Teşekkürler!
          </motion.p>
        )}
        
        {showSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Değerlendirmeniz kaydedildi!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Yıldız sayısını gösteren animasyonlu gösterge */}
      {(hover || rating || (userHasRated && initialRating)) && (
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 flex items-center gap-2"
        >
          <div className="text-sm font-medium">Puanınız:</div>
          <motion.div 
            className="bg-yellow-400 text-yellow-900 font-bold w-8 h-8 rounded-full flex items-center justify-center"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5 }}
          >
            {hover || rating || initialRating}
          </motion.div>
        </motion.div>
      )}
      
      {loading && (
        <div className="flex items-center justify-center mt-3 gap-2">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">İşlem yapılıyor...</span>
        </div>
      )}
    </motion.div>
  );
};

export default StoryRating; 