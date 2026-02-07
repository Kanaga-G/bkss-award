// Test de mise à jour de candidat
const testCandidateUpdate = async () => {
  try {
    console.log('🧪 Test de mise à jour de candidat...');
    
    // Simuler les données d'un candidat
    const candidateData = {
      id: 'test-candidate-id',
      name: 'Test Candidate Updated',
      alias: 'Test Alias',
      image: 'https://example.com/image.jpg',
      bio: 'Updated bio',
      achievements: ['Achievement 1', 'Achievement 2'],
      songCount: 10,
      candidateSong: 'Test Song',
      categoryId: 'test-category-id'
    };
    
    console.log('📤 Données envoyées:', JSON.stringify(candidateData, null, 2));
    
    // Test de l'API
    const response = await fetch('http://localhost:3001/api/candidates', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(candidateData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur API:', response.status, error);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Succès:', result);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
};

// Exécuter le test
testCandidateUpdate();
