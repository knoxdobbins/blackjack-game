'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Card as GameCard } from '@/lib/gameLogic'
import { PlayingCard } from './PlayingCard'

interface HandDisplayProps {
  hand: GameCard[]
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
        <Card className="bg-slate-700/50 border-slate-500 inline-block">
          <CardContent className="p-2">
            <span className="text-white text-lg">
              {isDealer && hand.some(card => card.isHidden) 
                ? `Score: ${score} (showing first card)`
                : `Score: ${score}`
              }
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 