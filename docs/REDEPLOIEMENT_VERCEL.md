# Redéploiement sur Vercel - Guide Rapide

## 🚀 Redéploiement Automatique

Si votre projet est connecté à GitHub, Vercel redéploie automatiquement à chaque push sur la branche `main`.

### Vérification du Déploiement

1. **Allez sur Vercel Dashboard**
   - https://vercel.com/dashboard
   - Connectez-vous à votre compte

2. **Sélectionnez votre projet ONATECH**

3. **Vérifiez les déploiements**
   - Onglet "Deployments"
   - Le dernier déploiement devrait être en cours ou terminé
   - Statut : "Building" → "Ready"

4. **Vérifiez les logs**
   - Cliquez sur le dernier déploiement
   - Onglet "Build Logs" pour voir les détails

---

## 🔄 Redéploiement Manuel

Si le déploiement automatique ne se déclenche pas :

### Option 1 : Via Vercel Dashboard

1. **Allez sur votre projet**
   - https://vercel.com/dashboard
   - Sélectionnez le projet ONATECH

2. **Cliquez sur "Redeploy"**
   - Bouton "..." à côté du dernier déploiement
   - Sélectionnez "Redeploy"

3. **Confirmez**
   - Le redéploiement démarre immédiatement

### Option 2 : Via Vercel CLI

```bash
# Installer Vercel CLI (si pas déjà installé)
npm i -g vercel

# Se connecter
vercel login

# Redéployer
vercel --prod
```

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier que l'application fonctionne

- Ouvrez votre URL Vercel
- Vérifiez que la page d'accueil se charge
- Testez la connexion

### 2. Vérifier les nouvelles fonctionnalités

#### Paiement Mobile Money
- Allez sur `/cart`
- Vérifiez que le sélecteur de méthode de paiement apparaît
- Testez la sélection d'une méthode

#### Gestion Catégories
- Allez sur `/admin/categories`
- Vérifiez que vous pouvez voir les catégories
- Testez la création d'une catégorie

#### Page Admin Paiements
- Allez sur `/admin/payments`
- Vérifiez que la page se charge (vide si aucun paiement)

### 3. Vérifier les erreurs

- Console du navigateur (F12)
- Logs Vercel (Dashboard > Deployments > Logs)
- Vérifier les erreurs dans les logs de build

---

## 🔧 Variables d'Environnement

Assurez-vous que toutes les variables sont configurées dans Vercel :

### Variables Requises

1. **Supabase**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optionnel)

2. **WhatsApp**
   - `WHATSAPP_PHONE`

3. **SEO (Optionnel)**
   - `NEXT_PUBLIC_GOOGLE_VERIFICATION`
   - `NEXT_PUBLIC_BING_VERIFICATION`
   - `NEXT_PUBLIC_YANDEX_VERIFICATION`
   - etc.

### Comment Vérifier

1. **Vercel Dashboard** → Projet → Settings → Environment Variables
2. Vérifiez que toutes les variables sont présentes
3. Vérifiez qu'elles sont activées pour **Production**, **Preview**, et **Development**

---

## 🐛 Dépannage

### Le déploiement échoue

1. **Vérifiez les logs de build**
   - Dashboard Vercel → Deployments → Build Logs
   - Cherchez les erreurs en rouge

2. **Erreurs courantes :**
   - Variables d'environnement manquantes
   - Erreurs TypeScript
   - Erreurs de build Next.js

### L'application ne fonctionne pas après déploiement

1. **Vérifiez les logs runtime**
   - Dashboard Vercel → Deployments → Function Logs

2. **Vérifiez la console du navigateur**
   - F12 → Console
   - Cherchez les erreurs JavaScript

3. **Vérifiez les migrations SQL**
   - Assurez-vous que toutes les migrations sont exécutées dans Supabase

---

## 📋 Checklist de Déploiement

- [ ] Modifications poussées sur GitHub
- [ ] Déploiement automatique déclenché (ou redéploiement manuel)
- [ ] Build réussi (statut "Ready")
- [ ] Application accessible sur l'URL Vercel
- [ ] Page d'accueil fonctionne
- [ ] Connexion fonctionne
- [ ] Paiement mobile money visible dans le panier
- [ ] Gestion catégories fonctionne
- [ ] Page admin paiements accessible
- [ ] Aucune erreur dans la console

---

## 🎯 Prochaines Étapes

Après le déploiement réussi :

1. **Tester toutes les fonctionnalités**
2. **Exécuter les migrations SQL manquantes** (si nécessaire)
3. **Configurer les variables d'environnement** (si manquantes)
4. **Tester le paiement mobile money** (en mode simulation)
5. **Vérifier les performances** (temps de chargement)

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs Vercel
2. Vérifiez les logs Supabase
3. Vérifiez la console du navigateur
4. Consultez la documentation dans `docs/`

---

**Note :** Le redéploiement prend généralement 2-5 minutes. Surveillez le statut dans le dashboard Vercel.
