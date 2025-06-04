import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/authContext';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('tr');

  // Sayfa kaydırma işlevi
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <>
      <header 
        className={`fixed w-full z-30 transition-all duration-300 ${
          scrolled 
            ? 'bg-white dark:bg-gray-900 shadow-sm py-2' 
            : 'bg-gradient-to-r from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 py-3'
        }`}
      >
        <div className="container px-4 mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-orange-500">Story<span className="text-orange-500">Vista</span></span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'text-sky-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
            >
              Ana Sayfa
            </Link>
            <Link 
              to="/categories" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/categories') 
                  ? 'text-sky-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
            >
              Hikayeler
            </Link>
            <Link 
              to="/learn" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/learn') 
                  ? 'text-sky-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
            >
              Öğren
            </Link>
            <Link 
              to="/pricing" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/pricing') 
                  ? 'text-sky-500' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400'
              }`}
            >
              Fiyatlandırma
            </Link>
            <Link 
              to="/create-story" 
              className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                isActive('/create-story') 
                  ? 'bg-sky-500 text-white' 
                  : 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800'
              }`}
            >
              Hikaye Oluştur
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
            </Link>
            {user && (
              <Link 
                to="/library" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/library') 
                    ? 'text-sky-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
              >
                Kütüphanem
              </Link>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className={`p-2 rounded-full ${
                scrolled ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300'
              } transition-all duration-300`}
              aria-label={language === 'tr' ? 'English' : 'Türkçe'}
            >
              <span className="text-xs font-bold">{language === 'tr' ? 'EN' : 'TR'}</span>
            </button>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                scrolled ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300'
              } transition-all duration-300`}
              aria-label={darkMode ? 'Açık Mod' : 'Koyu Mod'}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            {user ? (
              <div className="relative group">
                <button 
                  className={`flex items-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30' : 'text-gray-600 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-300 mr-2">
                    {user.user_metadata.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>Profilim</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profilim
                  </Link>
                  <Link 
                    to="/library" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📚 Kütüphanem
                  </Link>
                  <Link 
                    to="/create-story" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Hikaye Oluştur
                  </Link>
                  <button 
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-sky-500 border border-sky-200 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/30"
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
            
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-sky-500"
              onClick={toggleMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 bg-black opacity-50" onClick={closeMenu}></div>
        <div className="relative w-64 max-w-sm h-full bg-white dark:bg-gray-900 shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <Link to="/" className="font-bold text-2xl text-orange-500" onClick={closeMenu}>
              Story<span className="text-orange-500">Vista</span>
            </Link>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={closeMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
                onClick={closeMenu}
              >
                Ana Sayfa
              </Link>
              <Link 
                to="/categories" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/categories') 
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
                onClick={closeMenu}
              >
                Hikayeler
              </Link>
              <Link 
                to="/learn" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/learn') 
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
                onClick={closeMenu}
              >
                Öğren
              </Link>
              <Link 
                to="/pricing" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/pricing') 
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-500' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-500 dark:hover:text-sky-400'
                }`}
                onClick={closeMenu}
              >
                Fiyatlandırma
              </Link>
              <Link 
                to="/create-story" 
                className={`block px-3 py-2 rounded-md text-base font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800 my-2 relative`}
                onClick={closeMenu}
              >
                Hikaye Oluştur
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">AI</span>
              </Link>
              
              {!user && (
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <Link 
                    to="/login" 
                    className="block w-full px-4 py-2 text-center text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 rounded-full"
                    onClick={closeMenu}
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    to="/register" 
                    className="block w-full px-4 py-2 mt-2 text-center text-sky-500 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-full"
                    onClick={closeMenu}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </nav>
          </div>
          
          {user && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-300 mr-3">
                  {user.user_metadata.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.user_metadata.full_name || 'Kullanıcı'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </div>
              <button 
                onClick={() => { signOut(); closeMenu(); }}
                className="mt-2 block w-full text-center px-4 py-2 text-sm text-red-500 border border-red-200 dark:border-red-900/50 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;