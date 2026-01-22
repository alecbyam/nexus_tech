import { Database } from './database'

export type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
  product_images?: Database['public']['Tables']['product_images']['Row'][]
}

export type Category = Database['public']['Tables']['categories']['Row']

export type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: OrderItem[]
}

export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type CartItem = {
  productId: string
  name: string
  priceCents: number
  quantity: number
  imageUrl?: string
}

export type User = Database['public']['Tables']['profiles']['Row']

