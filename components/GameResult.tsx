'use client'

import React from 'react'

interface GameResultProps {
  result: 'win' | 'lose' | 'tie' | null
  winnings?: number
  isVisible: boolean
}

export function GameResult({ result, winnings, isVisible }: GameResultProps) {
  if (!isVisible || !result) return null

  const getResultConfig = () => {
    switch (result) {
      case 'win':
        return {
          text: 'YOU WIN!',
          bgColor: 'bg-green-600',
          borderColor: 'border-green-400',
          textColor: 'text-green-100',
          icon: '🎉'
        }
      case 'lose':
        return {
          text: 'YOU LOSE',
          bgColor: 'bg-red-600',
          borderColor: 'border-red-400',
          textColor: 'text-red-100',
          icon: '💔'
        }
      case 'tie':
        return {
          text: 'PUSH',
          bgColor: 'bg-yellow-600',
          borderColor: 'border-yellow-400',
          textColor: 'text-yellow-100',
          icon: '🤝'
        }
      default:
        return {
          text: '',
          bgColor: '',
          borderColor: '',
          textColor: '',
          icon: ''
        }
    }
  }

  const config = getResultConfig()

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border-4 rounded-2xl px-8 py-6 shadow-2xl
        transform transition-all duration-500 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        pointer-events-auto
      `}>
        <div className="text-center">
          <div className="text-4xl mb-2">{config.icon}</div>
          <div className="text-3xl font-bold mb-2">{config.text}</div>
          {winnings && winnings !== 0 && (
            <div className="text-xl font-semibold">
              {winnings > 0 ? `+$${winnings}` : `-$${Math.abs(winnings)}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 