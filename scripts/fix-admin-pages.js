// Script pour vérifier que toutes les pages admin utilisent AdminGuard
// Ce script liste les fichiers qui doivent être corrigés

const filesToFix = [
  'app/admin/stats/page.tsx',
  'app/admin/interests/page.tsx',
  'app/admin/coupons/page.tsx',
  'app/admin/users/stats/page.tsx',
  'app/admin/users/[id]/page.tsx',
  'app/admin/orders/[id]/page.tsx',
  'app/admin/products/[id]/page.tsx',
]

console.log('Pages à corriger pour utiliser AdminGuard:')
filesToFix.forEach(file => console.log(`- ${file}`))
