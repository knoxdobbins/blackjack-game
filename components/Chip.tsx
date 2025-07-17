'use client'

import React from 'react'
import Image from 'next/image'

interface ChipProps {
  amount: number
  onClick: () => void
  disabled?: boolean
  selected?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function Chip({ amount, onClick, disabled = false, selected = false, size = 'medium' }: ChipProps) {
  const getChipImage = (amount: number) => {
    switch (amount) {
      case 1:
        return '/chips/1.svg'
      case 5:
        return '/chips/5.svg'
      case 10:
        return '/chips/10.svg'
      case 50:
        return '/chips/50.svg'
      case 100:
        return '/chips/100.svg'
      default:
        return '/chips/1.svg'
    }
  }

  const getChipSize = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, textSize: 'text-xs' }
      case 'large':
        return { width: 80, height: 80, textSize: 'text-base' }
      default:
        return { width: 48, height: 48, textSize: 'text-sm' }
    }
  }

  const { width, height, textSize } = getChipSize()

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative transition-all duration-200 transform hover:scale-105 active:scale-95
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${selected ? 'ring-4 ring-yellow-300 ring-opacity-75' : ''}
      `}
    >
      <div className="relative">
        <Image
          src={getChipImage(amount)}
          alt={`$${amount} chip`}
          width={width}
          height={height}
          className="drop-shadow-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* <span className={`text-white font-bold ${textSize} drop-shadow-md`}>
            ${amount}
          </span> */}
        </div>
      </div>
    </button>
  )
} 