# Script de démarrage du serveur Next.js
Write-Host "Démarrage du serveur Next.js..." -ForegroundColor Cyan
Write-Host ""

# Vérifier les variables d'environnement
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Fichier .env.local non trouvé. Création..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_PHONE=243818510311
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green
}

# Démarrer le serveur
Write-Host "🚀 Démarrage sur http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm run dev
