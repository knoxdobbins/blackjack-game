'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { GameState } from '@/lib/gameLogic'
import { PlayingCard } from './PlayingCard'
import { HandDisplay } from './HandDisplay'
import { Chip } from './Chip'
import { StackedChips } from './StackedChips'
import { GameResult } from './GameResult'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'

interface GameBoardProps {
  gameState: GameState
  onHit: () => void
  onStand: () => void
  onNewGame: () => void
  onPlaceBet: (amount: number) => void
  onStartGame: () => void
  onDoubleDown: () => void
  onRemoveBetChip: (amount: number) => void
  onUndoLastBet: () => void
  onClearBet: () => void
  onToggleCardCounting: () => void
}

// Basic strategy function
function getBasicStrategySuggestion(playerScore: number, dealerUpCard: number, canDoubleDown: boolean, gameStatus: string): string {
  // Only show suggestions during active play
  if (gameStatus !== 'playing') {
    return ''
  }

  // If player has blackjack (21), always stand
  if (playerScore === 21) {
    return 'Stand'
  }

  // If player busts, no suggestion needed
  if (playerScore > 21) {
    return ''
  }

  // Get dealer's up card value (first card)
  const dealerCard = dealerUpCard

  // Hard totals (no ace counted as 11)
  if (playerScore <= 8) {
    return 'Hit'
  }
  
  if (playerScore === 9) {
    if (dealerCard >= 3 && dealerCard <= 6 && canDoubleDown) {
      return 'Double Down'
    }
    return 'Hit'
  }
  
  if (playerScore === 10) {
    if (dealerCard <= 9 && canDoubleDown) {
      return 'Double Down'
    }
    return 'Hit'
  }
  
  if (playerScore === 11) {
    if (canDoubleDown) {
      return 'Double Down'
    }
    return 'Hit'
  }
  
  if (playerScore === 12) {
    if (dealerCard >= 4 && dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore >= 13 && playerScore <= 16) {
    if (dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore >= 17) {
    return 'Stand'
  }

  return 'Hit'
}

export function GameBoard({ gameState, onHit, onStand, onNewGame, onPlaceBet, onStartGame, onDoubleDown, onRemoveBetChip, onUndoLastBet, onClearBet, onToggleCardCounting }: GameBoardProps) {
  const { playerHand, dealerHand, playerScore, dealerScore, gameStatus, message, cardsRemaining, deckShuffled, credits, currentBet, canDoubleDown, gameResult, winnings, cardCounter } = gameState;
  
  const [showResult, setShowResult] = useState(false)

  // Show result when game finishes and hide after 3 seconds
  useEffect(() => {
    if (gameResult && gameStatus === 'betting') {
      setShowResult(true)
      const timer = setTimeout(() => {
        setShowResult(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowResult(false)
    }
  }, [gameResult, gameStatus])

  // Handler for toggling card counting
  const handleToggleCardCounting = () => {
    if (typeof onToggleCardCounting === 'function') {
      onToggleCardCounting();
    }
  };

  // Get basic strategy suggestion
  const dealerUpCard = dealerHand.length > 0 ? dealerHand[0].numericValue : 0
  const strategySuggestion = getBasicStrategySuggestion(playerScore, dealerUpCard, canDoubleDown, gameStatus)

  const isGameActive = gameStatus === 'playing'
  const isGameFinished = gameStatus === 'finished'
  const isBetting = gameStatus === 'betting'
  const showDealerScore = isGameFinished || gameStatus === 'dealer-turn' || isBetting

  return (
    <div className="relative">
      {/* Game Result Overlay */}
      <GameResult 
        result={gameResult || null} 
        winnings={winnings} 
        isVisible={showResult} 
      />
      
      {/* Green Felt Table with Golden Border */}
      <div className="relative bg-green-700 rounded-3xl border-8 border-yellow-400 shadow-2xl overflow-hidden">
        <div className="p-8 min-h-[600px] flex flex-col">
          
          {/* Dealer Section - Top */}
          <div className="flex-1 flex flex-col items-center justify-start space-y-4">
            {/* Dealer Label and Score */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2">
                <span className="text-white font-semibold text-lg">Dealer</span>
              </div>
              {/* Dealer Score */}
              {dealerHand.length > 0 && (
                <div className="bg-blue-800 rounded-lg px-3 py-2">
                  <span className="text-white font-bold text-lg">
                    {showDealerScore ? dealerScore : dealerHand[0]?.numericValue || 0}
                  </span>
                </div>
              )}
            </div>
            
            {/* Dealer Cards and Deck */}
            <div className="flex items-center space-x-6">
              {/* Dealer Cards */}
              <div className="flex space-x-2">
                {dealerHand.map((card, index) => (
                  <PlayingCard 
                    key={index} 
                    card={card} 
                    isHidden={index === 1 && !showDealerScore}
                  />
                ))}
              </div>
              
              {/* Deck */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-1">
                  <div className="w-16 h-24 bg-blue-800 border-2 border-blue-600 rounded-lg shadow-lg"></div>
                  <div className="w-16 h-24 bg-blue-800 border-2 border-blue-600 rounded-lg shadow-lg -ml-8"></div>
                </div>
                <div className="bg-gray-800 rounded-lg px-3 py-1">
                  <span className="text-white text-sm">{cardsRemaining} Cards Left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Information - Middle */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            {/* Total/Pot Display */}
            <div className="bg-green-800 rounded-lg px-6 py-3">
              <div className="text-white text-2xl font-bold">${currentBet.toFixed(2)}</div>
              <div className="text-white text-sm text-center">Total</div>
            </div>
            
            {/* Player Chips
            <div className="flex space-x-2">
              <Chip amount={1} onClick={() => {}} size="small" />
              <Chip amount={5} onClick={() => {}} size="small" />
              <Chip amount={10} onClick={() => {}} size="small" />
              <Chip amount={50} onClick={() => {}} size="small" />
              <Chip amount={100} onClick={() => {}} size="small" />
            </div> */}
          </div>

          {/* Player Section - Bottom */}
          <div className="flex-1 flex flex-col items-center justify-end space-y-4">
            {/* Player Cards */}
            <div className="flex space-x-2">
              {playerHand.map((card, index) => (
                <PlayingCard key={index} card={card} />
              ))}
            </div>
            
            {/* Player Label and Score */}
            <div className="flex items-center space-x-4">
              <div className="bg-gray-800 rounded-lg px-4 py-2">
                <span className="text-white font-semibold text-lg">Player</span>
              </div>
              {/* Player Score */}
              {playerHand.length > 0 && (
                <div className="bg-green-800 rounded-lg px-3 py-2">
                  <span className="text-white font-bold text-lg">{playerScore}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Below Table */}
      <div className="mt-8 flex justify-center space-x-4">
        {isGameActive && (
          <>
            <Button
              onClick={onStand}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-8 text-lg rounded-lg"
            >
              Stand
            </Button>
            <Button
              onClick={onHit}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-8 text-lg rounded-lg"
            >
              Hit
            </Button>
            {canDoubleDown && (
              <Button
                onClick={onDoubleDown}
                disabled={credits < currentBet}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-8 text-lg rounded-lg"
              >
                Double Down
              </Button>
            )}
          </>
        )}
        
                 {isBetting && (
           <div className="space-y-4">
             <div className="text-center">
               <p className="text-white text-lg mb-3 font-semibold">Place your bet:</p>
               <div className="flex flex-wrap justify-center gap-3">
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
               
               {/* Undo and Clear buttons - only show when there's a bet */}
               {currentBet > 0 && (
                 <div className="flex justify-center gap-3 mt-4">
                   <Button
                     onClick={onUndoLastBet}
                     className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 text-sm rounded-lg"
                   >
                     Undo
                   </Button>
                   <Button
                     onClick={onClearBet}
                     className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 text-sm rounded-lg"
                   >
                     Clear
                   </Button>
                 </div>
               )}
             </div>

             {currentBet > 0 && (
               <div className="text-center">
                 <Button
                   onClick={onStartGame}
                   size="lg"
                   className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 text-lg rounded-lg"
                 >
                   Deal Cards
                 </Button>
               </div>
             )}
           </div>
         )}
      </div>

      {/* Game Status and Info - Top Right */}
      <div className="absolute top-4 right-4 space-y-2 flex flex-col items-end">
        {/* Card Counting Toggle */}
        <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 mb-2">
          <span className="text-white text-sm">Card Counting Practice</span>
          <Switch checked={cardCounter.isCounterEnabled()} onCheckedChange={handleToggleCardCounting} />
        </div>
        <div className="bg-gray-800 rounded-lg px-3 py-2">
          <span className="text-white text-sm">Credits: ${credits}</span>
        </div>
        <Button
          onClick={onNewGame}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg"
        >
          New Game
        </Button>
      </div>

      {/* Card Counting Numbers - Bottom Right Overlay */}
      {cardCounter.isCounterEnabled() && (
        <div className="absolute bottom-8 right-8 z-40 bg-gray-900 rounded-lg px-4 py-3 flex flex-col items-end shadow-lg border border-gray-700">
          <span className="text-green-300 text-xs font-mono">Running Count: <span className="font-bold">{cardCounter.getRunningCount()}</span></span>
          <span className="text-blue-300 text-xs font-mono">True Count: <span className="font-bold">{cardCounter.getTrueCount().toFixed(2)}</span></span>
          
          {/* Strategy Suggestion Box */}
          {strategySuggestion && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <span className="text-white text-xs font-semibold">Suggestion:</span>
              <div className="text-yellow-300 text-sm font-bold">{strategySuggestion}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 