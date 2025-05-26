import { supabase } from './supabase';
import { getUserStories, getUserLibrary } from './storyService';

// Profil tipi
export interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Kullanıcı profili getirme
export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return null;
  }
};

// Profil bilgilerini güncelleme
export const updateProfile = async (userId: string, profile: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return null;
  }
};

// Profil resmi yükleme
export const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Dosya uzantısını al
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${userId}/avatar.${fileExt}`;
    
    // Dosyayı yükle
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600'
      });
      
    if (error) throw error;
    
    // Genel URL oluştur
    const { data: urlData } = await supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
      
    if (!urlData) throw new Error('Profil resmi URL alınamadı');
    
    // Profil bilgilerini güncelle
    await updateProfile(userId, {
      avatar_url: urlData.publicUrl
    });
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Profil resmi yükleme hatası:', error);
    return null;
  }
};

// Profili başka bir kullanıcının görüntülemesi için
export const getPublicProfile = async (userId: string): Promise<{ profile: Profile | null; storiesCount: number }> => {
  try {
    // Profil bilgilerini getir
    const profile = await getProfile(userId);
    
    // Hikaye sayısını getir
    const stories = await getUserStories(userId);
    const storiesCount = stories ? stories.length : 0;
    
    return {
      profile,
      storiesCount
    };
  } catch (error) {
    console.error('Genel profil getirme hatası:', error);
    return {
      profile: null,
      storiesCount: 0
    };
  }
};

// Profil oluşturma (kayıt sonrası)
export const createProfile = async (userId: string, username: string, email: string): Promise<Profile | null> => {
  try {
    // Kullanıcı adının benzersiz olduğunu kontrol et
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
      
    if (existingUser) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }
    
    // Profil oluştur
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        bio: `Merhaba! Ben ${username}.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Profil oluşturma hatası:', error);
    return null;
  }
};

// Kullanıcı adı kontrolü
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
      
    if (error && error.code === 'PGRST116') {
      // PGRST116: Sonuç bulunamadı - kullanıcı adı müsait
      return true;
    }
    
    // Sonuç varsa kullanıcı adı kullanımda
    return false;
  } catch (error) {
    console.error('Kullanıcı adı kontrolü hatası:', error);
    return false;
  }
};

// Kullanıcının hikaye istatistiklerini getirme (premium özellik)
export const getUserStats = async (userId: string): Promise<any | null> => {
  try {
    // Kullanıcının hikayelerini getir
    const stories = await getUserStories(userId);
    
    if (!stories) {
      return {
        totalStories: 0,
        totalReads: 0,
        averageRating: 0,
        categories: {}
      };
    }
    
    // İstatistikleri hesapla
    const totalStories = stories.length;
    
    // Kategori dağılımı
    const categories: Record<string, number> = {};
    stories.forEach(story => {
      // Supabase category ilişkisi burada 'category' adında gelebilir
      // veya category_id ile ilişkili olabilir
      const categoryName = (story as any).category?.name || 'Genel';
      categories[categoryName] = (categories[categoryName] || 0) + 1;
    });
    
    // Değerlendirme ortalaması
    let totalRating = 0;
    let ratedStories = 0;
    
    for (const story of stories) {
      // Her hikaye için değerlendirme ortalamasını getir
      const { data: ratingData } = await supabase
        .rpc('get_average_rating', { story_id_param: story.id });
        
      if (ratingData) {
        totalRating += parseFloat(ratingData);
        ratedStories++;
      }
    }
    
    const averageRating = ratedStories > 0 ? totalRating / ratedStories : 0;
    
    // Toplam okunma sayısı - gerçek uygulamada bir tablo olacak
    const totalReads = 0;
    
    return {
      totalStories,
      totalReads,
      averageRating,
      categories
    };
  } catch (error) {
    console.error('Kullanıcı istatistikleri getirme hatası:', error);
    return null;
  }
}; 