import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface CommentSectionProps {
  storyId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ storyId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      // Yorumları ve kullanıcı bilgilerini birlikte sorgulama
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Yorumlar yüklenirken hata oluştu:', error);
        return;
      }

      // Verileri düzenliyoruz
      const formattedComments = data.map(item => ({
        id: item.id,
        content: item.content,
        created_at: new Date(item.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric', 
          month: 'long', 
          year: 'numeric'
        }),
        user_id: item.user_id,
        userName: item.profiles?.username || 'Misafir Kullanıcı',
        userAvatar: item.profiles?.avatar_url
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Bir hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Yorum yapmak için giriş yapmalısınız.');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: newComment.trim(),
        });
        
      if (error) {
        console.error('Yorum eklenirken hata oluştu:', error);
        return;
      }
      
      setNewComment('');
      setShowAddComment(false);
      // Yeni yorumlar listesini yükleyelim
      fetchComments();
    } catch (error) {
      console.error('Bir hata oluştu:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Animasyon varyantları
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="comment-section mt-10 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md"
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h3 
          className="text-xl font-bold"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Yorumlar ({comments.length})
        </motion.h3>
        
        {user && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddComment(!showAddComment)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            {showAddComment ? 'İptal Et' : 'Yorum Yap'}
          </motion.button>
        )}
      </div>
      
      {/* Yorum Ekleme Formu */}
      <AnimatePresence>
        {(showAddComment || (!user && comments.length === 0)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="mb-4">
                <motion.label 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  htmlFor="comment" 
                  className="block text-sm font-medium mb-2"
                >
                  Düşüncelerinizi paylaşın
                </motion.label>
                <motion.textarea
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  id="comment"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder={user ? "Bu hikaye hakkında ne düşünüyorsunuz?" : "Yorum yapmak için giriş yapmalısınız"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!user || submitting}
                ></motion.textarea>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
                disabled={!user || submitting || !newComment.trim()}
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-t-transparent border-white rounded-full"
                    />
                    Gönderiliyor...
                  </div>
                ) : (
                  'Yorum Yap'
                )}
              </motion.button>
              
              {!user && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 text-sm text-gray-500 dark:text-gray-400"
                >
                  Yorum yapmak için giriş yapmalısınız.
                </motion.p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Yorumlar Listesi */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"
          />
          <p className="text-gray-500 dark:text-gray-400">Yorumlar yükleniyor...</p>
        </div>
      ) : comments.length > 0 ? (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {comments.map((comment, index) => (
            <motion.div 
              key={comment.id}
              variants={item}
              custom={index}
              className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {comment.userAvatar ? (
                    <motion.img 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      src={comment.userAvatar} 
                      alt={comment.userName} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 dark:border-blue-800"
                    />
                  ) : (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md"
                    >
                      {comment.userName.charAt(0).toUpperCase()}
                    </motion.div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{comment.userName}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{comment.created_at}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </motion.svg>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Henüz yorum yapılmamış.
          </motion.p>
          <motion.p 
            className="text-blue-600 dark:text-blue-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            İlk yorumu yapan siz olun!
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CommentSection; 