'use client'

import React from 'react'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GameState } from '@/lib/gameLogic'
import { PlayingCard } from './PlayingCard'
import { HandDisplay } from './HandDisplay'
import { Chip } from './Chip'
import { StackedChips } from './StackedChips'

interface GameBoardProps {
  gameState: GameState
  onHit: () => void
  onStand: () => void
  onNewGame: () => void
  onPlaceBet: (amount: number) => void
  onStartGame: () => void
  onDoubleDown: () => void
  onRemoveBetChip: (amount: number) => void
}

export function GameBoard({ gameState, onHit, onStand, onNewGame, onPlaceBet, onStartGame, onDoubleDown, onRemoveBetChip }: GameBoardProps) {
  const { playerHand, dealerHand, playerScore, dealerScore, gameStatus, message, cardsRemaining, deckShuffled, credits, currentBet, canDoubleDown } = gameState
  
  const isGameActive = gameStatus === 'playing'
  const isGameFinished = gameStatus === 'finished'
  const isBetting = gameStatus === 'betting'
  const showDealerScore = isGameFinished || gameStatus === 'dealer-turn' || isBetting

  return (
    <div className="space-y-8">
      {/* Credits and Bet Display */}
      <div className="flex justify-between items-center bg-blue-900/80 rounded-lg p-4">
        <div className="text-white">
          <p className="text-lg font-bold">Credits: ${credits}</p>
          {currentBet > 0 && (
            <div className="flex items-center justify-between mt-2 w-56">
              <span className="text-sm">Current Bet:</span>
              <div className="flex-1 flex justify-end">
                <StackedChips 
                  selectedChips={gameState.selectedChips} 
                  size="small" 
                  onChipClick={gameStatus === 'betting' ? onRemoveBetChip : undefined}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* New Game Button - Always visible in top right */}
        <Button 
          onClick={onNewGame}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
        >
          New Game
        </Button>
      </div>

      {/* Dealer Section */}
      <div className="bg-green-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Dealer</h2>
        <HandDisplay 
          hand={dealerHand} 
          score={showDealerScore ? dealerScore : dealerHand[0]?.numericValue || 0}
          isDealer={true}
        />
      </div>

      {/* Game Status */}
      <div className="text-center space-y-2">
        <UICard className="p-4 bg-white/10 border-white/20">
          <p className="text-xl font-semibold text-white">{message}</p>
        </UICard>
        
        {/* Cards Remaining */}
        <div className="flex justify-center items-center gap-4">
          <div className={`rounded-lg px-4 py-2 ${
            cardsRemaining <= 30 ? 'bg-red-900/80' : 'bg-blue-900/80'
          }`}>
            <p className="text-white text-sm">
              Cards Remaining: <span className="font-bold">{cardsRemaining}</span>
              {cardsRemaining <= 30 && (
                <span className="ml-2 text-yellow-300">⚠️ Low</span>
              )}
            </p>
          </div>
          
          {deckShuffled && (
            <div className="bg-yellow-600/80 rounded-lg px-4 py-2">
              <p className="text-white text-sm font-bold">
                🔄 Deck Shuffled
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Section */}
      <div className="bg-green-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Player</h2>
        <HandDisplay 
          hand={playerHand} 
          score={playerScore}
          isDealer={false}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        {/* Betting Interface */}
        {isBetting && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white text-xl mb-4 font-semibold">Place your bet:</p>
              <div className="flex flex-wrap justify-center gap-4">
                {[1, 5, 10, 50, 100].map((amount) => (
                  <Chip
                    key={amount}
                    amount={amount}
                    onClick={() => onPlaceBet(amount)}
                    disabled={credits < amount}
                    selected={currentBet === amount}
                  />
                ))}
              </div>
            </div>
            
            {currentBet > 0 && (
              <div className="text-center">
                <Button 
                  onClick={onStartGame}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Deal Cards
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Game Actions */}
        {isGameActive && (
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={onHit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Hit
            </Button>
            <Button 
              onClick={onStand}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              Stand
            </Button>
            {canDoubleDown && (
              <Button 
                onClick={onDoubleDown}
                disabled={credits < currentBet}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Double Down
              </Button>
            )}
          </div>
        )}
        

      </div>
    </div>
  )
} 