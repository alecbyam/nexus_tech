/**
 * Script pour exécuter la migration du paiement mobile money
 * Usage: node scripts/run-mobile-money-migration.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration() {
  console.log('🚀 Démarrage de la migration du paiement mobile money...\n')

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'ADD_MOBILE_MONEY_PAYMENT.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    console.log('📄 Lecture du fichier SQL...')
    console.log(`   Fichier: ${sqlPath}`)
    console.log(`   Taille: ${sql.length} caractères\n`)

    // Exécuter la migration via l'API REST Supabase
    // Note: Supabase ne fournit pas d'API directe pour exécuter du SQL arbitraire
    // Il faut utiliser le dashboard ou l'API de gestion
    
    console.log('⚠️  Note importante:')
    console.log('   L\'exécution de SQL via l\'API nécessite des permissions spéciales.')
    console.log('   Pour exécuter cette migration, vous avez deux options:\n')
    
    console.log('📋 OPTION 1 - Via Supabase Dashboard (Recommandé):')
    console.log('   1. Allez sur https://supabase.com/dashboard')
    console.log('   2. Sélectionnez votre projet')
    console.log('   3. Allez dans "SQL Editor"')
    console.log('   4. Copiez-collez le contenu de: supabase/ADD_MOBILE_MONEY_PAYMENT.sql')
    console.log('   5. Cliquez sur "Run"\n')
    
    console.log('📋 OPTION 2 - Via CLI Supabase:')
    console.log('   1. Installez Supabase CLI: npm install -g supabase')
    console.log('   2. Connectez-vous: supabase login')
    console.log('   3. Lien votre projet: supabase link --project-ref YOUR_PROJECT_REF')
    console.log('   4. Exécutez: supabase db push\n')

    // Vérifier si la table existe déjà
    console.log('🔍 Vérification de l\'état actuel...\n')
    
    const { data: tables, error: tablesError } = await supabase
      .from('payments')
      .select('id')
      .limit(1)

    if (tablesError) {
      if (tablesError.code === '42P01') {
        console.log('✅ La table "payments" n\'existe pas encore.')
        console.log('   La migration doit être exécutée.\n')
      } else {
        console.error('❌ Erreur lors de la vérification:', tablesError.message)
      }
    } else {
      console.log('⚠️  La table "payments" existe déjà.')
      console.log('   Si vous voulez la recréer, supprimez-la d\'abord.\n')
    }

    // Afficher le contenu SQL pour faciliter la copie
    console.log('📝 Contenu SQL à exécuter:\n')
    console.log('─'.repeat(80))
    console.log(sql)
    console.log('─'.repeat(80))
    console.log('\n✅ Script terminé. Suivez les instructions ci-dessus pour exécuter la migration.')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

runMigration()
