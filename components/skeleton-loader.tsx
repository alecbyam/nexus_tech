'use client'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-3 md:p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto" />
      </div>
    </div>
  )
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Details skeleton */}
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-12 bg-gray-200 rounded-xl w-32" />
          <div className="flex gap-4">
            <div className="flex-1 h-14 bg-gray-200 rounded-xl" />
            <div className="flex-1 h-14 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
