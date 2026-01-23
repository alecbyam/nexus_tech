# Configuration Rapide - Guide Express

## 🚀 Configuration Google OAuth (5 minutes)

### 1. Google Cloud Console
1. Allez sur [console.cloud.google.com](https://console.cloud.google.com/)
2. Créez un projet → Nom : `Nexus Tech`
3. APIs & Services → Bibliothèque → Activez "Google+ API"
4. APIs & Services → Écran de consentement OAuth → Créez (Externe)
5. APIs & Services → Identifiants → Créer ID client OAuth
   - Type : Application Web
   - URI de redirection : `https://VOTRE_PROJECT_ID.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard
1. Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Votre projet → Authentication → Providers
3. Activez "Google"
4. Collez :
   - Client ID (de Google Cloud)
   - Client Secret (de Google Cloud)
5. Save

✅ **C'est fait !** Testez sur `/auth`

---

## 📧 Configuration Email (3 minutes)

### Option 1 : Par défaut (Gratuit)
- Aucune configuration nécessaire
- Supabase envoie automatiquement
- Limite : 3 emails/heure/utilisateur

### Option 2 : Gmail SMTP (Recommandé)
1. **Générer un mot de passe d'application Google**
   - [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Créer pour "Mail" → Copier le mot de passe (16 caractères)

2. **Dans Supabase**
   - Settings → Auth → SMTP Settings
   - Activez "Enable Custom SMTP"
   - Remplissez :
     ```
     Host: smtp.gmail.com
     Port: 587
     User: votre-email@gmail.com
     Password: [le mot de passe d'application]
     Sender Email: votre-email@gmail.com
     Sender Name: NEXUS TECH
     ```
   - Save

✅ **C'est fait !** Testez en créant un compte

---

## 📝 Personnaliser les Emails

1. Supabase Dashboard → Settings → Auth → Email Templates
2. Cliquez sur "Confirm signup"
3. Remplacez par :

```html
<h2>Bienvenue sur NEXUS TECH ! 🎉</h2>
<p>Bonjour {{ .UserMetaData.full_name }},</p>
<p>Cliquez ici pour confirmer : <a href="{{ .ConfirmationURL }}">Confirmer</a></p>
<p>L'équipe NEXUS TECH</p>
```

4. Save

✅ **C'est fait !**

---

## 🔍 Vérification

- [ ] Testez `/auth/signup` → Vérifiez l'email reçu
- [ ] Testez "Continue with Google" → Vérifiez la connexion
- [ ] Vérifiez que les emails sont bien formatés

---

**Besoin d'aide ?** Consultez `CONFIGURATION_AUTH.md` pour le guide dépidé.
