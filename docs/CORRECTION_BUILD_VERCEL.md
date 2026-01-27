# 🔧 Correction Erreur Build Vercel

## ❌ Erreur Rencontrée

```
Error: Command "npm run build" exited with 1
```

## 🔍 Causes Possibles

1. **Variables d'environnement manquantes**
2. **Erreurs TypeScript/ESLint**
3. **Imports manquants ou incorrects**
4. **Configuration Vercel incorrecte**

## ✅ Solutions

### 1. Vérifier les Variables d'Environnement

Assurez-vous que toutes les variables obligatoires sont configurées dans Vercel :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optionnel mais recommandé)
- `WHATSAPP_PHONE`

**Voir** : `docs/VARIABLES_VERCEL.md` pour la liste complète

### 2. Vérifier la Configuration Vercel

Dans Vercel Dashboard → Settings → General :

- **Framework Preset** : Next.js
- **Build Command** : `npm run build` (ou laisser vide pour auto-détection)
- **Output Directory** : `.next` (ou laisser vide pour auto-détection)
- **Install Command** : `npm install` (ou laisser vide pour auto-détection)

### 3. Vérifier le Fichier `vercel.json`

Si vous avez un fichier `vercel.json`, assurez-vous qu'il est correct :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

**OU** supprimez-le pour laisser Next.js auto-détecter la configuration.

### 4. Vérifier les Erreurs de Build Locales

Exécutez localement :

```bash
npm run build
```

Si des erreurs apparaissent, corrigez-les avant de redéployer.

### 5. Vérifier les Logs Vercel

Dans Vercel Dashboard → Deployments → Sélectionnez le déploiement → **View Function Logs**

Les logs détaillés vous indiqueront exactement où le build échoue.

### 6. Nettoyer le Cache Vercel

1. Allez dans **Settings** → **General**
2. Faites défiler jusqu'à **"Clear Build Cache"**
3. Cliquez sur **"Clear"**
4. Redéployez

### 7. Vérifier les Imports

Assurez-vous que tous les imports sont corrects :

```typescript
// ✅ Correct
import { AdminGuard } from '@/components/AdminGuard'

// ❌ Incorrect
import { AdminGuard } from '@/components/admin-guard' // casse sensible
```

### 8. Vérifier les Exports

Assurez-vous que tous les composants sont bien exportés :

```typescript
// ✅ Correct
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
}

// ❌ Incorrect (export manquant)
function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
}
```

## 🚀 Étapes de Dépannage

1. **Vérifier les variables d'environnement** dans Vercel
2. **Vérifier la configuration** dans Vercel Dashboard
3. **Tester le build localement** : `npm run build`
4. **Vérifier les logs** dans Vercel
5. **Nettoyer le cache** Vercel
6. **Redéployer** après corrections

## 📝 Checklist

- [ ] Variables d'environnement configurées dans Vercel
- [ ] Build local fonctionne (`npm run build`)
- [ ] Pas d'erreurs TypeScript (`npm run type-check`)
- [ ] Pas d'erreurs ESLint (`npm run lint`)
- [ ] Configuration Vercel correcte
- [ ] Cache Vercel nettoyé
- [ ] Logs Vercel vérifiés

## 🆘 Si le Problème Persiste

1. **Vérifiez les logs détaillés** dans Vercel
2. **Testez le build localement** et corrigez les erreurs
3. **Vérifiez que toutes les dépendances sont installées** : `npm install`
4. **Vérifiez la version de Node.js** dans Vercel (doit être 18+)

---

**Note** : Le fichier `next.config.js` a `ignoreBuildErrors: true` pour TypeScript et ESLint, donc les erreurs de build sont probablement liées à des imports manquants ou des variables d'environnement.
