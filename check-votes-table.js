const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkVotesTable() {
  try {
    console.log('🔍 Vérification de la table votes...');
    
    // Test simple
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('count')
      .limit(1);
    
    if (votesError) {
      console.log('❌ Erreur table votes:', votesError);
      console.log('Message:', votesError.message);
      console.log('Code:', votesError.code);
      console.log('Details:', votesError.details);
      
      // Vérifier si la table existe
      console.log('\n🔍 Test existence table votes...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'votes');
      
      if (tablesError) {
        console.log('❌ Erreur vérification tables:', tablesError);
      } else {
        console.log('📋 Tables trouvées:', tables);
        if (tables.length === 0) {
          console.log('❌ La table votes n\'existe pas!');
        } else {
          console.log('✅ La table votes existe');
        }
      }
    } else {
      console.log('✅ Table votes accessible, count:', votes);
    }
    
    // Vérifier les catégories aussi
    console.log('\n🔍 Vérification de la table categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (categoriesError) {
      console.log('❌ Erreur table categories:', categoriesError);
    } else {
      console.log('✅ Table categories accessible, count:', categories);
    }
    
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkVotesTable();
