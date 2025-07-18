'use client'

import { useReducer } from 'react'
import { GameBoard } from '@/components/GameBoard'
import { GameState, gameReducer, initializeGame } from '@/lib/gameLogic'

export default function BlackjackGame() {
  const [gameState, dispatch] = useReducer(gameReducer, initializeGame())

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
  const handleSplit = () => dispatch({ type: 'SPLIT' })

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
          onSplit={handleSplit}
        />
      </div>
    </div>
  )
} 