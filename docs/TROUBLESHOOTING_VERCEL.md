# 🔧 Dépannage - Modifications Non Visibles sur Vercel

## ✅ Vérifications Immédiates

### 1. Vérifier que le Push GitHub a Réussi

```bash
git log --oneline -3
```

Vous devriez voir le dernier commit : `chore: Force Vercel redeploy`

### 2. Vérifier le Dashboard Vercel

1. **Allez sur** : https://vercel.com/dashboard
2. **Sélectionnez votre projet** ONATECH
3. **Onglet "Deployments"**
4. **Vérifiez le dernier déploiement** :
   - ✅ **"Ready"** = Déploiement réussi
   - ⏳ **"Building"** = En cours (attendre 2-5 min)
   - ❌ **"Error"** = Échec (voir les logs)

### 3. Vérifier les Logs de Build

Si le déploiement a échoué :

1. **Cliquez sur le déploiement en erreur**
2. **Onglet "Build Logs"**
3. **Cherchez les erreurs** (lignes en rouge)

**Erreurs courantes :**
- Variables d'environnement manquantes
- Erreurs TypeScript
- Erreurs de dépendances

---

## 🔄 Solutions Rapides

### Solution 1 : Redéployer Manuellement

1. **Vercel Dashboard** → Projet → Deployments
2. **Cliquez sur "..."** à côté du dernier déploiement
3. **Sélectionnez "Redeploy"**
4. **Attendez 2-5 minutes**

### Solution 2 : Vérifier les Variables d'Environnement

1. **Vercel Dashboard** → Projet → Settings → Environment Variables
2. **Vérifiez que ces variables existent** :
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   WHATSAPP_PHONE
   ```
3. **Vérifiez qu'elles sont activées pour** :
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Solution 3 : Invalider le Cache

Si les modifications ne s'affichent pas après un déploiement réussi :

1. **Vercel Dashboard** → Projet → Settings → General
2. **Scroll jusqu'à "Build & Development Settings"**
3. **Cliquez sur "Clear Build Cache"**
4. **Redéployez**

### Solution 4 : Vérifier la Branche

Assurez-vous que Vercel déploie la bonne branche :

1. **Vercel Dashboard** → Projet → Settings → Git
2. **Vérifiez "Production Branch"** = `main`
3. **Vérifiez que les commits sont sur `main`**

---

## 🐛 Problèmes Spécifiques

### Les Catégories Ne S'affichent Pas

**Vérifications :**
1. **Vérifiez que la migration SQL est exécutée** dans Supabase
2. **Vérifiez les logs runtime** (Vercel → Deployments → Function Logs)
3. **Vérifiez la console du navigateur** (F12 → Console)

**Solution :**
- Exécutez la migration `categories-schema.sql` dans Supabase
- Vérifiez que la table `categories` existe avec les colonnes `slug`, `description`, `icon`

### Le Paiement Mobile Money Ne S'affiche Pas

**Vérifications :**
1. **Vérifiez que la migration est exécutée** (`ADD_MOBILE_MONEY_PAYMENT.sql`)
2. **Vérifiez que la table `payments` existe** dans Supabase
3. **Vérifiez les logs de build** pour des erreurs TypeScript

**Solution :**
- Exécutez la migration dans Supabase
- Vérifiez que le composant `PaymentMethodSelector` est bien importé

### Erreur "Module not found"

**Cause :** Fichier manquant ou import incorrect

**Solution :**
1. **Vérifiez les logs de build** pour voir quel fichier manque
2. **Vérifiez que tous les fichiers sont commités** :
   ```bash
   git status
   ```
3. **Vérifiez les imports** dans les fichiers modifiés

---

## 📋 Checklist de Dépannage

- [ ] Push GitHub réussi (dernier commit visible)
- [ ] Déploiement Vercel en cours ou terminé
- [ ] Statut du déploiement = "Ready" (pas "Error")
- [ ] Variables d'environnement configurées
- [ ] Migrations SQL exécutées dans Supabase
- [ ] Cache Vercel invalidé (si nécessaire)
- [ ] Console du navigateur sans erreurs
- [ ] Logs Vercel sans erreurs

---

## 🔍 Vérifications Avancées

### Vérifier les Fichiers Déployés

1. **Vercel Dashboard** → Projet → Deployments
2. **Cliquez sur un déploiement**
3. **Onglet "Source"** → Vérifiez le commit déployé
4. **Comparez avec GitHub** pour vérifier que c'est le bon commit

### Vérifier les Erreurs Runtime

1. **Vercel Dashboard** → Projet → Deployments
2. **Cliquez sur un déploiement**
3. **Onglet "Function Logs"**
4. **Cherchez les erreurs** lors de l'exécution

### Vérifier le Cache du Navigateur

Parfois le navigateur cache l'ancienne version :

1. **Ouvrez en navigation privée** (Ctrl+Shift+N)
2. **Ou videz le cache** (Ctrl+Shift+Delete)
3. **Rechargez la page** (Ctrl+F5)

---

## 🚨 Si Rien Ne Fonctionne

1. **Vérifiez les logs complets** dans Vercel
2. **Vérifiez les logs Supabase** (Dashboard → Logs)
3. **Vérifiez la console du navigateur** (F12)
4. **Contactez le support Vercel** si nécessaire

---

## 📞 Commandes Utiles

```bash
# Vérifier l'état Git
git status
git log --oneline -5

# Vérifier les fichiers modifiés
git diff HEAD~1

# Forcer un nouveau commit
git commit --allow-empty -m "chore: Force redeploy"
git push origin main
```

---

**Note :** Après chaque modification, attendez 2-5 minutes pour que Vercel termine le déploiement avant de vérifier.
