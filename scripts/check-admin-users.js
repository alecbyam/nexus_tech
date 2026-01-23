/**
 * Script pour vérifier les comptes administrateurs
 * Exécutez avec: node scripts/check-admin-users.js
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Assurez-vous que .env.local contient:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminUsers() {
  console.log('🔍 Vérification des comptes administrateurs...\n')

  try {
    // Récupérer tous les profils avec is_admin = true
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, is_admin, created_at')
      .eq('is_admin', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur lors de la récupération:', error.message)
      return
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  Aucun compte administrateur trouvé!\n')
      console.log('📝 Pour créer un compte admin:')
      console.log('   1. Créez un compte utilisateur normal')
      console.log('   2. Dans Supabase Dashboard → Table Editor → profiles')
      console.log('   3. Trouvez votre utilisateur et mettez is_admin = true')
      console.log('   4. Ou utilisez le script: node scripts/create-admin.js\n')
      return
    }

    console.log(`✅ ${admins.length} compte(s) administrateur trouvé(s):\n`)

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Administrateur:`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   Nom: ${admin.full_name || 'Non renseigné'}`)
      console.log(`   Téléphone: ${admin.phone || 'Non renseigné'}`)
      console.log(`   Créé le: ${new Date(admin.created_at).toLocaleString('fr-FR')}`)
      console.log('')
    })

    // Récupérer aussi le total d'utilisateurs
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })

    if (!usersError && allUsers) {
      console.log(`📊 Statistiques:`)
      console.log(`   Total utilisateurs: ${allUsers.length}`)
      console.log(`   Administrateurs: ${admins.length}`)
      console.log(`   Utilisateurs réguliers: ${allUsers.length - admins.length}\n`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

checkAdminUsers()
