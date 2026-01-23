/**
 * Script de diagnostic pour vérifier les erreurs potentielles
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Vérification des erreurs potentielles...\n')

// Vérifier les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Fichier .env.local non trouvé')
} else {
  const envContent = fs.readFileSync(envPath, 'utf8')
  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL manquant dans .env.local')
  }
  if (!envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY manquant dans .env.local')
  }
  console.log('✅ Variables d\'environnement présentes')
}

// Vérifier les fichiers critiques
const criticalFiles = [
  'app/page.tsx',
  'app/layout.tsx',
  'lib/supabase/server.ts',
  'lib/supabase/client.ts',
  'lib/services/categories.ts',
  'components/header.tsx',
  'components/providers.tsx',
]

let allFilesExist = true
criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file)
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Fichier manquant: ${file}`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('✅ Tous les fichiers critiques existent')
}

console.log('\n✅ Diagnostic terminé')
console.log('\n💡 Pour voir les erreurs exactes, vérifiez:')
console.log('   1. Les logs du terminal où npm run dev est exécuté')
console.log('   2. La console du navigateur (F12)')
console.log('   3. L\'onglet Network dans les DevTools')
