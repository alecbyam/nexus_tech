# 🔧 Dépannage - Modifications Non Visibles sur Vercel

## 🚨 Problème : Les modifications ne sont pas visibles sur Vercel

### ✅ Vérifications Préliminaires

1. **Vérifier que les modifications sont sur GitHub**
   ```bash
   git log --oneline -5
   git status
   ```
   - Les commits doivent être présents
   - Le working tree doit être propre

2. **Vérifier la branche**
   - Vercel déploie généralement la branche `main` ou `master`
   - Assurez-vous que vos modifications sont sur la bonne branche

---

## 🔄 Solution 1 : Forcer un Redéploiement via Vercel Dashboard

### Étapes Détaillées

1. **Connectez-vous à Vercel**
   - Allez sur https://vercel.com/dashboard
   - Connectez-vous avec votre compte

2. **Sélectionnez votre projet**
   - Cliquez sur le projet "ONATECH" ou "nexus_tech"

3. **Onglet "Deployments"**
   - Cliquez sur l'onglet "Deployments" en haut

4. **Forcer le redéploiement**
   - Trouvez le dernier déploiement
   - Cliquez sur les **trois points** (`...`) à droite
   - Sélectionnez **"Redeploy"**
   - Confirmez le redéploiement

5. **Attendre le build**
   - Le statut passera de "Queued" → "Building" → "Ready"
   - Temps estimé : 2-5 minutes

---

## 🔄 Solution 2 : Créer un Commit Vide pour Déclencher le Déploiement

Si le redéploiement manuel ne fonctionne pas, créez un commit vide :

```bash
# Créer un commit vide
git commit --allow-empty -m "chore: Force Vercel redeploy"

# Pousser sur GitHub
git push origin main
```

Cela déclenchera automatiquement un nouveau déploiement.

---

## 🔄 Solution 3 : Vérifier les Paramètres de Déploiement

### Vérifier la Configuration GitHub

1. **Vercel Dashboard** → Projet → Settings → Git
2. **Vérifiez que :**
   - Le repository GitHub est connecté
   - La branche de production est `main`
   - "Auto-deploy" est activé

### Vérifier les Webhooks GitHub

1. **GitHub** → Repository → Settings → Webhooks
2. **Vérifiez qu'un webhook Vercel existe :**
   - URL : `https://api.vercel.com/v1/integrations/deploy/...`
   - Événements : "Just the push event"

---

## 🔍 Solution 4 : Vérifier les Logs de Build

### Consulter les Logs

1. **Vercel Dashboard** → Projet → Deployments
2. **Cliquez sur le dernier déploiement**
3. **Onglet "Build Logs"**
4. **Cherchez les erreurs :**
   - Erreurs de build
   - Variables d'environnement manquantes
   - Erreurs TypeScript
   - Erreurs de dépendances

### Erreurs Courantes

#### ❌ "Build Failed"
- **Cause** : Erreur de compilation
- **Solution** : Vérifiez les logs pour identifier l'erreur

#### ❌ "Environment Variable Missing"
- **Cause** : Variable d'environnement non configurée
- **Solution** : Ajoutez la variable dans Settings → Environment Variables

#### ❌ "Module Not Found"
- **Cause** : Dépendance manquante
- **Solution** : Vérifiez que `package.json` contient toutes les dépendances

---

## 🔄 Solution 5 : Vider le Cache Vercel

### Vider le Cache de Build

1. **Vercel Dashboard** → Projet → Settings → General
2. **Scroll jusqu'à "Build & Development Settings"**
3. **Cliquez sur "Clear Build Cache"**
4. **Redéployez** (Solution 1)

### Vider le Cache du Navigateur

- **Chrome/Edge** : `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)
- **Firefox** : `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)
- **Safari** : `Cmd + Option + R`

---

## 🔄 Solution 6 : Vérifier les Variables d'Environnement

### Variables Requises

Assurez-vous que ces variables sont configurées dans Vercel :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key (optionnel)
WHATSAPP_PHONE=243818510311
```

### Comment Vérifier

1. **Vercel Dashboard** → Projet → Settings → Environment Variables
2. **Vérifiez que toutes les variables sont présentes**
3. **Vérifiez qu'elles sont activées pour :**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

---

## 🔄 Solution 7 : Utiliser Vercel CLI

### Installation

```bash
npm i -g vercel
```

### Connexion

```bash
vercel login
```

### Redéploiement

```bash
# Redéployer en production
vercel --prod

# Ou depuis le répertoire du projet
cd "C:\Users\MOISE BYAMUNGU\Desktop\MATRIX ROOM\Nexus Tech"
vercel --prod
```

---

## 🔍 Solution 8 : Vérifier le Fichier vercel.json

### Vérifier la Configuration

Le fichier `vercel.json` doit contenir :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### Si le fichier est incorrect

1. Corrigez le fichier
2. Commitez et poussez :
   ```bash
   git add vercel.json
   git commit -m "fix: Correction configuration Vercel"
   git push origin main
   ```

---

## 📋 Checklist de Dépannage

- [ ] Modifications poussées sur GitHub
- [ ] Branche correcte (`main`)
- [ ] Redéploiement forcé via Dashboard
- [ ] Logs de build vérifiés (pas d'erreurs)
- [ ] Variables d'environnement configurées
- [ ] Cache Vercel vidé
- [ ] Cache navigateur vidé
- [ ] Webhook GitHub vérifié
- [ ] Configuration `vercel.json` correcte

---

## 🆘 Si Rien Ne Fonctionne

### Contact Support Vercel

1. **Vercel Dashboard** → Help → Support
2. **Créez un ticket** avec :
   - URL du repository GitHub
   - URL du projet Vercel
   - Logs de build (copie)
   - Description du problème

### Informations à Fournir

- **Repository** : `alecbyam/nexus_tech`
- **Branche** : `main`
- **Dernier commit** : `git log --oneline -1`
- **Erreurs dans les logs** : (copiez les erreurs)

---

## ✅ Vérification Post-Déploiement

Après le redéploiement, vérifiez :

1. **URL de production** : L'application se charge
2. **Console navigateur** : Pas d'erreurs JavaScript
3. **Fonctionnalités** :
   - Page d'accueil fonctionne
   - Connexion fonctionne
   - Paiement mobile money visible
   - Gestion catégories accessible

---

**Note** : Le redéploiement prend généralement 2-5 minutes. Surveillez le statut dans le dashboard Vercel.
