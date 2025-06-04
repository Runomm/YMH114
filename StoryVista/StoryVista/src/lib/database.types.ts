// Database Types - StoryVista
// Bu dosya supabase/schema.sql ile senkronize olmalıdır

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          bio: string | null;
          avatar_url: string | null;
          subscription_type: 'standard' | 'premium';
          subscription_expires_at: string | null;
          stories_created: number;
          total_pages_created: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          subscription_type?: 'standard' | 'premium';
          subscription_expires_at?: string | null;
          stories_created?: number;
          total_pages_created?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          subscription_type?: 'standard' | 'premium';
          subscription_expires_at?: string | null;
          stories_created?: number;
          total_pages_created?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          icon: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          created_at?: string;
        };
      };
      story_themes: {
        Row: {
          id: number;
          name: string;
          display_name: string;
          description: string | null;
          css_classes: string | null;
          font_family: string | null;
          color_scheme: any | null; // JSONB
          created_at: string;
        };
        Insert: {
          name: string;
          display_name: string;
          description?: string | null;
          css_classes?: string | null;
          font_family?: string | null;
          color_scheme?: any | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          display_name?: string;
          description?: string | null;
          css_classes?: string | null;
          font_family?: string | null;
          color_scheme?: any | null;
          created_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string;
          category_id: number | null;
          theme_id: number;
          cover_image_url: string | null;
          audio_url: string | null;
          status: 'draft' | 'published' | 'archived';
          read_time: number | null;
          page_count: number;
          total_words: number;
          author_name: string | null;
          main_character: string | null;
          setting_location: string | null;
          story_description: string | null;
          package_type: 'normal' | 'deluxe' | 'premium';
          page_layout: 'classic' | 'panoramic';
          cover_style: 'light' | 'dark' | 'colorful' | 'minimal';
          voice_type: string | null;
          voice_speed: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          tags: string[] | null;
          language: string;
          is_premium: boolean;
          view_count: number;
          like_count: number;
          download_count: number;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          user_id: string;
          category_id?: number | null;
          theme_id?: number;
          cover_image_url?: string | null;
          audio_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          read_time?: number | null;
          page_count?: number;
          total_words?: number;
          author_name?: string | null;
          main_character?: string | null;
          setting_location?: string | null;
          story_description?: string | null;
          package_type?: 'normal' | 'deluxe' | 'premium';
          page_layout?: 'classic' | 'panoramic';
          cover_style?: 'light' | 'dark' | 'colorful' | 'minimal';
          voice_type?: string | null;
          voice_speed?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          tags?: string[] | null;
          language?: string;
          is_premium?: boolean;
          view_count?: number;
          like_count?: number;
          download_count?: number;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          user_id?: string;
          category_id?: number | null;
          theme_id?: number;
          cover_image_url?: string | null;
          audio_url?: string | null;
          status?: 'draft' | 'published' | 'archived';
          read_time?: number | null;
          page_count?: number;
          total_words?: number;
          author_name?: string | null;
          main_character?: string | null;
          setting_location?: string | null;
          story_description?: string | null;
          package_type?: 'normal' | 'deluxe' | 'premium';
          page_layout?: 'classic' | 'panoramic';
          cover_style?: 'light' | 'dark' | 'colorful' | 'minimal';
          voice_type?: string | null;
          voice_speed?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          tags?: string[] | null;
          language?: string;
          is_premium?: boolean;
          view_count?: number;
          like_count?: number;
          download_count?: number;
        };
      };
      story_pages: {
        Row: {
          id: string;
          story_id: string;
          page_number: number;
          content: string | null;
          title: string | null;
          image_url: string | null;
          image_prompt: string | null;
          template_type: 'classic' | 'panoramic';
          is_cover_page: boolean;
          is_back_cover_page: boolean;
          is_title_page: boolean;
          font_size: 'small' | 'medium' | 'large';
          text_alignment: 'left' | 'center' | 'justify';
          background_color: string | null;
          text_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          page_number: number;
          content?: string | null;
          title?: string | null;
          image_url?: string | null;
          image_prompt?: string | null;
          template_type?: 'classic' | 'panoramic';
          is_cover_page?: boolean;
          is_back_cover_page?: boolean;
          is_title_page?: boolean;
          font_size?: 'small' | 'medium' | 'large';
          text_alignment?: 'left' | 'center' | 'justify';
          background_color?: string | null;
          text_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          page_number?: number;
          content?: string | null;
          title?: string | null;
          image_url?: string | null;
          image_prompt?: string | null;
          template_type?: 'classic' | 'panoramic';
          is_cover_page?: boolean;
          is_back_cover_page?: boolean;
          is_title_page?: boolean;
          font_size?: 'small' | 'medium' | 'large';
          text_alignment?: 'left' | 'center' | 'justify';
          background_color?: string | null;
          text_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      library: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          is_favorite: boolean;
          reading_progress: number;
          last_read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          is_favorite?: boolean;
          reading_progress?: number;
          last_read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          is_favorite?: boolean;
          reading_progress?: number;
          last_read_at?: string | null;
          created_at?: string;
        };
      };
      ratings: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          score: number;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          score: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          score?: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          content: string;
          parent_comment_id: string | null;
          is_edited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          content: string;
          parent_comment_id?: string | null;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          content?: string;
          parent_comment_id?: string | null;
          is_edited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      story_likes: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          created_at?: string;
        };
      };
      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      ai_images: {
        Row: {
          id: string;
          story_id: string;
          page_id: string | null;
          prompt: string;
          style: string | null;
          image_url: string;
          generation_time: number | null;
          model_used: string;
          cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          page_id?: string | null;
          prompt: string;
          style?: string | null;
          image_url: string;
          generation_time?: number | null;
          model_used?: string;
          cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          page_id?: string | null;
          prompt?: string;
          style?: string | null;
          image_url?: string;
          generation_time?: number | null;
          model_used?: string;
          cost?: number | null;
          created_at?: string;
        };
      };
      story_audio: {
        Row: {
          id: string;
          story_id: string;
          audio_url: string;
          duration_seconds: number | null;
          voice_type: string;
          voice_speed: number;
          language: string;
          file_size_bytes: number | null;
          generation_cost: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          audio_url: string;
          duration_seconds?: number | null;
          voice_type?: string;
          voice_speed?: number;
          language?: string;
          file_size_bytes?: number | null;
          generation_cost?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          audio_url?: string;
          duration_seconds?: number | null;
          voice_type?: string;
          voice_speed?: number;
          language?: string;
          file_size_bytes?: number | null;
          generation_cost?: number | null;
          created_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: number;
          setting_key: string;
          setting_value: any; // JSONB
          description: string | null;
          updated_at: string;
        };
        Insert: {
          setting_key: string;
          setting_value: any;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          setting_key?: string;
          setting_value?: any;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      story_stats: {
        Row: {
          id: string;
          title: string;
          view_count: number;
          like_count: number;
          avg_rating: number;
          rating_count: number;
          comment_count: number;
        };
      };
    };
    Functions: {
      update_story_stats: {
        Args: {};
        Returns: undefined;
      };
      update_user_stats: {
        Args: {};
        Returns: undefined;
      };
    };
    Enums: {
      subscription_type: 'standard' | 'premium';
      story_status: 'draft' | 'published' | 'archived';
      package_type: 'normal' | 'deluxe' | 'premium';
      page_layout: 'classic' | 'panoramic';
      cover_style: 'light' | 'dark' | 'colorful' | 'minimal';
      template_type: 'classic' | 'panoramic';
      font_size: 'small' | 'medium' | 'large';
      text_alignment: 'left' | 'center' | 'justify';
      message_type: 'personal' | 'system' | 'notification';
    };
  };
}

// Utility types for common operations
export type StoryWithDetails = Database['public']['Tables']['stories']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
  theme?: Database['public']['Tables']['story_themes']['Row'];
  profile?: Database['public']['Tables']['profiles']['Row'];
  pages?: Database['public']['Tables']['story_pages']['Row'][];
  stats?: Database['public']['Views']['story_stats']['Row'];
};

export type PageWithImage = Database['public']['Tables']['story_pages']['Row'] & {
  ai_image?: Database['public']['Tables']['ai_images']['Row'];
};

export type StoryCreateInput = Database['public']['Tables']['stories']['Insert'];
export type StoryUpdateInput = Database['public']['Tables']['stories']['Update'];
export type PageCreateInput = Database['public']['Tables']['story_pages']['Insert'];
export type PageUpdateInput = Database['public']['Tables']['story_pages']['Update'];

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error: string | null;
  success: boolean;
} 