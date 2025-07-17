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
}

export function GameBoard({ gameState, onHit, onStand, onNewGame, onPlaceBet, onStartGame, onDoubleDown, onRemoveBetChip, onUndoLastBet, onClearBet }: GameBoardProps) {
  const { playerHand, dealerHand, playerScore, dealerScore, gameStatus, message, cardsRemaining, deckShuffled, credits, currentBet, canDoubleDown, gameResult, winnings } = gameState
  
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
      <div className="absolute top-4 right-4 space-y-2">
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
    </div>
  )
} 