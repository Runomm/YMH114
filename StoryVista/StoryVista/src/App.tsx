import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/authContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CreateStoryPage = lazy(() => import('./pages/CreateStoryPage'));
const ManualStoryPage = lazy(() => import('./pages/ManualStoryPage'));
const ReadStoryPage = lazy(() => import('./pages/ReadStoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const LessonPage = lazy(() => import('./pages/LessonPage'));

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Sayfa yüklendiğinde sistem/tarayıcı tercihini kontrol et ve localStorage'dan kayıtlı tercihi al
  useEffect(() => {
    // localStorage'dan tema tercihini kontrol et
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      // Kaydedilmiş bir tercih varsa onu kullan
      setDarkMode(savedTheme === 'dark');
    } else {
      // Yoksa sistem/tarayıcı tercihini kontrol et
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  // Tema değiştiğinde HTML'in class'ını güncelle ve localStorage'a kaydet
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Tema değiştirme fonksiyonu
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <main className="flex-grow pt-14">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/read-story/:id" element={<ReadStoryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Yeni Öğrenme Rotaları */}
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/learn/lesson/:id" element={<LessonPage />} />
                
                {/* Protected routes */}
                <Route path="/create-story" element={
                  <ProtectedRoute>
                    <CreateStoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/manual-story" element={
                  <ProtectedRoute>
                    <ManualStoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile/*" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                
                {/* 404 page */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 