// StoryVista Database Service
// Hikaye ve sayfa yönetimi için veritabanı işlemleri

import { supabase } from './supabase';
import { 
  Database, 
  StoryWithDetails, 
  PageWithImage, 
  StoryCreateInput, 
  StoryUpdateInput, 
  PageCreateInput, 
  PageUpdateInput,
  ApiResponse,
  PaginatedResponse 
} from './database.types';

// Hikaye işlemleri
export class StoryDatabase {
  
  // Yeni hikaye oluştur
  static async createStory(storyData: StoryCreateInput): Promise<ApiResponse<Database['public']['Tables']['stories']['Row']>> {
    try {
      console.log('Creating story:', storyData);
      
      const { data, error } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();
      
      if (error) {
        console.error('Story creation error:', error);
        return { data: null, error: error.message, success: false };
      }
      
      console.log('Story created successfully:', data);
      return { data, error: null, success: true };
    } catch (error) {
      console.error('Unexpected error creating story:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikayeyi güncelle
  static async updateStory(storyId: string, updates: StoryUpdateInput): Promise<ApiResponse<Database['public']['Tables']['stories']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikayeyi sil
  static async deleteStory(storyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', storyId);
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: true, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikaye detayları ile birlikte getir
  static async getStoryWithDetails(storyId: string): Promise<ApiResponse<StoryWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          category:categories(*),
          theme:story_themes(*),
          profile:profiles(*),
          pages:story_pages(*),
          stats:story_stats(*)
        `)
        .eq('id', storyId)
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: data as StoryWithDetails, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Kullanıcının hikayelerini getir
  static async getUserStories(
    userId: string, 
    status?: 'draft' | 'published' | 'archived',
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<StoryWithDetails>> {
    try {
      let query = supabase
        .from('stories')
        .select(`
          *,
          category:categories(*),
          theme:story_themes(*),
          stats:story_stats(*)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query.range(from, to);
      
      if (error) {
        return { 
          data: [], 
          pagination: { page, limit, total: 0, pages: 0 }, 
          error: error.message, 
          success: false 
        };
      }
      
      const total = count || 0;
      const pages = Math.ceil(total / limit);
      
      return { 
        data: data as StoryWithDetails[], 
        pagination: { page, limit, total, pages }, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return { 
        data: [], 
        pagination: { page, limit, total: 0, pages: 0 }, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Yayınlanan hikayeleri getir (ana sayfa için)
  static async getPublishedStories(
    page: number = 1,
    limit: number = 12,
    categoryId?: number,
    search?: string
  ): Promise<PaginatedResponse<StoryWithDetails>> {
    try {
      let query = supabase
        .from('stories')
        .select(`
          *,
          category:categories(*),
          theme:story_themes(*),
          profile:profiles(username, avatar_url),
          stats:story_stats(*)
        `, { count: 'exact' })
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%, author_name.ilike.%${search}%`);
      }
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query.range(from, to);
      
      if (error) {
        return { 
          data: [], 
          pagination: { page, limit, total: 0, pages: 0 }, 
          error: error.message, 
          success: false 
        };
      }
      
      const total = count || 0;
      const pages = Math.ceil(total / limit);
      
      return { 
        data: data as StoryWithDetails[], 
        pagination: { page, limit, total, pages }, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return { 
        data: [], 
        pagination: { page, limit, total: 0, pages: 0 }, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikayeyi yayınla
  static async publishStory(storyId: string): Promise<ApiResponse<Database['public']['Tables']['stories']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', storyId)
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Görüntülenme sayısını artır
  static async incrementViewCount(storyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('stories')
        .update({
          view_count: supabase.rpc('increment_view_count', { story_id: storyId })
        })
        .eq('id', storyId);
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: true, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
}

// Sayfa işlemleri
export class PageDatabase {
  
  // Sayfa oluştur
  static async createPage(pageData: PageCreateInput): Promise<ApiResponse<Database['public']['Tables']['story_pages']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('story_pages')
        .insert(pageData)
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Toplu sayfa oluştur
  static async createPages(pagesData: PageCreateInput[]): Promise<ApiResponse<Database['public']['Tables']['story_pages']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('story_pages')
        .insert(pagesData)
        .select();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Sayfa güncelle
  static async updatePage(pageId: string, updates: PageUpdateInput): Promise<ApiResponse<Database['public']['Tables']['story_pages']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('story_pages')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId)
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikayenin sayfalarını getir
  static async getStoryPages(storyId: string): Promise<ApiResponse<PageWithImage[]>> {
    try {
      const { data, error } = await supabase
        .from('story_pages')
        .select(`
          *,
          ai_image:ai_images(*)
        `)
        .eq('story_id', storyId)
        .order('page_number', { ascending: true });
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: data as PageWithImage[], error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Sayfa sil
  static async deletePage(pageId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('story_pages')
        .delete()
        .eq('id', pageId);
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: true, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Hikayenin tüm sayfalarını sil
  static async deleteStoryPages(storyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('story_pages')
        .delete()
        .eq('story_id', storyId);
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: true, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
}

// Kategori ve tema işlemleri
export class MetadataDatabase {
  
  // Kategorileri getir
  static async getCategories(): Promise<ApiResponse<Database['public']['Tables']['categories']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Temaları getir
  static async getThemes(): Promise<ApiResponse<Database['public']['Tables']['story_themes']['Row'][]>> {
    try {
      const { data, error } = await supabase
        .from('story_themes')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
}

// Kullanıcı işlemleri
export class UserDatabase {
  
  // Profil getir veya oluştur
  static async getOrCreateProfile(userId: string): Promise<ApiResponse<Database['public']['Tables']['profiles']['Row']>> {
    try {
      // Önce profili bulmaya çalış
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Profil bulunamadı, yeni oluştur
        const { data: userData } = await supabase.auth.getUser();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: userData.user?.user_metadata?.username || userData.user?.email?.split('@')[0] || 'kullanici',
            subscription_type: 'standard'
          })
          .select()
          .single();
        
        if (insertError) {
          return { data: null, error: insertError.message, success: false };
        }
        
        data = newProfile;
      } else if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Profil güncelle
  static async updateProfile(
    userId: string, 
    updates: Database['public']['Tables']['profiles']['Update']
  ): Promise<ApiResponse<Database['public']['Tables']['profiles']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
}

// Kütüphane işlemleri
export class LibraryDatabase {
  
  // Hikayeyi kütüphaneye ekle
  static async addToLibrary(userId: string, storyId: string): Promise<ApiResponse<Database['public']['Tables']['library']['Row']>> {
    try {
      const { data, error } = await supabase
        .from('library')
        .insert({
          user_id: userId,
          story_id: storyId
        })
        .select()
        .single();
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Kütüphaneden kaldır
  static async removeFromLibrary(userId: string, storyId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('library')
        .delete()
        .eq('user_id', userId)
        .eq('story_id', storyId);
      
      if (error) {
        return { data: null, error: error.message, success: false };
      }
      
      return { data: true, error: null, success: true };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
  
  // Kullanıcının kütüphanesini getir
  static async getUserLibrary(
    userId: string, 
    page: number = 1, 
    limit: number = 12
  ): Promise<PaginatedResponse<StoryWithDetails>> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from('library')
        .select(`
          *,
          story:stories(
            *,
            category:categories(*),
            theme:story_themes(*),
            profile:profiles(username, avatar_url),
            stats:story_stats(*)
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        return { 
          data: [], 
          pagination: { page, limit, total: 0, pages: 0 }, 
          error: error.message, 
          success: false 
        };
      }
      
      const total = count || 0;
      const pages = Math.ceil(total / limit);
      const stories = data.map(item => item.story).filter(Boolean) as StoryWithDetails[];
      
      return { 
        data: stories, 
        pagination: { page, limit, total, pages }, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return { 
        data: [], 
        pagination: { page, limit, total: 0, pages: 0 }, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata', 
        success: false 
      };
    }
  }
}

// Ana export
export const storyDb = {
  stories: StoryDatabase,
  pages: PageDatabase,
  metadata: MetadataDatabase,
  users: UserDatabase,
  library: LibraryDatabase
}; 