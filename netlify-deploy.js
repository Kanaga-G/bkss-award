const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Préparation déploiement Netlify...');

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
  
  // 2. Créer netlify.toml
  const netlifyConfig = `
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-store, must-revalidate"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
  `;
  
  fs.writeFileSync('netlify.toml', netlifyConfig);
  
  // 3. Créer _redirects file
  const redirects = `
/*    /index.html   200
/api/*  /.netlify/functions/:splat  200
  `;
  
  if (!fs.existsSync('.next')) {
    fs.mkdirSync('.next');
  }
  fs.writeFileSync('.next/_redirects', redirects);
  
  console.log('✅ Prêt pour Netlify !');
  console.log('📋 Étapes suivantes :');
  console.log('1. Installez Netlify CLI: npm install -g netlify-cli');
  console.log('2. Connectez-vous: netlify login');
  console.log('3. Déployez: netlify deploy --prod --dir=.next');
  console.log('4. Configurez les variables d\'environnement sur Netlify');
  console.log('');
  console.log('🌐 Variables requises sur Netlify:');
  console.log('- DATABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
