# URLs et Informations Importantes

## 🔑 Identifiants Supabase

**Project ID** : `njgmuhrkbwdeijnbqync`  
**Project URL** : `https://njgmuhrkbwdeijnbqync.supabase.co`

> ⚠️ **Important** : Remplacez `njgmuhrkbwdeijnbqync` par votre vrai Project ID dans toutes les configurations

---

## 📍 URLs de Redirection OAuth

### Pour Google Cloud Console
```
https://njgmuhrkbwdeijnbqync.supabase.co/auth/v1/callback
```

### Pour GitHub OAuth App
```
https://njgmuhrkbwdeijnbqync.supabase.co/auth/v1/callback
```

### Pour Supabase Dashboard
**Redirect URLs** à ajouter :
```
http://localhost:3000/auth/callback
https://votre-domaine.com/auth/callback
```

---

## 🔗 Liens Utiles

### Google Cloud Console
- **Dashboard** : [https://console.cloud.google.com/](https://console.cloud.google.com/)
- **Identifiants OAuth** : [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- **Écran de consentement** : [https://console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent)
- **Mots de passe d'application** : [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Supabase
- **Dashboard** : [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Authentication Providers** : `Votre Projet → Authentication → Providers`
- **Email Templates** : `Votre Projet → Settings → Auth → Email Templates`
- **SMTP Settings** : `Votre Projet → Settings → Auth → SMTP Settings`

### GitHub
- **OAuth Apps** : [https://github.com/settings/developers](https://github.com/settings/developers)

---

## 📧 Configuration SMTP Recommandée

### Gmail (Gratuit - Pour débuter)
```
Host: smtp.gmail.com
Port: 587
User: votre-email@gmail.com
Password: [Mot de passe d'application Google]
```

### SendGrid (Recommandé pour production)
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: [Votre API Key SendGrid]
```

---

## ✅ Checklist de Configuration

### Google OAuth
- [ ] Projet créé dans Google Cloud Console
- [ ] Google+ API activée
- [ ] Écran de consentement configuré
- [ ] ID client OAuth créé
- [ ] URI de redirection ajoutée
- [ ] Identifiants copiés dans Supabase
- [ ] Provider Google activé dans Supabase

### Emails
- [ ] SMTP configuré (ou par défaut)
- [ ] Templates personnalisés
- [ ] Email de confirmation activé
- [ ] URLs de redirection configurées
- [ ] Test d'envoi réussi

### GitHub OAuth (Optionnel)
- [ ] OAuth App créée sur GitHub
- [ ] Callback URL configurée
- [ ] Identifiants copiés dans Supabase
- [ ] Provider GitHub activé dans Supabase

---

## 🧪 Tests à Effectuer

1. **Test d'inscription**
   - URL : `http://localhost:3000/auth/signup`
   - Vérifier : Email de confirmation reçu

2. **Test de connexion Google**
   - URL : `http://localhost:3000/auth`
   - Vérifier : Redirection vers Google puis retour

3. **Test de réinitialisation**
   - URL : `http://localhost:3000/auth`
   - Vérifier : Email de réinitialisation reçu

---

## 📝 Notes Importantes

1. **Project ID Supabase** : Trouvez-le dans Settings → General → Reference ID
2. **Secrets** : Ne jamais commiter les secrets dans le code
3. **URLs de production** : Remplacez `localhost:3000` par votre domaine en production
4. **Limites** : Le service email par défaut de Supabase a une limite de 3 emails/heure/utilisateur

---

**Dernière mise à jour** : 2024
