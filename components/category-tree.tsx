'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category, CategoryWithChildren } from '@/lib/categories'
import { buildCategoryTree } from '@/lib/categories'
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface CategoryTreeProps {
  categories: Category[]
  selectedCategoryId?: string
  onCategorySelect?: (category: Category) => void
}

interface CategoryNodeProps {
  category: CategoryWithChildren
  level: number
  selectedCategoryId?: string
  onCategorySelect?: (category: Category) => void
}

function CategoryNode({
  category,
  level,
  selectedCategoryId,
  onCategorySelect,
}: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0)
  const hasChildren = category.children && category.children.length > 0
  const isSelected = category.id === selectedCategoryId

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
          ${isSelected 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
            : 'hover:bg-gray-100 text-gray-700'
          }
          ${level > 0 ? 'ml-4' : ''}
        `}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        
        <span className="text-lg mr-2">{category.icon || '📦'}</span>
        
        <Link
          href={`/catalog?category=${category.slug}`}
          onClick={() => onCategorySelect?.(category)}
          className="flex-1 font-semibold hover:underline"
        >
          {category.name}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: CategoryTreeProps) {
  // Construire l'arbre hiérarchique avec la fonction utilitaire
  const tree = buildCategoryTree(categories)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-2xl font-black text-gray-900 mb-6">Catégories</h2>
      <div className="space-y-1">
        {tree.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            level={0}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={onCategorySelect}
          />
        ))}
      </div>
    </div>
  )
}

