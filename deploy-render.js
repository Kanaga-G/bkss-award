const { execSync } = require('child_process');

console.log('🚀 Préparation déploiement Render...');

try {
  // 1. Nettoyer et builder
  console.log('🧹 Nettoyage...');
  try {
    execSync('rmdir /s /q .next', { stdio: 'inherit' });
  } catch (e) {
    console.log('Dossier déjà nettoyé');
  }
  
  console.log('🔨 Build production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Créer fichier render.yaml
  const renderConfig = `
services:
  - type: web
    name: bkss-awards
    env: node
    buildCommand: npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /
  `;
  
  require('fs').writeFileSync('render.yaml', renderConfig);
  
  console.log('✅ Prêt pour Render !');
  console.log('📋 Étapes suivantes :');
  console.log('1. Allez sur render.com');
  console.log('2. Importez le repo GitHub');
  console.log('3. Configurez le domaine bankassaward.org');
  console.log('🌐 Votre site sera accessible sur bankassaward.org');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
