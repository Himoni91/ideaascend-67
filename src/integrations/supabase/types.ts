export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          category: string
          comments_count: number | null
          created_at: string
          description: string
          id: string
          mentor_reviews_count: number | null
          tags: string[] | null
          title: string
          user_id: string
          votes_count: number | null
        }
        Insert: {
          category: string
          comments_count?: number | null
          created_at?: string
          description: string
          id?: string
          mentor_reviews_count?: number | null
          tags?: string[] | null
          title: string
          user_id: string
          votes_count?: number | null
        }
        Update: {
          category?: string
          comments_count?: number | null
          created_at?: string
          description?: string
          id?: string
          mentor_reviews_count?: number | null
          tags?: string[] | null
          title?: string
          user_id?: string
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          poll_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          poll_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          poll_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_option_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          poll_option_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          poll_option_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_multiple_choice: boolean | null
          post_id: string | null
          question: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          post_id?: string | null
          question: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_multiple_choice?: boolean | null
          post_id?: string | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          reaction_type_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          reaction_type_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          reaction_type_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_reaction_type_id_fkey"
            columns: ["reaction_type_id"]
            isOneToOne: false
            referencedRelation: "reaction_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reposts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reposts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          category: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          reposts_count: number | null
          trending_score: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          category?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          reposts_count?: number | null
          trending_score?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          category?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          reposts_count?: number | null
          trending_score?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: Json | null
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          byline: string | null
          company: string | null
          created_at: string | null
          education: Json | null
          expertise: string[] | null
          full_name: string | null
          id: string
          is_mentor: boolean | null
          is_verified: boolean | null
          level: number | null
          linkedin_url: string | null
          location: string | null
          mentor_availability: Json | null
          mentor_bio: string | null
          mentor_hourly_rate: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          portfolio_items: Json | null
          position: string | null
          professional_summary: string | null
          public_email: boolean | null
          skills: string[] | null
          social_links: Json | null
          stats: Json | null
          twitter_url: string | null
          updated_at: string | null
          username: string | null
          verification_documents: Json | null
          verification_status: string | null
          website: string | null
          work_experience: Json | null
          xp: number | null
        }
        Insert: {
          achievements?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          byline?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          expertise?: string[] | null
          full_name?: string | null
          id: string
          is_mentor?: boolean | null
          is_verified?: boolean | null
          level?: number | null
          linkedin_url?: string | null
          location?: string | null
          mentor_availability?: Json | null
          mentor_bio?: string | null
          mentor_hourly_rate?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          portfolio_items?: Json | null
          position?: string | null
          professional_summary?: string | null
          public_email?: boolean | null
          skills?: string[] | null
          social_links?: Json | null
          stats?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          website?: string | null
          work_experience?: Json | null
          xp?: number | null
        }
        Update: {
          achievements?: Json | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          byline?: string | null
          company?: string | null
          created_at?: string | null
          education?: Json | null
          expertise?: string[] | null
          full_name?: string | null
          id?: string
          is_mentor?: boolean | null
          is_verified?: boolean | null
          level?: number | null
          linkedin_url?: string | null
          location?: string | null
          mentor_availability?: Json | null
          mentor_bio?: string | null
          mentor_hourly_rate?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          portfolio_items?: Json | null
          position?: string | null
          professional_summary?: string | null
          public_email?: boolean | null
          skills?: string[] | null
          social_links?: Json | null
          stats?: Json | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          website?: string | null
          work_experience?: Json | null
          xp?: number | null
        }
        Relationships: []
      }
      reaction_types: {
        Row: {
          color: string | null
          created_at: string
          icon: string
          id: string
          name: string
          weight: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon: string
          id?: string
          name: string
          weight?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string
          id?: string
          name?: string
          weight?: number
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
