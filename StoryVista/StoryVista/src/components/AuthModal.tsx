import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        // Giriş işlemi
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        setSuccessMessage('Başarıyla giriş yapıldı!');
        setTimeout(onClose, 1500);
      } else {
        // Kayıt işlemi
        const { error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) throw error;
        
        setSuccessMessage('Kayıt başarılı! Lütfen e-posta adresinizi kontrol edin.');
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="relative max-w-md w-full mx-4 overflow-hidden rounded-2xl shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Arka plan gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 opacity-90"></div>
            
            {/* Dekoratif daireler */}
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-white opacity-10"></div>
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mx-4 my-6">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                  Story<span>Vista</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-6">
                {isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                {isLogin 
                  ? 'Hikaye dünyasına hoş geldiniz! Devam etmek için giriş yapın.' 
                  : 'Kendi hikayelerinizi oluşturmak için yeni bir hesap oluşturun.'}
              </p>

              {error && (
                <motion.div 
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-medium">Hata</p>
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-medium">Başarılı</p>
                  <p className="text-sm">{successMessage}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta Adresiniz</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="ornek@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifreniz</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      İşleniyor...
                    </span>
                  ) : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium transition-colors"
                >
                  {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                  >
                    Vazgeç
                  </button>
                  
                  <a 
                    href="#" 
                    className="text-sm text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Şifremi unuttum
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 