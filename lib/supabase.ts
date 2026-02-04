import { createClient } from '@supabase/supabase-js'

// Variables d'environnement avec valeurs par défaut
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vamthumimnkfdcokfmor.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rxI5prOx2rcr8a1AgxW0Jw_LGREY4Zl'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbXRodW1pbW5rZmRjb2tmbW9yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk4NzY3MiwiZXhwIjoyMDg1NTYzNjcyfQ.HqlD0qlhAMtM-Jj_gLuOewnG3xzVnfj83M4VjiLSwdM'

// Vérification que les clés sont disponibles
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client public (pour les opérations côté client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin (pour les opérations côté serveur avec privilèges élevés)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password?: string
          domain?: string
          city?: string
          phone?: string
          role: 'VOTER' | 'SUPER_ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          subtitle: string
          special: boolean
          is_leadership_prize: boolean
          pre_assigned_winner?: string
          pre_assigned_winner_bio?: string
          pre_assigned_winner_image?: string
          pre_assigned_winner_achievements: string[]
          pre_assigned_winner_tribute?: string
          leadership_revealed: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      candidates: {
        Row: {
          id: string
          category_id: string
          name: string
          alias?: string
          image: string
          bio: string
          achievements: string[]
          song_count?: number
          candidate_song?: string
          audio_file?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['candidates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>
      }
      votes: {
        Row: {
          id: string
          user_id: string
          category_id: string
          candidate_id: string
          candidate_name: string
          timestamp: number
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>
      }
      admin_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity: string
          entity_id?: string
          old_values?: any
          new_values?: any
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_logs']['Insert']>
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: any
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>
      }
    }
  }
}
