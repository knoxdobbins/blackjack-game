'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Card as GameCard } from '@/lib/gameLogic'

interface PlayingCardProps {
  card: GameCard
  isHidden?: boolean
}

export function PlayingCard({ card, isHidden }: PlayingCardProps) {
  if (isHidden) {
    return (
      <Card className="w-16 h-24 bg-slate-700 border-2 border-slate-500 rounded-lg">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-slate-300 text-xs font-bold">?</div>
        </CardContent>
      </Card>
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
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-slate-800'
  }

  return (
    <Card className="w-16 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-0 h-full flex flex-col items-center justify-center">
        <div className={`text-xs font-bold ${getSuitColor(card.suit)}`}>
          {card.value}
        </div>
        <div className={`text-lg ${getSuitColor(card.suit)}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </CardContent>
    </Card>
  )
} 