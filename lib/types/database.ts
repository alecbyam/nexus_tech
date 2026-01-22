export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          key: string
          name: string
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string | null
          description: string | null
          price_cents: number
          stock: number
          category_id: string
          is_active: boolean
          condition: 'new' | 'refurbished'
          is_refurbished: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku?: string | null
          description?: string | null
          price_cents: number
          stock?: number
          category_id: string
          is_active?: boolean
          condition?: 'new' | 'refurbished'
          is_refurbished?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string | null
          description?: string | null
          price_cents?: number
          stock?: number
          category_id?: string
          is_active?: boolean
          condition?: 'new' | 'refurbished'
          is_refurbished?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          storage_path: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_path: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage_path?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_cents: number
          currency: string
          customer_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_cents: number
          currency?: string
          customer_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
          total_cents?: number
          currency?: string
          customer_note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_cents_snapshot: number
          name_snapshot: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_cents_snapshot: number
          name_snapshot: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_cents_snapshot?: number
          name_snapshot?: string
          created_at?: string
        }
      }
    }
  }
}

