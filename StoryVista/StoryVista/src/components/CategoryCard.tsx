import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Lesson {
  title: string;
  duration: string;
  level: string;
}

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  border: string;
  lessons: Lesson[];
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  title,
  description,
  icon,
  color,
  lessons,
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className={`${color} p-3 rounded-xl`}>
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">İçerik</h4>
        <ul className="space-y-4">
          {lessons.map((lesson, idx) => (
            <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <div className="mr-3 bg-white dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sky-600 dark:text-sky-400 font-medium">{idx + 1}</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-white">{lesson.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">{lesson.level}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {lesson.duration}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link 
            to={`/learn/category/${id}`}
            className="inline-flex items-center justify-center w-full py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all shadow"
          >
            Bu Kategoriye Başla
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryCard; 