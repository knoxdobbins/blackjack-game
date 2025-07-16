'use client'

import React from 'react'
import { Card } from '@/lib/gameLogic'
import { PlayingCard } from './PlayingCard'

interface HandDisplayProps {
  hand: Card[]
  score: number
  isDealer: boolean
}

export function HandDisplay({ hand, score, isDealer }: HandDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="flex flex-wrap gap-2 justify-center">
        {hand.map((card, index) => (
          <PlayingCard 
            key={`${card.suit}-${card.value}-${index}`}
            card={card}
            isHidden={card.isHidden}
          />
        ))}
      </div>
      
      {/* Score */}
      <div className="text-center">
        <p className="text-lg text-white">
          {isDealer && hand.some(card => card.isHidden) 
            ? `Score: ${score} (showing first card)`
            : `Score: ${score}`
          }
        </p>
      </div>
    </div>
  )
} 