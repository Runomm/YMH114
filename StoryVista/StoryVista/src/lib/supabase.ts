import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Çevresel değişkenleri kontrol et ve varsayılan değerleri ayarla
// src/env.example dosyasındaki gerçek değerleri kullanıyoruz
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluştur - TypeScript tiplerini ekle
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Tip güvenliği için yardımcı tipler
export type SupabaseClient = typeof supabase;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export default supabase; 