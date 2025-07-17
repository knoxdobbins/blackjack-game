'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Card as GameCard } from '@/lib/gameLogic'

interface PlayingCardProps {
  card: GameCard
  isHidden?: boolean
  countChange?: number
  showCountChange?: boolean
}

export function PlayingCard({ card, isHidden, countChange, showCountChange }: PlayingCardProps) {
  if (isHidden) {
    return (
      <div className="w-20 h-28 bg-blue-800 border-2 border-blue-600 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-blue-200 text-xs font-bold">?</div>
      </div>
    )
  }

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥'
      case 'diamonds': return '♦'
      case 'clubs': return '♣'
      case 'spades': return '♠'
      default: return ''
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'
  }

  return (
    <div className="relative">
      {showCountChange && countChange !== undefined && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`px-2 py-1 rounded text-xs font-bold ${
            countChange > 0 ? 'bg-green-600 text-white' : 
            countChange < 0 ? 'bg-red-600 text-white' : 
            'bg-gray-600 text-white'
          }`}>
            {countChange > 0 ? `+${countChange}` : countChange}
          </div>
        </div>
      )}
      <div className="w-20 h-28 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <div className="p-1 h-full flex flex-col">
          {/* Top left corner */}
          <div className="flex items-start justify-between">
            <div className={`text-xs font-bold ${getSuitColor(card.suit)}`}>
              {card.value}
            </div>
            <div className={`text-xs ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </div>
          
          {/* Center suit */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`text-2xl ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </div>
          
          {/* Bottom right corner (rotated) */}
          <div className="flex items-end justify-between">
            <div className={`text-xs ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
            <div className={`text-xs font-bold ${getSuitColor(card.suit)}`}>
              {card.value}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 