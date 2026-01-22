# Guide pour lancer l'app en local (Windows)

## 1. Installer Flutter

1. Télécharge Flutter depuis : https://docs.flutter.dev/get-started/install/windows
2. Dézippe dans `C:\src\flutter` (ou un autre dossier)
3. Ajoute `C:\src\flutter\bin` au PATH Windows :
   - Recherche "Variables d'environnement" dans Windows
   - Clique sur "Variables d'environnement"
   - Dans "Variables système", trouve "Path" → Modifier
   - Ajoute : `C:\src\flutter\bin`
   - OK partout
4. **Redémarre PowerShell** (important !)
5. Vérifie : `flutter --version`

## 2. Créer le fichier .env

À la racine du projet (`Nexus Tech`), crée un fichier **`.env`** avec :

```
SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
WHATSAPP_PHONE=243818510311
```

## 3. Installer les dépendances

```powershell
cd "C:\Users\MOISE BYAMUNGU\Desktop\MATRIX ROOM\Nexus Tech"
flutter pub get
```

## 4. Lancer l'app (Web)

```powershell
flutter run -d chrome
```

Ou avec Edge :

```powershell
flutter run -d edge
```

## 5. Build pour production

```powershell
flutter build web --release
```

Le résultat sera dans `build/web`.

## Dépannage

- **Erreur "flutter not found"** : Vérifie que Flutter est dans le PATH et redémarre PowerShell
- **Erreur ".env not found"** : Vérifie que le fichier `.env` est bien à la racine du projet
- **Erreur de compilation** : Copie-colle l'erreur complète ici

