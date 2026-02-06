// Test simple de connexion avec clé anon
const { createClient } = require('@supabase/supabase-js');

// Configuration avec clé anon (moins restrictive)
const supabaseUrl = 'https://vamthumimnkfdcokfmor.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHhtaHFoa2NzYXd2amp3eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzU0OTQsImV4cCI6MjA4NTkxMTQ5NH0.YJ2fxkICoxwp3rmwRjpuESI0gmtINi7S9kzu9f8JUrE';

console.log('🔍 TEST SIMPLE DE CONNEXION (CLÉ ANON)');
console.log('='.repeat(50));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simpleTest() {
  try {
    console.log('\n📊 Test de connexion basique...');
    
    // Test simple de lecture
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.error('Détails:', error);
      return;
    }

    console.log('✅ Connexion réussie avec clé ANON!');
    console.log('📊 Donnée:', data);

    console.log('\n📈 Test de statistiques...');
    
    // Récupérer les statistiques
    const [usersResult, categoriesResult] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true })
    ]);

    console.log(`👥 Utilisateurs: ${usersResult.count || 0}`);
    console.log(`🎭 Catégories: ${categoriesResult.count || 0}`);

    if (usersResult.count > 0) {
      console.log('\n👥 Test de récupération d\'utilisateurs...');
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      console.log('Utilisateurs récents:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    console.log('\n🎉 TEST TERMINÉ AVEC SUCCÈS!');
    console.log('✅ La connexion à Supabase fonctionne parfaitement');
    console.log('✅ Les tables sont accessibles');
    console.log('✅ Les données peuvent être lues');

  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
}

simpleTest().then(() => {
  console.log('\n🏁 Test simple terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur non gérée:', error);
  process.exit(1);
});
