import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 w-1/3 h-1/3 bg-violet-200 dark:bg-violet-900/20 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <div className="w-full max-w-md z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 py-8 px-10 shadow-xl rounded-2xl"
        >
          <div className="flex justify-center mb-6">
            <span className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Story<span className="text-amber-500">Vista</span></span>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sayfa Bulunamadı</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
            </p>
          </div>
          
          <div className="mt-8">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage; 