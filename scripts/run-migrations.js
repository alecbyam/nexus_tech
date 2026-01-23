/**
 * Script pour exécuter toutes les migrations Supabase
 * 
 * Ce script lit et exécute les migrations SQL dans le bon ordre
 */

const fs = require('fs')
const path = require('path')

const migrations = [
  {
    name: 'Schéma principal',
    file: path.join(__dirname, '../supabase/schema.sql'),
    required: true
  },
  {
    name: 'Catégories',
    file: path.join(__dirname, '../supabase/categories-schema.sql'),
    required: false
  },
  {
    name: 'Prix de comparaison',
    file: path.join(__dirname, '../supabase/migrations/add_compare_at_price.sql'),
    required: false
  },
  {
    name: 'Intérêts utilisateurs',
    file: path.join(__dirname, '../supabase/migrations/add_user_interests.sql'),
    required: false
  },
  {
    name: 'Fonctionnalités recommandées',
    file: path.join(__dirname, '../supabase/migrations/add_recommended_features.sql'),
    required: false
  }
]

console.log('📋 Liste des migrations à exécuter :\n')
migrations.forEach((m, i) => {
  const exists = fs.existsSync(m.file)
  console.log(`${i + 1}. ${m.name} ${exists ? '✅' : '❌ (fichier introuvable)'}`)
  if (exists) {
    const content = fs.readFileSync(m.file, 'utf-8')
    const lines = content.split('\n').length
    console.log(`   └─ ${m.file}`)
    console.log(`   └─ ${lines} lignes`)
  }
})

console.log('\n⚠️  IMPORTANT :')
console.log('Ce script affiche uniquement les migrations.')
console.log('Pour exécuter les migrations :')
console.log('1. Ouvrez votre projet Supabase Dashboard')
console.log('2. Allez dans SQL Editor')
console.log('3. Exécutez les fichiers SQL dans cet ordre :\n')

migrations.forEach((m, i) => {
  if (fs.existsSync(m.file)) {
    console.log(`${i + 1}. ${m.name}`)
    console.log(`   Fichier: ${path.relative(process.cwd(), m.file)}`)
    console.log('')
  }
})

console.log('\n💡 Alternative : Utilisez FULL_MIGRATION.sql pour tout exécuter en une fois')
console.log(`   Fichier: ${path.relative(process.cwd(), path.join(__dirname, '../supabase/FULL_MIGRATION.sql'))}`)
