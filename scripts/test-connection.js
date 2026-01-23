/**
 * Script pour tester la connexion Supabase
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Test de connexion Supabase...\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Vérifiez que .env.local contient:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('✅ Variables d\'environnement trouvées')
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Connexion de base
    console.log('📡 Test 1: Connexion de base...')
    const { data: health, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0)
    
    if (healthError && healthError.code !== 'PGRST116') {
      throw healthError
    }
    console.log('   ✅ Connexion réussie\n')

    // Test 2: Vérifier les tables principales
    console.log('📊 Test 2: Vérification des tables...')
    const tables = [
      'profiles',
      'categories',
      'products',
      'orders',
      'order_items',
      'product_images'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(0)
        if (error && error.code !== 'PGRST116') {
          console.log(`   ⚠️  Table ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ Table ${table}: OK`)
        }
      } catch (err) {
        console.log(`   ❌ Table ${table}: ${err.message}`)
      }
    }
    console.log('')

    // Test 3: Vérifier les tables avancées
    console.log('🔧 Test 3: Vérification des fonctionnalités avancées...')
    const advancedTables = [
      'wishlists',
      'product_reviews',
      'stock_notifications',
      'coupons',
      'loyalty_points',
      'browsing_history',
      'product_views',
      'search_queries'
    ]

    for (const table of advancedTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(0)
        if (error && error.code !== 'PGRST116') {
          console.log(`   ⚠️  Table ${table}: ${error.message}`)
        } else {
          console.log(`   ✅ Table ${table}: OK`)
        }
      } catch (err) {
        console.log(`   ⚠️  Table ${table}: Non disponible (optionnel)`)
      }
    }
    console.log('')

    // Test 4: Vérifier le storage
    console.log('💾 Test 4: Vérification du storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.log(`   ⚠️  Storage: ${bucketsError.message}`)
    } else {
      const productImagesBucket = buckets.find(b => b.id === 'product-images')
      if (productImagesBucket) {
        console.log('   ✅ Bucket product-images: OK')
      } else {
        console.log('   ⚠️  Bucket product-images: Non trouvé')
      }
    }
    console.log('')

    console.log('✅ Tous les tests terminés!\n')
    console.log('🎉 La connexion Supabase fonctionne correctement.')
    console.log('   Vous pouvez maintenant lancer l\'application avec: npm run dev\n')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.error('\n💡 Vérifiez:')
    console.error('   1. Que les variables d\'environnement sont correctes')
    console.error('   2. Que la migration SQL a été exécutée dans Supabase')
    console.error('   3. Que votre projet Supabase est actif')
    process.exit(1)
  }
}

testConnection()
