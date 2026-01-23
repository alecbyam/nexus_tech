# 🚀 Guide Pratique - Configuration Création Simple de Compte

Guide étape par étape pour configurer la création de compte par email/mot de passe.

---

## ⚡ Configuration Rapide (5 minutes)

### Étape 1 : Configurer Supabase Dashboard

1. **Ouvrez Supabase Dashboard**
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet

2. **Authentication → Settings**
   - Allez dans **"Authentication"** puis **"Settings"** (ou **"Paramètres"**)

3. **Activer Email Auth**
   - ✅ **Enable email signup** : Activé
   - ✅ **Enable email confirmations** : **ACTIVEZ** (recommandé)
   - ✅ **Secure email change** : Activé
   - ✅ **Double opt-in** : Activé

4. **Configurer les URLs**
   - **Site URL** : `http://localhost:3000`
   - **Redirect URLs** : 
     ```
     http://localhost:3000/**
     http://localhost:3000/auth/callback
     ```
   - Cliquez sur **"Save"**

### Étape 2 : Vérifier le Schéma de Base de Données

1. **SQL Editor dans Supabase**
   - Allez dans **"SQL Editor"**
   - Vérifiez que le script `supabase/schema.sql` a été exécuté
   - Si non, copiez-collez le contenu et exécutez-le

2. **Vérifier le Trigger**
   - Le trigger `on_auth_user_created` doit être actif
   - Il crée automatiquement un profil quand un utilisateur s'inscrit

### Étape 3 : Personnaliser les Emails (Optionnel)

1. **Settings → Auth → Email Templates**
   - Cliquez sur **"Confirm signup"**
   - Remplacez par le template personnalisé (voir guide complet)
   - Cliquez sur **"Save"**

---

## ✅ Vérification

### Checklist

- [ ] Email signup activé dans Supabase
- [ ] Email confirmations activé
- [ ] Site URL configurée
- [ ] Redirect URLs configurées
- [ ] Schéma SQL exécuté
- [ ] Variables d'environnement dans `.env.local`

### Test

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Tester l'inscription**
   - Allez sur `http://localhost:3000/auth/signup`
   - Remplissez le formulaire
   - Soumettez

3. **Vérifier l'email**
   - Ouvrez votre boîte de réception
   - Cherchez l'email de Supabase
   - ⚠️ Vérifiez aussi le SPAM

4. **Confirmer le compte**
   - Cliquez sur le lien dans l'email
   - Vous devriez être redirigé vers l'application

---

## 📧 Configuration Email (Service par Défaut)

**Aucune configuration supplémentaire nécessaire !**

Supabase envoie automatiquement les emails avec :
- ✅ Service gratuit inclus
- ✅ Limite : 3 emails/heure/utilisateur
- ✅ Parfait pour le développement

**Pour la production**, vous pouvez configurer un SMTP personnalisé (voir guide complet).

---

## 🔍 Vérifier dans Supabase

### Vérifier l'utilisateur créé

1. **Authentication → Users**
   - Vous devriez voir le nouvel utilisateur
   - Statut : "Confirmed" après confirmation email

### Vérifier le profil créé

1. **Table Editor → profiles**
   - Vous devriez voir un profil avec l'ID utilisateur
   - Vérifiez les données (nom, téléphone)

---

## 🐛 Problèmes Courants

### Email non reçu
- ✅ Vérifiez le SPAM
- ✅ Attendez quelques minutes
- ✅ Vérifiez les logs : Dashboard → Logs → Auth Logs

### Lien ne fonctionne pas
- ✅ Vérifiez les Redirect URLs dans Supabase
- ✅ Le lien expire après 24h

### Profil non créé
- ✅ Vérifiez que le trigger SQL est actif
- ✅ Ré-exécutez `supabase/schema.sql`

---

## 📝 Variables d'Environnement

Vérifiez que `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

> Trouvez ces valeurs dans : Supabase Dashboard → Settings → API

---

**C'est tout !** Votre création de compte simple est configurée. 🎉

Pour plus de détails, consultez `CONFIGURATION_COMPTE_SIMPLE.md`
