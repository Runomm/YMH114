import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();

  // Kimlik doğrulama durumu yüklenirken yükleme göstergesi
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Kimlik doğrulama gerektiren bir sayfa için kullanıcı giriş yapmamışsa
  if (requireAuth && !user) {
    return <Navigate to="/" />;
  }

  // Kimlik doğrulama gerektirmeyen bir sayfa için kullanıcı zaten giriş yapmışsa
  if (!requireAuth && user) {
    return <Navigate to="/profile" />;
  }

  // Normal durum: sayfayı göster
  return <>{children}</>;
};

export default ProtectedRoute; 