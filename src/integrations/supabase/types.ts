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
      badges: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirements: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirements?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirements?: string | null
        }
        Relationships: []
      }
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
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_mentor_conversation: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mentor_conversation?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mentor_conversation?: boolean | null
          updated_at?: string
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
      leaderboard: {
        Row: {
          avatar_url: string | null
          date_range: string
          full_name: string | null
          id: string
          level: number
          monthly_xp: number
          rank: number
          updated_at: string
          user_id: string
          username: string
          weekly_xp: number
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          date_range: string
          full_name?: string | null
          id?: string
          level?: number
          monthly_xp?: number
          rank: number
          updated_at?: string
          user_id: string
          username: string
          weekly_xp?: number
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          date_range?: string
          full_name?: string | null
          id?: string
          level?: number
          monthly_xp?: number
          rank?: number
          updated_at?: string
          user_id?: string
          username?: string
          weekly_xp?: number
          xp?: number
        }
        Relationships: []
      }
      mentor_applications: {
        Row: {
          approved_at: string | null
          bio: string
          created_at: string | null
          experience: string
          expertise: string[]
          hourly_rate: number | null
          id: string
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          bio: string
          created_at?: string | null
          experience: string
          expertise: string[]
          hourly_rate?: number | null
          id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          bio?: string
          created_at?: string | null
          experience?: string
          expertise?: string[]
          hourly_rate?: number | null
          id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          mentor_id: string
          pitch_id: string
          rating: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentor_id: string
          pitch_id: string
          rating: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentor_id?: string
          pitch_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reviews_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          mentee_id: string
          mentor_id: string
          metadata: Json | null
          payment_status: string | null
          price: number | null
          session_url: string | null
          start_time: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          mentee_id: string
          mentor_id: string
          metadata?: Json | null
          payment_status?: string | null
          price?: number | null
          session_url?: string | null
          start_time: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          metadata?: Json | null
          payment_status?: string | null
          price?: number | null
          session_url?: string | null
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          notification_type: string
          related_id: string | null
          related_type: string | null
          sender_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type: string
          related_id?: string | null
          related_type?: string | null
          sender_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          notification_type?: string
          related_id?: string | null
          related_type?: string | null
          sender_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pitch_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_mentor_comment: boolean | null
          pitch_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_mentor_comment?: boolean | null
          pitch_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_mentor_comment?: boolean | null
          pitch_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_comments_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_votes: {
        Row: {
          created_at: string
          id: string
          pitch_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          pitch_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          pitch_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_votes_pitch_id_fkey"
            columns: ["pitch_id"]
            isOneToOne: false
            referencedRelation: "pitches"
            referencedColumns: ["id"]
          },
        ]
      }
      pitches: {
        Row: {
          category: string
          comments_count: number | null
          created_at: string
          description: string
          id: string
          is_premium: boolean | null
          media_type: string | null
          media_url: string | null
          mentor_reviews_count: number | null
          tags: string[] | null
          title: string
          trending_score: number | null
          user_id: string
          votes_count: number | null
        }
        Insert: {
          category: string
          comments_count?: number | null
          created_at?: string
          description: string
          id?: string
          is_premium?: boolean | null
          media_type?: string | null
          media_url?: string | null
          mentor_reviews_count?: number | null
          tags?: string[] | null
          title: string
          trending_score?: number | null
          user_id: string
          votes_count?: number | null
        }
        Update: {
          category?: string
          comments_count?: number | null
          created_at?: string
          description?: string
          id?: string
          is_premium?: boolean | null
          media_type?: string | null
          media_url?: string | null
          mentor_reviews_count?: number | null
          tags?: string[] | null
          title?: string
          trending_score?: number | null
          user_id?: string
          votes_count?: number | null
        }
        Relationships: []
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
      profile_views: {
        Row: {
          id: string
          is_anonymous: boolean | null
          profile_id: string
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          is_anonymous?: boolean | null
          profile_id: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          is_anonymous?: boolean | null
          profile_id?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
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
          is_online: boolean | null
          is_two_factor_enabled: boolean | null
          is_verified: boolean | null
          last_seen_at: string | null
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
          preferences: Json | null
          professional_headline: string | null
          professional_summary: string | null
          profile_completion_percentage: number | null
          profile_header_url: string | null
          profile_views: number | null
          public_email: boolean | null
          role_type: Database["public"]["Enums"]["user_role_type"] | null
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
          is_online?: boolean | null
          is_two_factor_enabled?: boolean | null
          is_verified?: boolean | null
          last_seen_at?: string | null
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
          preferences?: Json | null
          professional_headline?: string | null
          professional_summary?: string | null
          profile_completion_percentage?: number | null
          profile_header_url?: string | null
          profile_views?: number | null
          public_email?: boolean | null
          role_type?: Database["public"]["Enums"]["user_role_type"] | null
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
          is_online?: boolean | null
          is_two_factor_enabled?: boolean | null
          is_verified?: boolean | null
          last_seen_at?: string | null
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
          preferences?: Json | null
          professional_headline?: string | null
          professional_summary?: string | null
          profile_completion_percentage?: number | null
          profile_header_url?: string | null
          profile_views?: number | null
          public_email?: boolean | null
          role_type?: Database["public"]["Enums"]["user_role_type"] | null
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
      session_history: {
        Row: {
          created_at: string | null
          device_info: Json | null
          id: string
          ip_address: string | null
          last_active_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          related_id: string | null
          related_type: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          related_id?: string | null
          related_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
      user_verification: {
        Row: {
          created_at: string | null
          email_verified: boolean | null
          id: string
          two_factor_enabled: boolean | null
          two_factor_method: string | null
          updated_at: string | null
          verification_code: string | null
          verification_code_expires_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_verified?: boolean | null
          id: string
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_message_user: {
        Args: {
          sender_id: string
          recipient_id: string
        }
        Returns: boolean
      }
      get_user_roles: {
        Args: {
          user_id: string
        }
        Returns: {
          role: string
        }[]
      }
      increment_view_count: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      user_role_type: "mentor" | "entrepreneur" | "both"
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
