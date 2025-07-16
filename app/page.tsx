'use client'

import { useReducer, useEffect } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { GameState, gameReducer } from '@/lib/gameLogic'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function BlackjackGame() {
  const [gameState, dispatch] = useReducer(gameReducer, {
    playerHand: [],
    dealerHand: [],
    deck: [],
    gameStatus: 'betting',
    playerScore: 0,
    dealerScore: 0,
    message: 'Place your bet! You have $1000 credits.',
    cardsRemaining: 0,
    deckShuffled: false,
    credits: 1000,
    currentBet: 0,
    selectedChips: {},
    canDoubleDown: false,
    isDoubleDown: false
  })

  const handleHit = () => dispatch({ type: 'HIT' })
  const handleStand = () => dispatch({ type: 'STAND' })
  const handleNewGame = () => dispatch({ type: 'NEW_GAME' })
  const handlePlaceBet = (amount: number) => dispatch({ type: 'PLACE_BET', amount })
  const handleStartGame = () => dispatch({ type: 'START_GAME' })
  const handleDoubleDown = () => dispatch({ type: 'DOUBLE_DOWN' })
  const handleRemoveBetChip = (amount: number) => dispatch({ type: 'REMOVE_BET_CHIP', amount })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Blackjack
        </h1>
        
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