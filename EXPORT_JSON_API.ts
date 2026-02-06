// 📦 API D'EXPORT DES DONNÉES EN JSON
// Créez ce fichier dans app/api/export-data/route.ts

import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const results = {
      users: [],
      categories: [],
      candidates: [],
      votes: [],
      notifications: [],
      voting_config: null,
      statistics: {},
      export_date: new Date().toISOString()
    }

    // Export des utilisateurs
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at')
    results.users = users || []

    // Export des catégories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('created_at')
    results.categories = categories || []

    // Export des candidats
    const { data: candidates } = await supabaseAdmin
      .from('candidates')
      .select('*')
      .order('category_id, created_at')
    results.candidates = candidates || []

    // Export des votes
    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('*')
      .order('created_at')
    results.votes = votes || []

    // Export des notifications
    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at DESC')
    results.notifications = notifications || []

    // Export de la configuration de vote
    const { data: votingConfig } = await supabaseAdmin
      .from('voting_config')
      .select('*')
      .single()
    results.voting_config = votingConfig

    // Statistiques
    results.statistics = {
      total_users: users?.length || 0,
      total_categories: categories?.length || 0,
      total_candidates: candidates?.length || 0,
      total_votes: votes?.length || 0,
      total_notifications: notifications?.length || 0,
      votes_by_category: votes?.reduce((acc, vote) => {
        acc[vote.category_id] = (acc[vote.category_id] || 0) + 1
        return acc
      }, {}) || {},
      users_by_role: users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {}) || {}
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
