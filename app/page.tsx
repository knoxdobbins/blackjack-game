'use client'

import { useReducer, useEffect } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { GameState, gameReducer, initializeGame } from '@/lib/gameLogic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BlackjackGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initializeGame())

  const handleHit = () => dispatch({ type: 'HIT' })
  const handleStand = () => dispatch({ type: 'STAND' })
  const handleNewGame = () => dispatch({ type: 'NEW_GAME' })
  const handlePlaceBet = (amount: number) => dispatch({ type: 'PLACE_BET', amount })
  const handleStartGame = () => dispatch({ type: 'START_GAME' })
  const handleDoubleDown = () => dispatch({ type: 'DOUBLE_DOWN' })
  const handleRemoveBetChip = (amount: number) => dispatch({ type: 'REMOVE_BET_CHIP', amount })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-4xl font-bold text-white">
              Blackjack
            </CardTitle>
          </CardHeader>
        </Card>
        
        <GameBoard 
          gameState={gameState}
          onHit={handleHit}
          onStand={handleStand}
          onNewGame={handleNewGame}
          onPlaceBet={handlePlaceBet}
          onStartGame={handleStartGame}
          onDoubleDown={handleDoubleDown}
          onRemoveBetChip={handleRemoveBetChip}
        />
      </div>
    </div>
  )
} 