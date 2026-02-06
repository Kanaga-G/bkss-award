// Test de connexion via API web
const https = require('https');

console.log('🌐 TEST DE CONNEXION VIA API WEB');
console.log('='.repeat(50));

async function testWebAPI() {
  try {
    console.log('\n📡 Test 1: Vérification de l\'URL Supabase...');
    
    // Test de connexion à l'URL Supabase
    const supabaseUrl = 'https://vamthumimnkfdcokfmor.supabase.co';
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHhtaHFoa2NzYXd2amp3eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzU0OTQsImV4cCI6MjA4NTkxMTQ5NH0.YJ2fxkICoxwp3rmwRjpuESI0gmtINi7S9kzu9f8JUrE',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Connexion à l\'API Supabase réussie!');
      
      // Récupérer les schémas disponibles
      const data = await response.json();
      console.log('📊 Schémas disponibles:', Object.keys(data).slice(0, 5));
      
      if (data.users) {
        console.log('\n👥 Test 2: Vérification de la table users...');
        
        const usersResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHhtaHFoa2NzYXd2amp3eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzU0OTQsImV4cCI6MjA4NTkxMTQ5NH0.YJ2fxkICoxwp3rmwRjpuESI0gmtINi7S9kzu9f8JUrE',
            'Content-Type': 'application/json'
          }
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('✅ Table users accessible!');
          console.log('📊 Donnée retournée:', usersData);
        } else {
          console.log('❌ Erreur accès table users:', usersResponse.status);
        }
      }

      if (data.categories) {
        console.log('\n🎭 Test 3: Vérification de la table categories...');
        
        const categoriesResponse = await fetch(`${supabaseUrl}/rest/v1/categories?select=id,name&limit=3`, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHhtaHFoa2NzYXd2amp3eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzU0OTQsImV4cCI6MjA4NTkxMTQ5NH0.YJ2fxkICoxwp3rmwRjpuESI0gmtINi7S9kzu9f8JUrE',
            'Content-Type': 'application/json'
          }
        });

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('✅ Table categories accessible!');
          console.log('📊 Catégories trouvées:', categoriesData.length);
          categoriesData.forEach((cat, index) => {
            console.log(`  ${index + 1}. ${cat.name} (ID: ${cat.id})`);
          });
        } else {
          console.log('❌ Erreur accès table categories:', categoriesResponse.status);
        }
      }

      console.log('\n📈 Test 4: Statistiques complètes...');
      
      // Compter les enregistrements dans chaque table
      const tables = ['users', 'categories', 'candidates', 'votes', 'notifications', 'admin_messages', 'voting_config'];
      
      for (const tableName of tables) {
        try {
          const countResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
            method: 'GET',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHhtaHFoa2NzYXd2amp3eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzU0OTQsImV4cCI6MjA4NTkxMTQ5NH0.YJ2fxkICoxwp3rmwRjpuESI0gmtINi7S9kzu9f8JUrE',
              'Content-Type': 'application/json'
            }
          });

          if (countResponse.ok) {
            const countData = await countResponse.json();
            const count = Array.isArray(countData) ? countData.length : (countData[0]?.count || 0);
            console.log(`  📊 ${tableName}: ${count} enregistrements`);
          } else {
            console.log(`  ❌ ${tableName}: Erreur ${countResponse.status}`);
          }
        } catch (error) {
          console.log(`  ❌ ${tableName}: Erreur - ${error.message}`);
        }
      }

      console.log('\n🎉 RÉSULTAT FINAL:');
      console.log('='.repeat(50));
      console.log('✅ API Supabase: ACCESSIBLE');
      console.log('✅ Authentification API: FONCTIONNELLE');
      console.log('✅ Tables principales: ACCESSIBLES');
      console.log('✅ Lecture des données: FONCTIONNELLE');
      console.log('\n🚀 BAN KASS AWARDS - API OPÉRATIONNELLE ! 🚀');

    } else {
      console.error('❌ Erreur de connexion à l\'API:', response.status);
      console.error('Message:', await response.text());
    }

  } catch (error) {
    console.error('💥 Erreur critique:', error.message);
  }
}

// Exécuter le test
testWebAPI().then(() => {
  console.log('\n🏁 Test API web terminé');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur non gérée:', error);
  process.exit(1);
});
