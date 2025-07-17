'use client'

import { useReducer, useEffect, useState } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { GameState, gameReducer, initializeGame } from '@/lib/gameLogic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BlackjackGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initializeGame())
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleHit = () => dispatch({ type: 'HIT' })
  const handleStand = () => dispatch({ type: 'STAND' })
  const handleNewGame = () => dispatch({ type: 'NEW_GAME' })
  const handlePlaceBet = (amount: number) => dispatch({ type: 'PLACE_BET', amount })
  const handleStartGame = () => dispatch({ type: 'START_GAME' })
  const handleDoubleDown = () => dispatch({ type: 'DOUBLE_DOWN' })
  const handleRemoveBetChip = (amount: number) => dispatch({ type: 'REMOVE_BET_CHIP', amount })
  const handleUndoLastBet = () => dispatch({ type: 'UNDO_LAST_BET' })
  const handleClearBet = () => dispatch({ type: 'CLEAR_BET' })
  const handleToggleCardCounting = () => dispatch({ type: 'TOGGLE_CARD_COUNTING' })

  // Show mobile message
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
            <div className="text-6xl mb-4">🎰</div>
            <h1 className="text-2xl font-bold text-white mb-4">Blackjack Card Counting</h1>
            <p className="text-gray-300 mb-6">
              This game is optimized for desktop and tablet devices. Please use a larger screen for the best experience.
            </p>
            <div className="text-sm text-gray-400">
              <p>• Better card visibility</p>
              <p>• Improved controls</p>
              <p>• Enhanced card counting features</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black p-1 sm:p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        <GameBoard 
          gameState={gameState}
          onHit={handleHit}
          onStand={handleStand}
          onNewGame={handleNewGame}
          onPlaceBet={handlePlaceBet}
          onStartGame={handleStartGame}
          onDoubleDown={handleDoubleDown}
          onRemoveBetChip={handleRemoveBetChip}
          onUndoLastBet={handleUndoLastBet}
          onClearBet={handleClearBet}
          onToggleCardCounting={handleToggleCardCounting}
        />
      </div>
    </div>
  )
} 