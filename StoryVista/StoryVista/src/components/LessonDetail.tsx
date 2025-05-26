import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LessonDetailProps {
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

const LessonDetail: React.FC<LessonDetailProps> = ({
  id,
  title,
  category,
  duration,
  level,
  author,
  authorImage,
  coverImage,
  description,
  content
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Ders Başlığı */}
      <div className="mb-8 text-center">
        <span className="inline-block px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full text-sm font-medium mb-4">
          {category}
        </span>
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
          {description}
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {duration}
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            {level}
          </span>
        </div>
      </div>

      {/* Ders Resmi */}
      <div className="relative w-full aspect-video mb-10 rounded-2xl overflow-hidden shadow-xl">
        <img 
          src={coverImage} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Yazar Bilgisi */}
      <div className="flex items-center mb-10 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <img 
          src={authorImage} 
          alt={author} 
          className="w-12 h-12 rounded-full object-cover mr-4 ring-2 ring-sky-500"
        />
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Eğitmen</p>
          <h3 className="font-medium text-gray-800 dark:text-white">{author}</h3>
        </div>
      </div>

      {/* Ders İçeriği */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Ders İçeriği</h2>
        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
          {content.map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* İlgili Dersler Butonları */}
      <div className="flex flex-wrap justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link 
          to="/learn" 
          className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Tüm Derslere Dön
        </Link>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link 
            to={`/learn/exercise/${id}`}
            className="inline-block px-4 py-2 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 rounded-lg hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
          >
            Egzersizleri Gör
          </Link>
          <Link 
            to={`/learn/quiz/${id}`}
            className="inline-block px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-lg transition-colors"
          >
            Testi Başlat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail; 