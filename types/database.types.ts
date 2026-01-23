export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type ProductCondition = 'new' | 'refurbished'
export type DiscountType = 'percentage' | 'fixed'
export type LoyaltyTransactionType = 'earned' | 'redeemed' | 'expired' | 'adjusted'
export type NotificationType = 'new_order' | 'low_stock' | 'new_review' | 'stock_alert'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
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
          slug: string | null
          parent_id: string | null
          icon: string | null
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          slug?: string | null
          parent_id?: string | null
          icon?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          slug?: string | null
          parent_id?: string | null
          icon?: string | null
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          sku: string | null
          name: string
          description: string | null
          price_cents: number
          compare_at_price_cents: number | null
          currency: string
          stock: number
          is_refurbished: boolean
          condition: ProductCondition
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          sku?: string | null
          name: string
          description?: string | null
          price_cents: number
          compare_at_price_cents?: number | null
          currency?: string
          stock?: number
          is_refurbished?: boolean
          condition?: ProductCondition
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          sku?: string | null
          name?: string
          description?: string | null
          price_cents?: number
          compare_at_price_cents?: number | null
          currency?: string
          stock?: number
          is_refurbished?: boolean
          condition?: ProductCondition
          is_active?: boolean
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
          status: OrderStatus
          total_cents: number
          currency: string
          customer_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: OrderStatus
          total_cents?: number
          currency?: string
          customer_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: OrderStatus
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
          product_id: string | null
          quantity: number
          price_cents_snapshot: number
          name_snapshot: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_cents_snapshot: number
          name_snapshot: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_cents_snapshot?: number
          name_snapshot?: string
          created_at?: string
        }
      }
      product_views: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          viewed_at: string
          session_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          viewed_at?: string
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          viewed_at?: string
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
      search_queries: {
        Row: {
          id: string
          user_id: string | null
          query: string
          category_slug: string | null
          results_count: number
          session_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          query: string
          category_slug?: string | null
          results_count?: number
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string
          category_slug?: string | null
          results_count?: number
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string | null
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stock_notifications: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          email: string | null
          phone: string | null
          is_notified: boolean
          notified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          email?: string | null
          phone?: string | null
          is_notified?: boolean
          notified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          email?: string | null
          phone?: string | null
          is_notified?: boolean
          notified_at?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: DiscountType
          discount_value: number
          min_purchase_cents: number
          max_discount_cents: number | null
          usage_limit: number | null
          used_count: number
          is_active: boolean
          valid_from: string
          valid_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: DiscountType
          discount_value: number
          min_purchase_cents?: number
          max_discount_cents?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: DiscountType
          discount_value?: number
          min_purchase_cents?: number
          max_discount_cents?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          valid_from?: string
          valid_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coupon_usage: {
        Row: {
          id: string
          coupon_id: string
          user_id: string
          order_id: string | null
          discount_amount_cents: number
          used_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          user_id: string
          order_id?: string | null
          discount_amount_cents: number
          used_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          user_id?: string
          order_id?: string | null
          discount_amount_cents?: number
          used_at?: string
        }
      }
      loyalty_points: {
        Row: {
          id: string
          user_id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
        }
      }
      loyalty_transactions: {
        Row: {
          id: string
          user_id: string
          points: number
          transaction_type: LoyaltyTransactionType
          description: string | null
          order_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          transaction_type: LoyaltyTransactionType
          description?: string | null
          order_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          transaction_type?: LoyaltyTransactionType
          description?: string | null
          order_id?: string | null
          created_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          type: NotificationType
          title: string
          message: string
          data: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: NotificationType
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: NotificationType
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      browsing_history: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          session_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          session_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          session_id?: string | null
          viewed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
