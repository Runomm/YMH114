import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { generateCompleteStory, generateStoryAudio, StoryPrompt } from './aiService';

// StoryPrompt tipini genişletelim
export interface ExtendedStoryPrompt extends StoryPrompt {
  title?: string;
}

// Hikaye tipi
export interface Story {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  audio_url?: string;
  category_id?: number;
  user_id: string;
  status: 'draft' | 'published';
  read_time?: number;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  language: string;
  is_premium: boolean;
}

// Sayfa tipi
export interface StoryPage {
  id?: string;
  story_id: string;
  page_number: number;
  content?: string;
  image_url?: string;
  template?: string;
  is_cover_page?: boolean;
  is_back_cover_page?: boolean;
  image_prompt?: string;
}

// Hikaye oluşturma
export const createStory = async (story: Partial<Story>): Promise<Story | null> => {
  try {
    // Okuma süresini hesapla
    const wordCount = story.content?.split(/\s+/).length || 0;
    const readTimeMinutes = Math.ceil(wordCount / 200); // Ortalama okuma hızı: 200 kelime/dakika
    
    const { data, error } = await supabase
      .from('stories')
      .insert({
        ...story,
        id: story.id || uuidv4(),
        read_time: readTimeMinutes,
        language: story.language || 'tr',
        is_premium: story.is_premium || false
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye oluşturma hatası:', error);
    return null;
  }
};

// Hikaye sayfalarını oluşturma
export const createStoryPages = async (pages: StoryPage[]): Promise<StoryPage[] | null> => {
  try {
    const { data, error } = await supabase
      .from('story_pages')
      .insert(pages)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye sayfaları oluşturma hatası:', error);
    return null;
  }
};

// Hikaye getirme
export const getStory = async (storyId: string): Promise<Story | null> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('id', storyId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye getirme hatası:', error);
    return null;
  }
};

// Hikaye sayfalarını getirme
export const getStoryPages = async (storyId: string): Promise<StoryPage[] | null> => {
  try {
    const { data, error } = await supabase
      .from('story_pages')
      .select('*')
      .eq('story_id', storyId)
      .order('page_number', { ascending: true });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye sayfaları getirme hatası:', error);
    return null;
  }
};

// Kullanıcı hikayelerini getirme
export const getUserStories = async (userId: string): Promise<Story[] | null> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kullanıcı hikayeleri getirme hatası:', error);
    return null;
  }
};

// Kategori hikayelerini getirme
export const getCategoryStories = async (categoryId: number): Promise<Story[] | null> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Kategori hikayeleri getirme hatası:', error);
    return null;
  }
};

// Hikayeleri arama
export const searchStories = async (query: string): Promise<Story[] | null> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        category:categories(name)
      `)
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye arama hatası:', error);
    return null;
  }
};

// Kullanıcı kütüphanesindeki hikayeleri getirme
export const getUserLibrary = async (userId: string): Promise<Story[] | null> => {
  try {
    // Önce kullanıcının kütüphanesindeki hikaye ID'lerini al
    const { data: libraryData, error: libraryError } = await supabase
      .from('library')
      .select('story_id')
      .eq('user_id', userId);
      
    if (libraryError) throw libraryError;
    
    if (!libraryData || libraryData.length === 0) {
      return [];
    }
    
    // Hikaye ID'lerini çıkar
    const storyIds = libraryData.map(item => item.story_id);
    
    // Hikayeleri getir
    const { data: storiesData, error: storiesError } = await supabase
      .from('stories')
      .select(`
        *,
        category:categories(name)
      `)
      .in('id', storyIds);
      
    if (storiesError) throw storiesError;
    
    return storiesData;
  } catch (error) {
    console.error('Kullanıcı kütüphanesi getirme hatası:', error);
    return null;
  }
};

// Kütüphaneye hikaye ekleme/çıkarma
export const toggleLibrary = async (userId: string, storyId: string): Promise<boolean> => {
  try {
    // Önce kütüphanede var mı kontrol et
    const { data: existingData, error: checkError } = await supabase
      .from('library')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116: Sonuç bulunamadı hatası
      throw checkError;
    }
    
    if (existingData) {
      // Kütüphaneden çıkar
      const { error: deleteError } = await supabase
        .from('library')
        .delete()
        .eq('user_id', userId)
        .eq('story_id', storyId);
        
      if (deleteError) throw deleteError;
      return false; // Artık kütüphanede değil
    } else {
      // Kütüphaneye ekle
      const { error: insertError } = await supabase
        .from('library')
        .insert({
          user_id: userId,
          story_id: storyId
        });
        
      if (insertError) throw insertError;
      return true; // Kütüphaneye eklendi
    }
  } catch (error) {
    console.error('Kütüphane işlemi hatası:', error);
    return false;
  }
};

// Hikaye değerlendirme
export const rateStory = async (userId: string, storyId: string, score: number): Promise<boolean> => {
  try {
    // Puanın geçerli olduğunu kontrol et
    if (score < 1 || score > 5) {
      throw new Error('Puan 1-5 arasında olmalıdır');
    }
    
    // Mevcut değerlendirme var mı kontrol et
    const { data: existingData, error: checkError } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingData) {
      // Mevcut değerlendirmeyi güncelle
      const { error: updateError } = await supabase
        .from('ratings')
        .update({ score })
        .eq('id', existingData.id);
        
      if (updateError) throw updateError;
    } else {
      // Yeni değerlendirme ekle
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          story_id: storyId,
          score
        });
        
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error('Değerlendirme hatası:', error);
    return false;
  }
};

// Hikaye için ortalama puanı getirme
export const getStoryRating = async (storyId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc('get_average_rating', {
      story_id_param: storyId
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye puanı getirme hatası:', error);
    return null;
  }
};

// Yorum ekleme
export const addComment = async (userId: string, storyId: string, content: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        story_id: storyId,
        content
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    return false;
  }
};

// Hikaye yorumlarını getirme
export const getStoryComments = async (storyId: string): Promise<any[] | null> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(id, email, profiles:profiles(username, avatar_url))
      `)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Hikaye yorumları getirme hatası:', error);
    return null;
  }
};

// Hikaye durum güncelleme (taslak/yayınlanmış)
export const updateStoryStatus = async (storyId: string, status: 'draft' | 'published'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('stories')
      .update({ status })
      .eq('id', storyId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Hikaye durumu güncelleme hatası:', error);
    return false;
  }
};

// AI ile hikaye oluşturma
export const createAIStory = async (userId: string, prompt: ExtendedStoryPrompt): Promise<{ story: Story | null; pages: StoryPage[] | null }> => {
  try {
    // AI ile hikaye metni ve görsel oluştur
    const result = await generateCompleteStory(prompt);
    
    if (!result.text) {
      throw new Error('Hikaye oluşturulamadı');
    }
    
    // Metinden başlık oluştur veya prompt'taki başlığı kullan
    const title = prompt.title || prompt.inspiration.substring(0, 30) + '...';
    
    // Kategori ID'sini al
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', prompt.category)
      .single();
      
    if (categoryError) throw categoryError;
    
    // Hikayeyi kaydet
    const story: Partial<Story> = {
      title,
      content: result.text,
      image_url: result.imageUrl,
      category_id: categoryData?.id,
      user_id: userId,
      status: 'published',
      language: 'tr',
      is_premium: false
    };
    
    const createdStory = await createStory(story);
    
    if (!createdStory) {
      throw new Error('Hikaye kaydedilemedi');
    }
    
    // Hikaye sayfalarını oluştur
    const paragraphs = result.text.split('\n\n');
    const storyPages: StoryPage[] = [];
    
    // Kapak sayfası
    storyPages.push({
      story_id: createdStory.id,
      page_number: 1,
      content: title,
      image_url: result.imageUrl,
      is_cover_page: true,
      template: 'classic'
    });
    
    // İçerik sayfaları
    let pageNumber = 2;
    for (let i = 0; i < paragraphs.length; i += 2) {
      const pageContent = paragraphs.slice(i, i + 2).join('\n\n');
      
      storyPages.push({
        story_id: createdStory.id,
        page_number: pageNumber++,
        content: pageContent,
        template: 'classic'
      });
    }
    
    // Arka kapak
    storyPages.push({
      story_id: createdStory.id,
      page_number: pageNumber,
      content: `${title} - Hikayenin Sonu`,
      is_back_cover_page: true,
      template: 'classic'
    });
    
    const createdPages = await createStoryPages(storyPages);
    
    return {
      story: createdStory,
      pages: createdPages
    };
  } catch (error) {
    console.error('AI hikaye oluşturma hatası:', error);
    return {
      story: null,
      pages: null
    };
  }
}; 