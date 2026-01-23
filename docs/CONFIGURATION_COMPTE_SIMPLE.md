# Configuration - Création Simple de Compte (Email/Mot de passe)

Ce guide vous explique comment configurer la création de compte simple avec email et mot de passe dans Supabase.

## 📋 Prérequis

- Un projet Supabase créé
- Accès au Dashboard Supabase
- L'application Next.js configurée avec les variables d'environnement

---

## 🚀 Étape 1 : Vérifier la Configuration Supabase

### 1.1 Accéder aux Paramètres d'Authentification

1. **Ouvrez le Dashboard Supabase**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet `NEXUS TECH`

2. **Naviguez vers Authentication**
   - Dans le menu latéral, cliquez sur **"Authentication"**
   - Puis cliquez sur **"Settings"** (ou **"Paramètres"**)

### 1.2 Activer l'Authentification par Email

Dans la section **"Email Auth"**, vérifiez que :

- ✅ **Enable email signup** : Activé (par défaut)
- ✅ **Enable email confirmations** : **ACTIVEZ** (recommandé pour la sécurité)
- ✅ **Secure email change** : Activé
- ✅ **Double opt-in** : Activé (pour la sécurité)

### 1.3 Configurer les URLs de Redirection

Dans la section **"Site URL"** :

1. **Site URL** (URL principale) :
   ```
   http://localhost:3000
   ```
   > Pour la production, remplacez par votre domaine : `https://votre-domaine.com`

2. **Redirect URLs** (URLs autorisées pour les redirections) :
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   https://votre-domaine.com/**
   https://votre-domaine.com/auth/callback
   ```
   > Ajoutez toutes les URLs où vous voulez rediriger après authentification

3. **Cliquez sur "Save"** pour enregistrer

---

## 📧 Étape 2 : Configurer les Emails (Service par Défaut)

### 2.1 Utiliser le Service Email de Supabase (Gratuit)

Par défaut, Supabase envoie les emails automatiquement. **Aucune configuration supplémentaire n'est nécessaire** pour commencer.

**Limites du service gratuit :**
- 3 emails par heure par utilisateur
- Parfait pour le développement et les petits projets

### 2.2 Personnaliser les Templates d'Email (Optionnel mais Recommandé)

1. **Accéder aux Templates**
   - Dans le Dashboard, allez dans **"Settings"** > **"Auth"**
   - Faites défiler jusqu'à **"Email Templates"**

2. **Personnaliser le Template "Confirm signup"**

   Cliquez sur **"Confirm signup"** et remplacez le contenu par :

   ```html
   <h2>Bienvenue sur NEXUS TECH ! 🎉</h2>

   <p>Bonjour {{ .UserMetaData.full_name }},</p>

   <p>Merci de vous être inscrit sur <strong>NEXUS TECH</strong>, votre destination tech de confiance.</p>

   <p>Pour activer votre compte et commencer à faire vos achats, veuillez cliquer sur le lien ci-dessous :</p>

   <p style="text-align: center; margin: 30px 0;">
     <a href="{{ .ConfirmationURL }}" style="background-color: #0B5FFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
       Confirmer mon email
     </a>
   </p>

   <p>Ou copiez-collez ce lien dans votre navigateur :</p>
   <p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

   <p><strong>⚠️ Important :</strong> Ce lien expirera dans 24 heures.</p>

   <p>Si vous n'avez pas créé de compte sur NEXUS TECH, vous pouvez ignorer cet email en toute sécurité.</p>

   <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

   <p><strong>L'équipe NEXUS TECH</strong></p>
   <p>📧 support@nexustech.com</p>
   <p>🌐 www.nexustech.com</p>
   ```

3. **Personnaliser le Template "Magic Link"** (Optionnel)

   ```html
   <h2>Connexion à NEXUS TECH 🔐</h2>

   <p>Bonjour,</p>

   <p>Vous avez demandé un lien de connexion pour votre compte NEXUS TECH.</p>

   <p style="text-align: center; margin: 30px 0;">
     <a href="{{ .ConfirmationURL }}" style="background-color: #0B5FFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
       Se connecter
     </a>
   </p>

   <p>Ce lien expirera dans 1 heure.</p>

   <p>Si vous n'avez pas demandé ce lien, ignorez cet email.</p>

   <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

   <p><strong>L'équipe NEXUS TECH</strong></p>
   ```

4. **Personnaliser le Template "Reset Password"**

   ```html
   <h2>Réinitialisation de votre mot de passe 🔑</h2>

   <p>Bonjour,</p>

   <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte NEXUS TECH.</p>

   <p style="text-align: center; margin: 30px 0;">
     <a href="{{ .ConfirmationURL }}" style="background-color: #0B5FFF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
       Réinitialiser mon mot de passe
     </a>
   </p>

   <p>Ou copiez-collez ce lien :</p>
   <p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

   <p><strong>⚠️ Important :</strong> Ce lien expirera dans 1 heure.</p>

   <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.</p>

   <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

   <p><strong>L'équipe NEXUS TECH</strong></p>
   ```

5. **Cliquez sur "Save"** après chaque modification

---

## ✅ Étape 3 : Vérifier la Configuration de l'Application

### 3.1 Vérifier les Variables d'Environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
```

> ⚠️ Remplacez par vos vraies valeurs depuis Supabase Dashboard > Settings > API

### 3.2 Vérifier que le Schéma de Base de Données est Créé

Le trigger pour créer automatiquement un profil doit être actif. Vérifiez dans Supabase :

1. Allez dans **"SQL Editor"**
2. Exécutez le script `supabase/schema.sql` si ce n'est pas déjà fait
3. Vérifiez que la fonction `handle_new_user()` existe

---

## 🧪 Étape 4 : Tester la Création de Compte

### 4.1 Test Manuel

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Accéder à la page d'inscription**
   - Ouvrez votre navigateur : `http://localhost:3000/auth/signup`

3. **Remplir le formulaire**
   - Nom complet (optionnel)
   - Email valide
   - Téléphone (optionnel)
   - Mot de passe (minimum 6 caractères)
   - Confirmer le mot de passe

4. **Soumettre le formulaire**
   - Cliquez sur "Créer mon compte"
   - Vous devriez voir un message de succès

5. **Vérifier l'email**
   - Ouvrez votre boîte de réception
   - Cherchez l'email de confirmation de Supabase
   - ⚠️ **Vérifiez aussi le dossier SPAM**

6. **Confirmer l'email**
   - Cliquez sur le lien dans l'email
   - Vous devriez être redirigé vers l'application
   - Votre compte devrait être activé

### 4.2 Vérifier dans Supabase Dashboard

1. **Vérifier l'utilisateur créé**
   - Allez dans **"Authentication"** > **"Users"**
   - Vous devriez voir le nouvel utilisateur
   - Le statut devrait être "Confirmed" après confirmation de l'email

2. **Vérifier le profil créé**
   - Allez dans **"Table Editor"** > **"profiles"**
   - Vous devriez voir un profil avec l'ID de l'utilisateur
   - Vérifiez que les données (nom, téléphone) sont bien enregistrées

---

## 🔧 Dépannage

### Problème : L'email de confirmation n'est pas reçu

**Solutions :**
1. Vérifiez le dossier **SPAM**
2. Attendez quelques minutes (les emails peuvent prendre du temps)
3. Vérifiez dans Supabase Dashboard > **"Logs"** > **"Auth Logs"** pour voir si l'email a été envoyé
4. Vérifiez que l'email n'est pas dans la limite (3/heure/utilisateur)

### Problème : Le lien de confirmation ne fonctionne pas

**Solutions :**
1. Vérifiez que les **Redirect URLs** sont bien configurées dans Supabase
2. Vérifiez que l'URL dans l'email correspond à votre configuration
3. Le lien expire après 24h - demandez un nouvel email si nécessaire

### Problème : Le profil n'est pas créé automatiquement

**Solutions :**
1. Vérifiez que le trigger `on_auth_user_created` existe dans la base de données
2. Exécutez à nouveau le script SQL `supabase/schema.sql`
3. Vérifiez les logs dans Supabase Dashboard > **"Logs"**

### Problème : Erreur lors de l'inscription

**Solutions :**
1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que les variables d'environnement sont correctes
3. Vérifiez que le serveur Next.js est bien démarré
4. Vérifiez les logs dans Supabase Dashboard

---

## 📝 Checklist de Configuration

- [ ] Email signup activé dans Supabase
- [ ] Email confirmations activé
- [ ] Site URL configurée (`http://localhost:3000`)
- [ ] Redirect URLs configurées
- [ ] Templates d'email personnalisés (optionnel)
- [ ] Variables d'environnement configurées
- [ ] Schéma de base de données créé
- [ ] Trigger `handle_new_user` actif
- [ ] Test d'inscription réussi
- [ ] Email de confirmation reçu
- [ ] Compte activé après confirmation

---

## 🎯 Prochaines Étapes

Une fois la création simple de compte configurée :

1. ✅ Testez plusieurs créations de compte
2. ✅ Vérifiez que les profils sont bien créés
3. ✅ Testez la connexion avec les comptes créés
4. 📧 (Optionnel) Configurez un service SMTP personnalisé pour plus d'emails
5. 🔐 (Optionnel) Configurez Google OAuth pour une connexion plus rapide

---

## 📞 Support

- **Documentation Supabase Auth** : [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **Dashboard Supabase** : [https://supabase.com/dashboard](https://supabase.com/dashboard)

---

**Dernière mise à jour** : 2024
