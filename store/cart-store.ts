import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl?: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  itemCount: number
  total: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      // Fonction helper pour obtenir les items de manière sécurisée
      const getItems = () => {
        try {
          const state = get()
          return state?.items || []
        } catch (error) {
          console.error('Error getting cart items:', error)
          return []
        }
      }

      return {
        items: [],
        addItem: (item) => {
          try {
            const items = getItems()
            const existing = items.find((i) => i.productId === item.productId)
            if (existing) {
              set({
                items: items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                ),
              })
            } else {
              set({ items: [...items, { ...item, quantity: 1 }] })
            }
          } catch (error) {
            console.error('Error adding item to cart:', error)
          }
        },
        removeItem: (productId) => {
          try {
            const items = getItems()
            set({ items: items.filter((i) => i.productId !== productId) })
          } catch (error) {
            console.error('Error removing item from cart:', error)
          }
        },
        updateQuantity: (productId, quantity) => {
          try {
            if (quantity <= 0) {
              const items = getItems()
              set({ items: items.filter((i) => i.productId !== productId) })
            } else {
              const items = getItems()
              set({
                items: items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
              })
            }
          } catch (error) {
            console.error('Error updating quantity:', error)
          }
        },
        clear: () => set({ items: [] }),
        get itemCount() {
          try {
            const items = getItems()
            return items.reduce((sum, item) => sum + item.quantity, 0)
          } catch (error) {
            console.error('Error calculating item count:', error)
            return 0
          }
        },
        get total() {
          try {
            const items = getItems()
            return items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            )
          } catch (error) {
            console.error('Error calculating total:', error)
            return 0
          }
        },
      }
    },
    {
      name: 'nexus-tech-cart',
      // Gérer les erreurs de désérialisation
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating cart store:', error)
        }
      },
    }
  )
)

