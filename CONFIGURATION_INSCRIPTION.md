# ✅ Configuration Création Simple de Compte - Guide Étape par Étape

## 🎯 Objectif
Configurer la création de compte par email/mot de passe dans votre application NEXUS TECH.

---

## 📋 Étape 1 : Configuration Supabase Dashboard (5 minutes)

### 1.1 Ouvrir le Dashboard Supabase

1. Allez sur : [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous et sélectionnez votre projet **NEXUS TECH**

### 1.2 Configurer l'Authentification Email

1. **Dans le menu latéral**, cliquez sur **"Authentication"**
2. Cliquez sur **"Settings"** (ou l'icône ⚙️)

3. **Dans la section "Email Auth"**, configurez :

   ```
   ✅ Enable email signup          → ACTIVÉ (par défaut)
   ✅ Enable email confirmations   → ACTIVEZ (important !)
   ✅ Secure email change          → ACTIVÉ
   ✅ Double opt-in                → ACTIVÉ
   ```

4. **Dans la section "Site URL"** :

   - **Site URL** :
     ```
     http://localhost:3000
     ```

   - **Redirect URLs** (cliquez sur "Add URL" pour chaque ligne) :
     ```
     http://localhost:3000/**
     http://localhost:3000/auth/callback
     ```

5. **Cliquez sur "Save"** en bas de la page

### 1.3 Vérifier le Schéma de Base de Données

1. **Dans le menu latéral**, cliquez sur **"SQL Editor"**
2. **Vérifiez** que le script `supabase/schema.sql` a été exécuté
3. **Si non**, copiez le contenu du fichier `supabase/schema.sql` et exécutez-le

   > Le script crée automatiquement un profil utilisateur à chaque inscription

---

## 📧 Étape 2 : Personnaliser les Emails (Optionnel - 3 minutes)

### 2.1 Accéder aux Templates

1. **Settings** → **Auth** → **Email Templates**
2. Cliquez sur **"Confirm signup"**

### 2.2 Template Personnalisé

Remplacez le contenu par :

```html
<h2>Bienvenue sur NEXUS TECH ! 🎉</h2>

<p>Bonjour {{ .UserMetaData.full_name }},</p>

<p>Merci de vous être inscrit sur <strong>NEXUS TECH</strong>, votre destination tech de confiance.</p>

<p>Pour activer votre compte, cliquez sur le bouton ci-dessous :</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #0B5FFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
    Confirmer mon email
  </a>
</p>

<p>Ou copiez ce lien dans votre navigateur :</p>
<p style="word-break: break-all; color: #666; font-size: 12px;">{{ .ConfirmationURL }}</p>

<p><strong>⚠️ Ce lien expirera dans 24 heures.</strong></p>

<p>Si vous n'avez pas créé de compte, ignorez cet email.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

<p><strong>L'équipe NEXUS TECH</strong></p>
```

3. **Cliquez sur "Save"**

---

## ✅ Étape 3 : Vérifier la Configuration Locale

### 3.1 Vérifier les Variables d'Environnement

Vérifiez que le fichier `.env.local` existe et contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
```

> ⚠️ **Important** : Remplacez par vos vraies valeurs depuis Supabase Dashboard → Settings → API

### 3.2 Exécuter le Script de Vérification

```bash
node scripts/check-auth-config.js
```

Vous devriez voir :
```
✅ Variables d'environnement trouvées
✅ Tous les fichiers nécessaires sont présents
```

---

## 🧪 Étape 4 : Tester la Création de Compte

### 4.1 Démarrer l'Application

```bash
npm run dev
```

### 4.2 Tester l'Inscription

1. **Ouvrez votre navigateur** : `http://localhost:3000/auth/signup`

2. **Remplissez le formulaire** :
   - Nom complet (optionnel)
   - Email : utilisez un email valide que vous pouvez vérifier
   - Téléphone (optionnel)
   - Mot de passe : minimum 6 caractères
   - Confirmer le mot de passe

3. **Cliquez sur "Créer mon compte"**

4. **Vous devriez voir** :
   - ✅ Message de succès
   - 📧 Instructions pour vérifier votre email

### 4.3 Vérifier l'Email

1. **Ouvrez votre boîte de réception**
2. **Cherchez l'email de Supabase**
   - Expéditeur : `noreply@mail.app.supabase.io` ou similaire
   - ⚠️ **Vérifiez aussi le dossier SPAM**

3. **Cliquez sur le lien de confirmation** dans l'email

4. **Vous devriez être redirigé** vers l'application et connecté automatiquement

### 4.4 Vérifier dans Supabase

1. **Dashboard Supabase** → **Authentication** → **Users**
   - Vous devriez voir votre nouvel utilisateur
   - Statut : **"Confirmed"** (après confirmation email)

2. **Table Editor** → **profiles**
   - Vous devriez voir un profil avec votre ID utilisateur
   - Vérifiez que les données (nom, téléphone) sont bien enregistrées

---

## 🔧 Dépannage

### ❌ Email non reçu

**Solutions :**
1. Vérifiez le dossier **SPAM**
2. Attendez 2-3 minutes (les emails peuvent prendre du temps)
3. Vérifiez les logs : **Dashboard** → **Logs** → **Auth Logs**
4. Vérifiez que vous n'avez pas atteint la limite (3 emails/heure/utilisateur)

### ❌ Lien de confirmation ne fonctionne pas

**Solutions :**
1. Vérifiez que les **Redirect URLs** sont bien configurées dans Supabase
2. Vérifiez que l'URL dans l'email correspond à votre configuration
3. Le lien expire après 24h - créez un nouveau compte si nécessaire

### ❌ Erreur lors de l'inscription

**Solutions :**
1. Ouvrez la **console du navigateur** (F12) pour voir les erreurs
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez que le serveur Next.js est bien démarré
4. Vérifiez les logs dans **Supabase Dashboard** → **Logs**

### ❌ Profil non créé automatiquement

**Solutions :**
1. Vérifiez que le script SQL `supabase/schema.sql` a été exécuté
2. Vérifiez que le trigger `on_auth_user_created` existe
3. Ré-exécutez le script SQL si nécessaire

---

## ✅ Checklist Finale

- [ ] Email signup activé dans Supabase
- [ ] Email confirmations activé
- [ ] Site URL configurée (`http://localhost:3000`)
- [ ] Redirect URLs configurées
- [ ] Schéma SQL exécuté
- [ ] Variables d'environnement dans `.env.local`
- [ ] Test d'inscription réussi
- [ ] Email de confirmation reçu
- [ ] Compte activé après confirmation
- [ ] Profil créé automatiquement dans la base de données

---

## 🎉 C'est Terminé !

Votre création de compte simple est maintenant configurée et fonctionnelle !

**Prochaines étapes :**
- ✅ Testez plusieurs créations de compte
- ✅ Vérifiez que tout fonctionne correctement
- 📧 (Optionnel) Configurez un SMTP personnalisé pour plus d'emails
- 🔐 (Optionnel) Configurez Google OAuth pour une connexion plus rapide

---

## 📚 Documentation

- **Guide complet** : `docs/CONFIGURATION_COMPTE_SIMPLE.md`
- **Guide rapide** : `docs/GUIDE_INSCRIPTION_SIMPLE.md`
- **Documentation Supabase** : [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)

---

**Besoin d'aide ?** Consultez les guides dans le dossier `docs/`
