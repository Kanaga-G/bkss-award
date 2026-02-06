// 📦 API D'EXPORT DES DONNÉES EN JSON
// Accès: http://localhost:3000/api/export-data

import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

interface User {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  created_at: string
  updated_at: string
}

interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface Candidate {
  id: string
  name: string
  bio?: string
  image_url?: string
  audio_file?: string
  candidate_song?: string
  category_id: string
  created_at: string
  updated_at: string
}

interface Vote {
  id: string
  user_id: string
  category_id: string
  candidate_id: string
  created_at: string
  updated_at: string
}

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  updated_at: string
}

interface VotingConfig {
  is_voting_open: boolean
  block_message?: string
  created_at: string
  updated_at: string
}

export async function GET() {
  try {
    const results = {
      users: [] as User[],
      categories: [] as Category[],
      candidates: [] as Candidate[],
      votes: [] as Vote[],
      notifications: [] as Notification[],
      voting_config: null as VotingConfig | null,
      statistics: {} as Record<string, any>,
      export_date: new Date().toISOString()
    }

    // Export des utilisateurs
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at')
    if (users) results.users = users

    // Export des catégories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at')
    if (categories) results.categories = categories

    // Export des candidats
    const { data: candidates } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .order('category_id, created_at')
    if (candidates) results.candidates = candidates

    // Export des votes
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('*')
      .order('created_at')
    if (votes) results.votes = votes

    // Export des notifications
    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at DESC')
    if (notifications) results.notifications = notifications

    // Export de la configuration de vote
    const { data: votingConfig } = await supabaseAdmin
      .from('voting_config')
      .select('*')
      .single()
    if (votingConfig) results.voting_config = votingConfig

    // Statistiques
    results.statistics = {
      total_users: results.users.length,
      total_categories: results.categories.length,
      total_candidates: results.candidates.length,
      total_votes: results.votes.length,
      total_notifications: results.notifications.length,
      votes_by_category: results.votes.reduce((acc, vote) => {
        acc[vote.category_id] = (acc[vote.category_id] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      users_by_role: results.users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json(results, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="bankass_data_backup_${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('Erreur export données:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    )
  }
}
