// Test d'inscription pour vérifier l'erreur
const testSignup = async () => {
  try {
    console.log('🧪 Test d\'inscription...');
    
    const response = await fetch('http://localhost:3001/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        domain: 'test',
        city: 'Bamako',
        role: 'VOTER'
      })
    });

    const result = await response.json();
    
    console.log('📊 Statut:', response.status);
    console.log('📋 Résultat:', result);
    
    if (response.ok) {
      console.log('✅ Inscription réussie !');
      
      // Tester l'envoi de code
      console.log('📧 Test d\'envoi de code...');
      
      const verificationResponse = await fetch('http://localhost:3001/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          userId: result.id,
          name: 'Test User',
          createSession: true
        })
      });

      const verificationResult = await verificationResponse.json();
      
      console.log('📊 Statut vérification:', verificationResponse.status);
      console.log('📋 Résultat vérification:', verificationResult);
      
      if (verificationResponse.ok && verificationResult.sessionId) {
        console.log('✅ Session créée:', verificationResult.sessionId);
        
        // Tester la récupération de session
        console.log('🔍 Test de récupération de session...');
        
        const sessionResponse = await fetch(`http://localhost:3001/api/auth/pending-verification?sessionId=${verificationResult.sessionId}`);
        const sessionResult = await sessionResponse.json();
        
        console.log('📊 Statut session:', sessionResponse.status);
        console.log('📋 Résultat session:', sessionResult);
      }
    } else {
      console.log('❌ Erreur d\'inscription:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error.message);
  }
};

testSignup();
