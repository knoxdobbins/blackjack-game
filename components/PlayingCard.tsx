'use client'

import React from 'react'
import { Card } from '@/lib/gameLogic'

interface PlayingCardProps {
  card: Card
  isHidden?: boolean
}

export function PlayingCard({ card, isHidden }: PlayingCardProps) {
  if (isHidden) {
    return (
      <div className="w-16 h-24 bg-blue-900 border-2 border-white rounded-lg flex items-center justify-center">
        <div className="text-white text-xs">?</div>
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
    <div className="w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center shadow-lg">
      <div className={`text-xs font-bold ${getSuitColor(card.suit)}`}>
        {card.value}
      </div>
      <div className={`text-lg ${getSuitColor(card.suit)}`}>
        {getSuitSymbol(card.suit)}
      </div>
    </div>
  )
} 