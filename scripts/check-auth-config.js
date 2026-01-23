/**
 * Script de vérification de la configuration d'authentification
 * Exécutez avec: node scripts/check-auth-config.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Vérification de la configuration d\'authentification...\n')

// Vérifier les variables d'environnement
console.log('1. Vérification des variables d\'environnement...')
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL')
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('   ✅ Variables d\'environnement trouvées\n')
  } else {
    console.log('   ⚠️  Variables d\'environnement incomplètes\n')
    console.log('   Créez un fichier .env.local avec:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key\n')
  }
} else {
  console.log('   ❌ Fichier .env.local non trouvé\n')
  console.log('   Créez un fichier .env.local à la racine du projet\n')
}

// Vérifier les fichiers nécessaires
console.log('2. Vérification des fichiers...')
const filesToCheck = [
  'app/auth/signup/page.tsx',
  'app/auth/page.tsx',
  'app/auth/callback/route.ts',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'supabase/schema.sql',
]

let allFilesExist = true
filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MANQUANT`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n   ✅ Tous les fichiers nécessaires sont présents\n')
} else {
  console.log('\n   ⚠️  Certains fichiers sont manquants\n')
}

// Instructions
console.log('3. Prochaines étapes dans Supabase Dashboard:\n')
console.log('   📍 Authentication → Settings')
console.log('   ✅ Activer "Enable email signup"')
console.log('   ✅ Activer "Enable email confirmations"')
console.log('   📝 Configurer Site URL: http://localhost:3000')
console.log('   📝 Ajouter Redirect URLs: http://localhost:3000/**')
console.log('   💾 Sauvegarder\n')

console.log('   📍 SQL Editor')
console.log('   ✅ Exécuter le script: supabase/schema.sql\n')

console.log('   📍 Settings → Auth → Email Templates')
console.log('   📝 Personnaliser les templates (optionnel)\n')

console.log('4. Test:\n')
console.log('   🚀 Démarrer: npm run dev')
console.log('   🌐 Ouvrir: http://localhost:3000/auth/signup')
console.log('   ✉️  Vérifier l\'email de confirmation\n')

console.log('✅ Vérification terminée!\n')
