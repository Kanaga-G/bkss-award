import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test de connexion à Supabase...')
    console.log('📡 URL Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Test 1: Connexion simple
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)
      .single()

    if (testError) {
      console.error('❌ Erreur de connexion:', testError)
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur de connexion à Supabase',
        details: testError.message 
      }, { status: 500 })
    }

    console.log('✅ Connexion réussie à Supabase!')

    // Test 2: Récupérer les statistiques de la base
    const [
      { count: usersCount, error: usersError },
      { count: categoriesCount, error: categoriesError },
      { count: candidatesCount, error: candidatesError },
      { count: votesCount, error: votesError }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('candidates').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('votes').select('*', { count: 'exact', head: true })
    ])

    // Test 3: Récupérer quelques données réelles
    const { data: recentUsers, error: recentUsersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: categories, error: categoriesDataError } = await supabaseAdmin
      .from('categories')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    // Test 4: Vérifier les nouvelles tables
    const { data: emailVerifications, error: emailVerifError } = await supabaseAdmin
      .from('email_verifications')
      .select('*', { count: 'exact', head: true })

    const { data: deviceRegistrations, error: deviceRegError } = await supabaseAdmin
      .from('device_registrations')
      .select('*', { count: 'exact', head: true })

    // Compilation des erreurs
    const errors = [
      usersError, categoriesError, candidatesError, votesError,
      recentUsersError, categoriesDataError, emailVerifError, deviceRegError
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('⚠️ Erreurs lors de la récupération des données:', errors)
    }

    // Résultat complet
    const result = {
      success: true,
      message: 'Connexion à Supabase réussie!',
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        status: 'Connected',
        timestamp: new Date().toISOString()
      },
      statistics: {
        users: usersCount || 0,
        categories: categoriesCount || 0,
        candidates: candidatesCount || 0,
        votes: votesCount || 0,
        email_verifications: emailVerifications?.length || 0,
        device_registrations: deviceRegistrations?.length || 0
      },
      recent_data: {
        users: recentUsers || [],
        categories: categories || []
      },
      tables_status: {
        users: !usersError,
        categories: !categoriesError,
        candidates: !candidatesError,
        votes: !votesError,
        email_verifications: !emailVerifError,
        device_registrations: !deviceRegError
      },
      errors: errors.map(err => err?.message)
    }

    console.log('📊 Statistiques récupérées:', result.statistics)
    console.log('👥 Utilisateurs récents:', result.recent_data.users?.length)
    console.log('🎭 Catégories:', result.recent_data.categories?.length)

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Erreur critique lors du test de connexion:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur critique lors du test de connexion',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create_test_user':
        // Créer un utilisateur de test
        const testUser = {
          name: 'Utilisateur Test',
          email: `test_${Date.now()}@example.com`,
          password: 'test123456',
          role: 'VOTER',
          city: 'Bamako',
          domain: 'Technologie',
          device_id: 'test_device_' + Date.now(),
          email_verified: false
        }

        const { data: newUser, error: createError } = await supabaseAdmin
          .from('users')
          .insert(testUser)
          .select()
          .single()

        if (createError) {
          return NextResponse.json({ 
            success: false, 
            error: createError.message 
          }, { status: 400 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Utilisateur de test créé',
          user: newUser 
        })

      case 'test_email_verification':
        // Tester l'envoi de code de vérification
        const { userId, email } = body
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        const { error: emailError } = await supabaseAdmin
          .from('email_verifications')
          .insert({
            user_id: userId,
            email: email,
            code: verificationCode,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
          })

        if (emailError) {
          return NextResponse.json({ 
            success: false, 
            error: emailError.message 
          }, { status: 400 })
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Code de vérification créé',
          code: verificationCode, // Retourner le code pour test
          expires_at: expiresAt.toISOString()
        })

      default:
        return NextResponse.json({ 
          error: 'Action non reconnue' 
        }, { status: 400 })
    }

  } catch (error) {
    console.error('💥 Erreur lors du test POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors du test POST',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
