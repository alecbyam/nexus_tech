/**
 * Script pour créer ou promouvoir un utilisateur en administrateur
 * Usage: node scripts/create-admin.js <email-utilisateur>
 * 
 * Exemple: node scripts/create-admin.js user@example.com
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function findUserByEmail(email) {
  // D'abord, trouver l'utilisateur dans auth.users via l'API admin
  // Note: Cela nécessite généralement le service_role_key
  // Pour l'instant, on va chercher dans les profils existants
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(100)

  if (error) {
    console.error('❌ Erreur:', error.message)
    return null
  }

  // On ne peut pas directement chercher par email dans profiles
  // Il faut utiliser l'ID utilisateur
  console.log('⚠️  Pour promouvoir un utilisateur en admin, vous avez deux options:')
  console.log('\nOption 1: Via Supabase Dashboard')
  console.log('  1. Allez dans Table Editor → profiles')
  console.log('  2. Trouvez l\'utilisateur par son ID')
  console.log('  3. Modifiez is_admin = true')
  console.log('  4. Sauvegardez\n')

  console.log('Option 2: Via SQL (dans Supabase SQL Editor)')
  console.log('  Exécutez cette requête en remplaçant USER_ID:')
  console.log('  UPDATE profiles SET is_admin = true WHERE id = \'USER_ID\';\n')

  return null
}

async function createAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.log('📝 Script de création d\'administrateur\n')
    console.log('Usage: node scripts/create-admin.js <email-utilisateur>\n')
    console.log('⚠️  Note: Ce script nécessite le service_role_key pour fonctionner complètement.')
    console.log('   Pour l\'instant, utilisez Supabase Dashboard:\n')
    console.log('   1. Authentication → Users → Trouvez l\'utilisateur')
    console.log('   2. Copiez l\'ID utilisateur')
    console.log('   3. Table Editor → profiles → Trouvez l\'utilisateur par ID')
    console.log('   4. Modifiez is_admin = true\n')
    
    await findUserByEmail('')
    rl.close()
    return
  }

  console.log(`🔍 Recherche de l'utilisateur: ${email}\n`)
  await findUserByEmail(email)
  rl.close()
}

createAdmin()
