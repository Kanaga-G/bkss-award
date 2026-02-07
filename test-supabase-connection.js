const { createClient } = require('@supabase/supabase-js');

// Test de connexion avec les variables actuelles
const supabaseUrl = 'https://vamthumimnkfdcokfmor.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbXRodW1pbW5rZmRjb2tmbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODc2NzIsImV4cCI6MjA4NTU2MzY3Mn0.-9B87ZcM9LLamB0sQjZM60Jz4Hlwg1npeFfIj-Bg_TA';

console.log('🔍 Test de connexion Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Test de connexion à la base...');
    
    // Test simple: compter les utilisateurs
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion réussie !');
    console.log(`📊 Utilisateurs trouvés: ${count}`);
    
    // Test des catégories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name');
    
    if (catError) {
      console.error('❌ Erreur catégories:', catError.message);
    } else {
      console.log(`📁 Catégories trouvées: ${categories.length}`);
      categories.forEach(cat => console.log(`  - ${cat.name}`));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 La connexion Supabase fonctionne correctement');
    console.log('💡 Le problème vient probablement de la configuration Vercel/Render');
  } else {
    console.log('🚨 La connexion Supabase échoue - vérifiez les clés');
  }
});
