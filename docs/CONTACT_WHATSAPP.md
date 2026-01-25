# Contact WhatsApp et Adresse de Livraison

## Fonctionnalités ajoutées

### 1. Contact WhatsApp direct

Un bouton WhatsApp a été ajouté dans le header de l'application pour permettre aux clients de vous contacter directement.

**Emplacement :**
- Header desktop : Icône WhatsApp verte à côté du panier
- Header mobile : Icône WhatsApp dans le menu mobile

**Numéro WhatsApp :** +243 818 510 311

**Fonctionnalité :**
- Cliquer sur l'icône WhatsApp ouvre une conversation WhatsApp avec un message pré-rempli
- Message par défaut : "Bonjour NEXUS TECH, j'aimerais vous contacter"

### 2. Adresse de livraison

Les clients peuvent maintenant fournir leur adresse de livraison lors de la commande.

**Emplacement :**
- Page panier (`/cart`) : Champ texte pour l'adresse de livraison
- Optionnel : Les clients peuvent passer commande sans adresse

**Affichage :**
- **Page commande client** (`/orders/[id]`) : L'adresse s'affiche si fournie
- **Page admin commandes** (`/admin/orders`) : L'adresse s'affiche dans la liste des commandes
- **Page détail commande admin** (`/admin/orders/[id]`) : L'adresse s'affiche dans les détails

## Migration de base de données

Pour activer le champ d'adresse de livraison, exécutez ce script SQL dans Supabase :

```sql
-- Ajouter le champ d'adresse de livraison à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

COMMENT ON COLUMN public.orders.delivery_address IS 'Adresse complète de livraison du client';
```

Le fichier `supabase/ADD_DELIVERY_ADDRESS.sql` contient ce script.

## Utilisation

### Pour les clients

1. **Contacter via WhatsApp :**
   - Cliquez sur l'icône WhatsApp dans le header
   - Une conversation WhatsApp s'ouvre avec un message pré-rempli

2. **Fournir une adresse de livraison :**
   - Allez dans votre panier
   - Remplissez le champ "Adresse de livraison" (optionnel)
   - Passez votre commande
   - L'adresse sera enregistrée avec votre commande

### Pour l'admin

1. **Voir les adresses de livraison :**
   - Allez dans "Gérer les commandes"
   - Les adresses s'affichent sous le nom du client
   - Cliquez sur une commande pour voir les détails complets

2. **Utiliser l'adresse :**
   - L'adresse est visible dans les détails de chaque commande
   - Vous pouvez copier l'adresse pour organiser la livraison
