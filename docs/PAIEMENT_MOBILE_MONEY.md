# Paiement Mobile Money - Documentation

## 📱 Vue d'ensemble

Le système de paiement mobile money a été intégré pour supporter **M-Pesa**, **Orange Money**, et **Airtel Money** - les trois principaux services de mobile money en RDC.

## ✅ Fonctionnalités Implémentées

### 1. **Sélection de Méthode de Paiement**
- Interface utilisateur intuitive
- Support pour M-Pesa, Orange Money, Airtel Money
- Paiement en espèces à la livraison
- Validation du numéro de téléphone (format RDC)

### 2. **Gestion des Paiements**
- Création automatique d'enregistrement de paiement
- Suivi des statuts (pending, processing, completed, failed)
- Association avec les commandes
- Historique complet

### 3. **Interface Admin**
- Page de gestion des paiements (`/admin/payments`)
- Statistiques des paiements
- Filtres par statut
- Actions de validation/refus

## 🗄️ Structure de Base de Données

### Table `payments`

```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → orders)
- user_id: UUID (Foreign Key → users)
- amount_cents: INTEGER
- currency: TEXT (default: 'USD')
- payment_method: TEXT (mpesa, orange_money, airtel_money, card, cash)
- payment_status: TEXT (pending, processing, completed, failed, cancelled, refunded)
- phone_number: TEXT
- transaction_id: TEXT (ID du fournisseur)
- provider_reference: TEXT
- payment_data: JSONB (données supplémentaires)
- error_message: TEXT
- created_at, updated_at, completed_at: TIMESTAMPTZ
```

## 🚀 Installation

### 1. Exécuter la Migration SQL

Dans Supabase Dashboard > SQL Editor, exécutez :

```sql
-- Fichier: supabase/ADD_MOBILE_MONEY_PAYMENT.sql
```

Cette migration crée :
- La table `payments`
- Les index pour performance
- Les triggers pour mise à jour automatique
- Les politiques RLS (Row Level Security)

### 2. Vérifier la Migration

```sql
-- Vérifier que la table existe
SELECT * FROM payments LIMIT 1;

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'payments';
```

## 💻 Utilisation

### Pour les Clients

1. **Ajouter des produits au panier**
2. **Aller au panier** (`/cart`)
3. **Sélectionner une méthode de paiement** :
   - M-Pesa
   - Orange Money
   - Airtel Money
   - Espèces à la livraison
4. **Entrer le numéro de téléphone** (pour mobile money)
5. **Passer la commande**

### Pour les Admins

1. **Accéder à `/admin/payments`**
2. **Voir tous les paiements** avec filtres
3. **Valider ou refuser** les paiements en attente
4. **Voir les statistiques** (total, complétés, échoués, montant)

## 🔌 Intégration avec les Vrais APIs

### Configuration Actuelle

Le système utilise actuellement une **simulation** du paiement. Pour intégrer les vraies APIs :

### 1. Variables d'Environnement

Ajoutez dans `.env.local` et Vercel :

```env
# M-Pesa
MPESA_API_KEY=your_mpesa_api_key
MPESA_API_URL=https://api.mpesa.com
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret

# Orange Money
ORANGE_MONEY_API_KEY=your_orange_money_api_key
ORANGE_MONEY_API_URL=https://api.orange.com

# Airtel Money
AIRTEL_MONEY_API_KEY=your_airtel_money_api_key
AIRTEL_MONEY_API_URL=https://api.airtel.com
```

### 2. Modifier `lib/services/mobile-money.ts`

Remplacez la fonction `processMobileMoneyPayment` :

```typescript
async function processMobileMoneyPayment(params: {
  paymentMethod: PaymentMethod
  phoneNumber: string
  amountCents: number
  paymentId: string
}): Promise<PaymentResponse> {
  const config = getProviderConfig(params.paymentMethod)
  
  const response = await fetch(`${config.apiUrl}/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phoneNumber,
      amount: params.amountCents / 100,
      reference: params.paymentId,
      currency: 'USD',
    }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    return {
      success: false,
      error: data.message || 'Erreur lors du paiement',
    }
  }
  
  return {
    success: true,
    transactionId: data.transaction_id,
    providerReference: data.reference,
  }
}
```

### 3. Webhooks pour Confirmation

Créez une route API pour recevoir les webhooks :

```typescript
// app/api/payments/webhook/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  
  // Vérifier la signature du webhook
  // Mettre à jour le statut du paiement
  // Confirmer la commande si paiement réussi
}
```

## 📋 Format Numéro de Téléphone RDC

Le système valide les formats suivants :
- `+243 900 000 000`
- `243 900 000 000`
- `0900 000 000`
- `900 000 000`

**Format attendu :** 9 chiffres après le préfixe (243 ou 0)

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais stocker les codes PIN** en clair
2. **Utiliser HTTPS** pour toutes les communications
3. **Valider les webhooks** avec signatures
4. **Limiter les tentatives** de paiement
5. **Logger toutes les transactions** pour audit

### RLS (Row Level Security)

- Les utilisateurs ne peuvent voir que leurs propres paiements
- Les admins peuvent voir tous les paiements
- Les paiements sont automatiquement associés à l'utilisateur connecté

## 📊 Statuts de Paiement

| Statut | Description | Action |
|--------|-------------|--------|
| `pending` | Paiement créé, en attente | Client doit confirmer |
| `processing` | Paiement en cours de traitement | En attente de confirmation du fournisseur |
| `completed` | Paiement réussi | Commande automatiquement confirmée |
| `failed` | Paiement échoué | Client peut réessayer |
| `cancelled` | Paiement annulé | Par le client ou l'admin |
| `refunded` | Paiement remboursé | Remboursement effectué |

## 🔄 Flux de Paiement

### Mobile Money

1. Client sélectionne M-Pesa/Orange Money/Airtel Money
2. Client entre son numéro de téléphone
3. Client clique sur "Passer la commande"
4. Système crée la commande et le paiement
5. Système appelle l'API du fournisseur
6. Client reçoit une demande de confirmation sur son téléphone
7. Client entre son code PIN
8. Fournisseur confirme le paiement (webhook)
9. Statut passe à "completed"
10. Commande passe à "confirmed"

### Espèces

1. Client sélectionne "Espèces à la livraison"
2. Client passe la commande
3. Commande créée avec statut "pending"
4. Paiement enregistré avec statut "pending"
5. À la livraison, admin valide le paiement manuellement

## 🛠️ Développement

### Tester le Système

1. **Mode Simulation** (actuel) :
   - Les paiements sont simulés
   - Pas d'appel API réel
   - Utile pour le développement

2. **Mode Production** :
   - Intégration avec vraies APIs
   - Webhooks configurés
   - Monitoring des transactions

### Commandes Utiles

```sql
-- Voir tous les paiements
SELECT * FROM payments ORDER BY created_at DESC;

-- Voir les paiements en attente
SELECT * FROM payments WHERE payment_status = 'pending';

-- Statistiques
SELECT 
  payment_method,
  payment_status,
  COUNT(*) as count,
  SUM(amount_cents) / 100.0 as total_amount
FROM payments
GROUP BY payment_method, payment_status;
```

## 📞 Support

### Problèmes Courants

1. **Paiement ne se crée pas** :
   - Vérifier que la migration SQL est exécutée
   - Vérifier les permissions RLS
   - Vérifier les logs de la console

2. **Numéro de téléphone invalide** :
   - Vérifier le format (9 chiffres après préfixe)
   - Vérifier que le numéro commence par +243, 243, ou 0

3. **Statut ne se met pas à jour** :
   - Vérifier les triggers SQL
   - Vérifier les webhooks (si configurés)

## 🚀 Prochaines Étapes

1. **Intégrer les vraies APIs** des fournisseurs
2. **Configurer les webhooks** pour confirmation automatique
3. **Ajouter les notifications** SMS/Email
4. **Implémenter les remboursements**
5. **Ajouter le suivi en temps réel** des paiements

## 📚 Ressources

- [Documentation M-Pesa API](https://developer.safaricom.co.ke/)
- [Documentation Orange Money API](https://developer.orange.com/)
- [Documentation Airtel Money API](https://developer.airtel.com/)

---

**Note :** Le système est actuellement en mode simulation. Pour la production, intégrez les vraies APIs des fournisseurs de mobile money.
