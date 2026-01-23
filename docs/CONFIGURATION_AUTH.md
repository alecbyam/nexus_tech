# Guide de Configuration - Authentification Supabase

Ce guide vous explique comment configurer l'authentification Google OAuth et les emails de confirmation dans Supabase pour l'application NEXUS TECH.

## 📋 Table des matières

1. [Configuration Google OAuth](#1-configuration-google-oauth)
2. [Configuration des Emails de Confirmation](#2-configuration-des-emails-de-confirmation)
3. [Configuration GitHub OAuth (Bonus)](#3-configuration-github-oauth-bonus)
4. [Vérification et Tests](#4-vérification-et-tests)

---

## 1. Configuration Google OAuth

### Étape 1 : Créer un projet Google Cloud Console

1. **Accéder à Google Cloud Console**
   - Allez sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Connectez-vous avec votre compte Google

2. **Créer un nouveau projet**
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur "Nouveau projet"
   - Nom du projet : `Nexus Tech` (ou un nom de votre choix)
   - Cliquez sur "Créer"

3. **Activer l'API Google+**
   - Dans le menu latéral, allez dans "APIs & Services" > "Bibliothèque"
   - Recherchez "Google+ API"
   - Cliquez sur "Activer"

### Étape 2 : Configurer l'écran de consentement OAuth

1. **Accéder à l'écran de consentement**
   - Allez dans "APIs & Services" > "Écran de consentement OAuth"
   - Sélectionnez "Externe" (pour les tests) ou "Interne" (si vous avez Google Workspace)
   - Cliquez sur "Créer"

2. **Remplir les informations**
   - **Nom de l'application** : `NEXUS TECH`
   - **Email de support utilisateur** : Votre email
   - **Logo** : (Optionnel) Téléchargez le logo de votre application
   - **Domaine de l'application** : Votre domaine (ex: `nexustech.com`)
   - **Email du développeur** : Votre email
   - Cliquez sur "Enregistrer et continuer"

3. **Configurer les scopes**
   - Cliquez sur "Ajouter ou supprimer des scopes"
   - Sélectionnez les scopes suivants :
     - `email`
     - `profile`
     - `openid`
   - Cliquez sur "Mettre à jour" puis "Enregistrer et continuer"

4. **Ajouter les utilisateurs de test** (si externe)
   - Ajoutez les emails des utilisateurs qui pourront tester
   - Cliquez sur "Enregistrer et continuer"
   - Passez l'étape "Résumé" en cliquant sur "Retour au tableau de bord"

### Étape 3 : Créer les identifiants OAuth

1. **Créer les identifiants**
   - Allez dans "APIs & Services" > "Identifiants"
   - Cliquez sur "Créer des identifiants" > "ID client OAuth"

2. **Configurer l'ID client OAuth**
   - **Type d'application** : Application Web
   - **Nom** : `NEXUS TECH Web Client`
   - **URI de redirection autorisés** :
     ```
     https://njgmuhrkbwdeijnbqync.supabase.co/auth/v1/callback
     ```
     > ⚠️ **Important** : Remplacez `njgmuhrkbwdeijnbqync` par votre ID de projet Supabase
   - Cliquez sur "Créer"

3. **Copier les identifiants**
   - Vous verrez apparaître :
     - **ID client** : `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
     - **Secret client** : `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Copiez ces deux valeurs** - vous en aurez besoin pour Supabase

### Étape 4 : Configurer Google OAuth dans Supabase

1. **Accéder au Dashboard Supabase**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet `NEXUS TECH`

2. **Configurer le provider Google**
   - Allez dans "Authentication" > "Providers"
   - Trouvez "Google" dans la liste
   - Activez le toggle "Enable Google provider"

3. **Remplir les identifiants**
   - **Client ID (for OAuth)** : Collez l'ID client de Google
   - **Client Secret (for OAuth)** : Collez le secret client de Google
   - Cliquez sur "Save"

4. **Vérifier la configuration**
   - Le statut devrait passer à "Enabled" (vert)
   - Un message de confirmation devrait apparaître

### ✅ Vérification Google OAuth

1. Testez la connexion :
   - Allez sur votre application : `http://localhost:3000/auth`
   - Cliquez sur "Continue with Google"
   - Vous devriez être redirigé vers Google pour autoriser
   - Après autorisation, vous serez redirigé vers votre application

---

## 2. Configuration des Emails de Confirmation

### Étape 1 : Configurer SMTP dans Supabase

1. **Accéder aux paramètres d'email**
   - Dans le Dashboard Supabase, allez dans "Settings" > "Auth"
   - Faites défiler jusqu'à "SMTP Settings"

2. **Options de configuration SMTP**

   **Option A : Utiliser le service email par défaut de Supabase (Recommandé pour débuter)**
   - Supabase envoie les emails automatiquement
   - Limite : 3 emails par heure par utilisateur
   - Aucune configuration supplémentaire nécessaire

   **Option B : Configurer un service SMTP personnalisé (Recommandé pour production)**

   **Avec Gmail (Gratuit) :**
   - **SMTP Host** : `smtp.gmail.com`
   - **SMTP Port** : `587`
   - **SMTP User** : Votre adresse Gmail
   - **SMTP Password** : 
     - Générez un "Mot de passe d'application" dans votre compte Google
     - Allez dans [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
     - Créez un mot de passe pour "Mail"
     - Utilisez ce mot de passe (16 caractères)
   - **Sender Email** : Votre adresse Gmail
   - **Sender Name** : `NEXUS TECH`

   **Avec SendGrid (Recommandé pour production) :**
   - Créez un compte sur [https://sendgrid.com/](https://sendgrid.com/)
   - Générez une API Key
   - **SMTP Host** : `smtp.sendgrid.net`
   - **SMTP Port** : `587`
   - **SMTP User** : `apikey`
   - **SMTP Password** : Votre API Key SendGrid
   - **Sender Email** : Email vérifié dans SendGrid
   - **Sender Name** : `NEXUS TECH`

   **Avec Mailgun (Alternative) :**
   - Créez un compte sur [https://www.mailgun.com/](https://www.mailgun.com/)
   - **SMTP Host** : `smtp.mailgun.org`
   - **SMTP Port** : `587`
   - **SMTP User** : Votre nom d'utilisateur Mailgun
   - **SMTP Password** : Votre mot de passe Mailgun
   - **Sender Email** : Email vérifié dans Mailgun

3. **Sauvegarder la configuration**
   - Cliquez sur "Save" après avoir rempli les champs
   - Testez l'envoi d'un email de test

### Étape 2 : Personnaliser les templates d'email

1. **Accéder aux templates**
   - Dans "Settings" > "Auth" > "Email Templates"
   - Vous verrez plusieurs templates :
     - **Confirm signup** : Email de confirmation d'inscription
     - **Magic Link** : Lien magique de connexion
     - **Change Email Address** : Changement d'email
     - **Reset Password** : Réinitialisation de mot de passe

2. **Personnaliser le template "Confirm signup"**

   Cliquez sur "Confirm signup" et remplacez le contenu par :

   ```html
   <h2>Bienvenue sur NEXUS TECH ! 🎉</h2>

   <p>Bonjour {{ .UserMetaData.full_name }},</p>

   <p>Merci de vous être inscrit sur NEXUS TECH, votre destination tech de confiance.</p>

   <p>Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>

   <p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>

   <p>Ou copiez-collez ce lien dans votre navigateur :</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>Ce lien expirera dans 24 heures.</p>

   <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>

   <hr>

   <p><strong>L'équipe NEXUS TECH</strong></p>
   <p>📧 support@nexustech.com</p>
   <p>🌐 www.nexustech.com</p>
   ```

3. **Personnaliser le template "Magic Link"**

   ```html
   <h2>Connexion à NEXUS TECH 🔐</h2>

   <p>Bonjour,</p>

   <p>Vous avez demandé un lien de connexion pour votre compte NEXUS TECH.</p>

   <p>Cliquez sur le lien ci-dessous pour vous connecter :</p>

   <p><a href="{{ .ConfirmationURL }}">Se connecter</a></p>

   <p>Ou copiez-collez ce lien :</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>Ce lien expirera dans 1 heure.</p>

   <p>Si vous n'avez pas demandé ce lien, ignorez cet email.</p>

   <hr>

   <p><strong>L'équipe NEXUS TECH</strong></p>
   ```

4. **Personnaliser le template "Reset Password"**

   ```html
   <h2>Réinitialisation de votre mot de passe 🔑</h2>

   <p>Bonjour,</p>

   <p>Vous avez demandé la réinitialisation de votre mot de passe NEXUS TECH.</p>

   <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>

   <p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>

   <p>Ou copiez-collez ce lien :</p>
   <p>{{ .ConfirmationURL }}</p>

   <p>Ce lien expirera dans 1 heure.</p>

   <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>

   <hr>

   <p><strong>L'équipe NEXUS TECH</strong></p>
   ```

5. **Sauvegarder les templates**
   - Cliquez sur "Save" après chaque modification

### Étape 3 : Configurer les paramètres d'email

1. **Paramètres généraux**
   - Dans "Settings" > "Auth" > "Email Auth"
   - **Enable email confirmations** : ✅ Activé (recommandé)
   - **Secure email change** : ✅ Activé
   - **Double opt-in** : ✅ Activé (pour la sécurité)

2. **URLs de redirection**
   - **Site URL** : `http://localhost:3000` (développement)
   - **Redirect URLs** : 
     ```
     http://localhost:3000/auth/callback
     https://votre-domaine.com/auth/callback
     ```

### Étape 4 : Tester l'envoi d'emails

1. **Test depuis le Dashboard**
   - Allez dans "Authentication" > "Users"
   - Cliquez sur "Send test email"
   - Vérifiez votre boîte de réception

2. **Test depuis l'application**
   - Créez un nouveau compte sur `/auth/signup`
   - Vérifiez que l'email de confirmation est bien reçu
   - Cliquez sur le lien de confirmation
   - Vérifiez que vous êtes bien redirigé vers l'application

---

## 3. Configuration GitHub OAuth (Bonus)

### Étape 1 : Créer une OAuth App sur GitHub

1. **Accéder aux paramètres développeur**
   - Allez sur [https://github.com/settings/developers](https://github.com/settings/developers)
   - Cliquez sur "New OAuth App"

2. **Remplir les informations**
   - **Application name** : `NEXUS TECH`
   - **Homepage URL** : `https://votre-domaine.com` ou `http://localhost:3000`
   - **Authorization callback URL** :
     ```
     https://njgmuhrkbwdeijnbqync.supabase.co/auth/v1/callback
     ```
   - Cliquez sur "Register application"

3. **Copier les identifiants**
   - **Client ID** : Copiez cette valeur
   - **Client Secret** : Cliquez sur "Generate a new client secret"
   - ⚠️ **Copiez le secret immédiatement** (il ne sera affiché qu'une fois)

### Étape 2 : Configurer GitHub OAuth dans Supabase

1. **Dans le Dashboard Supabase**
   - Allez dans "Authentication" > "Providers"
   - Trouvez "GitHub"
   - Activez le toggle

2. **Remplir les identifiants**
   - **Client ID** : Collez l'ID client GitHub
   - **Client Secret** : Collez le secret client GitHub
   - Cliquez sur "Save"

---

## 4. Vérification et Tests

### Checklist de vérification

- [ ] Google OAuth configuré et testé
- [ ] Emails de confirmation reçus et fonctionnels
- [ ] Templates d'email personnalisés
- [ ] SMTP configuré (si service personnalisé)
- [ ] URLs de redirection correctes
- [ ] Test de création de compte réussi
- [ ] Test de connexion Google réussi
- [ ] Test de réinitialisation de mot de passe réussi

### Tests à effectuer

1. **Test d'inscription**
   ```
   1. Aller sur /auth/signup
   2. Remplir le formulaire
   3. Vérifier la réception de l'email
   4. Cliquer sur le lien de confirmation
   5. Vérifier la redirection vers l'application
   ```

2. **Test de connexion Google**
   ```
   1. Aller sur /auth
   2. Cliquer sur "Continue with Google"
   3. Autoriser l'application
   4. Vérifier la redirection et la connexion
   ```

3. **Test de réinitialisation de mot de passe**
   ```
   1. Aller sur /auth
   2. Cliquer sur "Forgot password"
   3. Entrer l'email
   4. Vérifier la réception de l'email
   5. Cliquer sur le lien
   6. Créer un nouveau mot de passe
   ```

---

## 🔧 Dépannage

### Problème : Google OAuth ne fonctionne pas

**Solutions :**
- Vérifiez que l'URI de redirection dans Google Cloud correspond exactement à celui de Supabase
- Vérifiez que l'API Google+ est activée
- Vérifiez que les identifiants sont correctement copiés (sans espaces)
- Attendez quelques minutes après la configuration

### Problème : Les emails ne sont pas reçus

**Solutions :**
- Vérifiez le dossier spam
- Vérifiez la configuration SMTP
- Testez avec un autre email
- Vérifiez les logs dans Supabase Dashboard > Logs

### Problème : Lien de confirmation expiré

**Solutions :**
- Les liens expirent après 24h (configurable)
- Demandez un nouvel email de confirmation
- Vérifiez que l'URL de redirection est correcte

---

## 📞 Support

Pour toute question ou problème :
- Documentation Supabase : [https://supabase.com/docs](https://supabase.com/docs)
- Documentation Google OAuth : [https://developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)

---

**Dernière mise à jour** : 2024
