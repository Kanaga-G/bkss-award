const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testVoteAPI() {
  try {
    console.log('🧪 Test de l\'API votes...');
    
    // Test GET
    console.log('\n1️⃣ Test GET /api/votes');
    const getResponse = await fetch('http://localhost:3000/api/votes');
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Data:', getData);
    
    // Test POST (simulation d'un vote)
    console.log('\n2️⃣ Test POST /api/votes');
    
    // Récupérer un utilisateur et une catégorie valides
    const { data: users } = await supabase.from('users').select('id').limit(1);
    const { data: categories } = await supabase.from('categories').select('id').limit(1);
    const { data: candidates } = await supabase.from('candidates').select('id').limit(1);
    
    if (users.length > 0 && categories.length > 0 && candidates.length > 0) {
      const voteData = {
        userId: users[0].id,
        categoryId: categories[0].id,
        candidateId: candidates[0].id
      };
      
      console.log('Données de vote:', voteData);
      
      const postResponse = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voteData)
      });
      
      const postData = await postResponse.json();
      console.log('Status:', postResponse.status);
      console.log('Response:', postData);
    } else {
      console.log('❌ Pas assez de données pour tester le vote');
      console.log('Users:', users.length);
      console.log('Categories:', categories.length);
      console.log('Candidates:', candidates.length);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testVoteAPI();
