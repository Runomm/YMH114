import { createClient } from '@supabase/supabase-js';

// Çevresel değişkenleri kontrol et ve varsayılan değerleri ayarla
// src/env.example dosyasındaki gerçek değerleri kullanıyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth durumu değişikliğini izlemek için yardımcı fonksiyon
export const setupAuthListener = (callback: (session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  
  return () => {
    subscription.unsubscribe();
  };
};

export default supabase; 