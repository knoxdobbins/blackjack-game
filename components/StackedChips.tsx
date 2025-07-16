'use client'

import React from 'react'
import { Chip } from './Chip'

interface StackedChipsProps {
  selectedChips: { [amount: number]: number }
  onChipClick?: (amount: number) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function StackedChips({ selectedChips, onChipClick, disabled = false, size = 'medium' }: StackedChipsProps) {
  const chipEntries = Object.entries(selectedChips).filter(([_, count]) => count > 0)
  
  if (chipEntries.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 min-h-[48px]">
      {chipEntries.map(([amount, count]) => (
        <div key={amount} className="relative min-h-[48px]" style={{ minWidth: '48px' }}>
          {/* Stack up to 3 chips visually with a larger offset */}
          {Array.from({ length: Math.min(count, 3) }).map((_, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: `${index * 10}px`,
                left: `${index * 10}px`,
                zIndex: index
              }}
            >
              <Chip
                amount={parseInt(amount)}
                onClick={() => onChipClick?.(parseInt(amount))}
                disabled={disabled}
                selected={false}
                size={size}
              />
            </div>
          ))}
          {/* Show count if more than 1 chip */}
          {count > 1 && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-10 border-2 border-white">
              {count > 99 ? '99+' : count}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 