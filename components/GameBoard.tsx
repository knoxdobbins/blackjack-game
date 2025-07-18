'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { GameState, calculateHandValue } from '@/lib/gameLogic'
import { PlayingCard } from './PlayingCard'
import { HandDisplay } from './HandDisplay'
import { Chip } from './Chip'
import { StackedChips } from './StackedChips'
import { GameResult } from './GameResult'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { CardCounter } from '@/lib/cardCounter'
import { Card } from '@/lib/gameLogic'

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
  onSplit: () => void
}

// Helper function to calculate count change for a card
function getCardCountChange(cardValue: string): number {
  const numericValue = (() => {
    if (cardValue === 'A') return 14  // Ace is high
    if (['J', 'Q', 'K'].includes(cardValue)) return 10  // Face cards
    return parseInt(cardValue)
  })()
  
  if (numericValue >= 2 && numericValue <= 6) {
    return +1  // Low cards
  } else if (numericValue >= 7 && numericValue <= 9) {
    return 0   // Neutral cards
  } else {
    return -1  // High cards (10, J, Q, K, A)
  }
}

// Get betting recommendation based on true count
function getBettingRecommendation(trueCount: number): string {
  if (trueCount >= 5) {
    return 'Maximum (High Adv)'
  } else if (trueCount >= 3) {
    return 'High (Good Adv)'
  } else if (trueCount >= 1) {
    return 'Above Avg (Slight Adv)'
  } else if (trueCount >= -1) {
    return 'Avg (Neutral)'
  } else if (trueCount >= -3) {
    return 'Below Avg (Disadv)'
  } else {
    return 'Minimum or Sit Out (High Disadv)'
  }
}

// Enhanced card counting strategy function with split support
function getCardCountingStrategySuggestion(playerScore: number, dealerUpCard: number, canDoubleDown: boolean, gameStatus: string, trueCount: number, isSplit: boolean, splitHands: Card[][], currentHandIndex: number): string {
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

  // Special handling for split hands
  if (isSplit && splitHands.length > 0) {
    const currentHand = splitHands[currentHandIndex]
    const isAceSplit = currentHand.length === 2 && currentHand[0].value === 'A' && currentHand[1].value === 'A'
    
    if (isAceSplit) {
      return 'Ace Split - One card only'
    }
    
    // Enhanced split strategies with card counting
    if (playerScore === 8) {
      // With very high count (+6 or higher), double down on split 8s vs dealer 6
      if (trueCount >= 6 && dealerCard === 6 && canDoubleDown) {
        return 'Double Down (High Count)'
      }
      return 'Hit'
    }
    
    if (playerScore === 9) {
      // With high count (+3 or higher), double down against dealer 2
      if (trueCount >= 3 && dealerCard === 2 && canDoubleDown) {
        return 'Double Down (High Count)'
      }
      // Standard basic strategy
      if (dealerCard >= 3 && dealerCard <= 6 && canDoubleDown) {
        return 'Double Down'
      }
      return 'Hit'
    }
    
    if (playerScore === 10) {
      // With high count (+4 or higher), double down against dealer A
      if (trueCount >= 4 && dealerCard === 11 && canDoubleDown) {
        return 'Double Down (High Count)'
      }
      // Standard basic strategy
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
      // With high count (+3 or higher), stand against dealer 3
      if (trueCount >= 3 && dealerCard === 3) {
        return 'Stand (High Count)'
      }
      // With high count (+2 or higher), stand against dealer 2
      if (trueCount >= 2 && dealerCard === 2) {
        return 'Stand (High Count)'
      }
      // Standard basic strategy
      if (dealerCard >= 4 && dealerCard <= 6) {
        return 'Stand'
      }
      return 'Hit'
    }
    
    if (playerScore === 13) {
      // With high count (+1 or higher), stand against dealer 2
      if (trueCount >= 1 && dealerCard === 2) {
        return 'Stand (High Count)'
      }
      // Standard basic strategy
      if (dealerCard <= 6) {
        return 'Stand'
      }
      return 'Hit'
    }
    
    if (playerScore === 14) {
      // With high count (+3 or higher), stand against dealer 10
      if (trueCount >= 3 && dealerCard === 10) {
        return 'Stand (High Count)'
      }
      // Standard basic strategy
      if (dealerCard <= 6) {
        return 'Stand'
      }
      return 'Hit'
    }
    
    if (playerScore === 15) {
      // With high count (+4 or higher), stand against dealer 10
      if (trueCount >= 4 && dealerCard === 10) {
        return 'Stand (High Count)'
      }
      // With high count (+3 or higher), stand against dealer 9
      if (trueCount >= 3 && dealerCard === 9) {
        return 'Stand (High Count)'
      }
      // Standard basic strategy
      if (dealerCard <= 6) {
        return 'Stand'
      }
      return 'Hit'
    }
    
    if (playerScore === 16) {
      // With high count (+6 or higher), stand against dealer 10
      if (trueCount >= 6 && dealerCard === 10) {
        return 'Stand (High Count)'
      }
      // With high count (+5 or higher), stand against dealer 9
      if (trueCount >= 5 && dealerCard === 9) {
        return 'Stand (High Count)'
      }
      // With high count (+4 or higher), stand against dealer A
      if (trueCount >= 4 && dealerCard === 11) {
        return 'Stand (High Count)'
      }
      // Standard basic strategy
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

  // Regular hand strategies (existing logic)
  // Hard totals (no ace counted as 11)
  if (playerScore <= 8) {
    return 'Hit'
  }
  
  if (playerScore === 9) {
    // With high count (+3 or higher), double down against dealer 2
    if (trueCount >= 3 && dealerCard === 2 && canDoubleDown) {
      return 'Double Down'
    }
    // Standard basic strategy
    if (dealerCard >= 3 && dealerCard <= 6 && canDoubleDown) {
      return 'Double Down'
    }
    return 'Hit'
  }
  
  if (playerScore === 10) {
    // With high count (+4 or higher), double down against dealer A
    if (trueCount >= 4 && dealerCard === 11 && canDoubleDown) {
      return 'Double Down'
    }
    // Standard basic strategy
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
    // With high count (+3 or higher), stand against dealer 3
    if (trueCount >= 3 && dealerCard === 3) {
      return 'Stand'
    }
    // With high count (+2 or higher), stand against dealer 2
    if (trueCount >= 2 && dealerCard === 2) {
      return 'Stand'
    }
    // Standard basic strategy
    if (dealerCard >= 4 && dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore === 13) {
    // With high count (+1 or higher), stand against dealer 2
    if (trueCount >= 1 && dealerCard === 2) {
      return 'Stand'
    }
    // Standard basic strategy
    if (dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore === 14) {
    // With high count (+3 or higher), stand against dealer 10
    if (trueCount >= 3 && dealerCard === 10) {
      return 'Stand'
    }
    // Standard basic strategy
    if (dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore === 15) {
    // With high count (+4 or higher), stand against dealer 10
    if (trueCount >= 4 && dealerCard === 10) {
      return 'Stand'
    }
    // With high count (+3 or higher), stand against dealer 9
    if (trueCount >= 3 && dealerCard === 9) {
      return 'Stand'
    }
    // Standard basic strategy
    if (dealerCard <= 6) {
      return 'Stand'
    }
    return 'Hit'
  }
  
  if (playerScore === 16) {
    // With high count (+6 or higher), stand against dealer 10
    if (trueCount >= 6 && dealerCard === 10) {
      return 'Stand'
    }
    // With high count (+5 or higher), stand against dealer 9
    if (trueCount >= 5 && dealerCard === 9) {
      return 'Stand'
    }
    // With high count (+4 or higher), stand against dealer A
    if (trueCount >= 4 && dealerCard === 11) {
      return 'Stand'
    }
    // Standard basic strategy
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

export function GameBoard({ gameState, onHit, onStand, onNewGame, onPlaceBet, onStartGame, onDoubleDown, onRemoveBetChip, onUndoLastBet, onClearBet, onToggleCardCounting, onSplit }: GameBoardProps) {
  const { playerHand, dealerHand, playerScore, dealerScore, gameStatus, message, cardsRemaining, deckShuffled, credits, currentBet, canDoubleDown, gameResult, winnings, cardCounter, canSplit, isSplit, splitHands, currentHandIndex, splitBets, splitCount } = gameState;
  
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

  // Get card counting strategy suggestion and betting recommendation
  const dealerUpCard = dealerHand.length > 0 ? dealerHand[0].numericValue : 0
  const trueCount = cardCounter.getTrueCount()
  
  // Strategy suggestion updates in real-time during play
  const strategySuggestion = getCardCountingStrategySuggestion(playerScore, dealerUpCard, canDoubleDown, gameStatus, trueCount, isSplit, splitHands, currentHandIndex)
  
  // Betting recommendation only updates between rounds (during betting phase)
  const bettingRecommendation = gameStatus === 'betting' ? getBettingRecommendation(trueCount) : ''

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
      
      {/* Split Hands Display */}
      {/* Removed separate split panel - will integrate into main player area */}

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
                    countChange={getCardCountChange(card.value)}
                    showCountChange={cardCounter.isCounterEnabled()}
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
            <div className={`bg-green-800 rounded-lg px-6 py-3 ${isSplit ? 'mt-10' : ''}`}>
              <div className="text-white text-2xl font-bold">
                ${isSplit && splitBets.length > 0 
                  ? splitBets.reduce((sum, bet) => sum + bet, 0).toFixed(2)
                  : currentBet.toFixed(2)
                }
              </div>
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
          {/* Player's Hand */}
        <div className="text-center space-y-2 sm:space-y-4">
          
          {!isSplit && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-white text-base sm:text-lg font-semibold">Player</span>
            <div className="bg-green-600 text-white px-2 py-1 rounded text-sm sm:text-base font-bold">
              {playerScore}
            </div>
          </div>
          )}
          
          {isSplit && splitHands.length > 0 ? (
            // Split hands display - horizontal row
            <div className="space-y-2">
              <div className="text-sm text-gray-300 mb-2 mt-10">
                Split #{splitCount} of 3 - Hand {currentHandIndex + 1} of {splitHands.length}
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {splitHands.map((hand, index) => {
                  const handScore = calculateHandValue(hand)
                  const isActive = index === currentHandIndex
                  const isComplete = index < currentHandIndex
                  const handBet = splitBets[index] || currentBet
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-2 ${
                        isActive 
                          ? 'border-yellow-400 bg-yellow-900/20' 
                          : isComplete 
                            ? 'border-green-400 bg-green-900/20'
                            : 'border-gray-600 bg-gray-700/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-xs font-semibold ${
                          isActive ? 'text-yellow-300' : isComplete ? 'text-green-300' : 'text-gray-300'
                        }`}>
                          Hand {index + 1}
                          {isActive && ' (Active)'}
                          {isComplete && ' (Complete)'}
                        </span>
                        <span className="text-white text-xs">${handBet}</span>
                      </div>
                      
                      {/* Cards */}
                      <div className="flex space-x-1 mb-3 mt-10">
                        {hand.map((card, cardIndex) => (
                          <PlayingCard 
                            key={cardIndex} 
                            card={card} 
                            countChange={getCardCountChange(card.value)}
                            showCountChange={cardCounter.isCounterEnabled()}
                          />
                        ))}
                      </div>
                      
                      {/* Score */}
                      <div className="text-center">
                        <span className={`text-sm font-bold ${
                          handScore > 21 ? 'text-red-400' : handScore === 21 ? 'text-green-400' : 'text-white'
                        }`}>
                          {handScore}
                          {handScore > 21 && ' (Bust)'}
                          {handScore === 21 && ' (21)'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Regular single hand display
            <div className="flex justify-center">
              <HandDisplay 
                hand={playerHand} 
                score={playerScore}
                isDealer={false}
              />
            </div>
          )}
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
            {/* Split Button */}
            {canSplit && (
              <Button
                onClick={onSplit}
                disabled={false} // Enable the split button
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-8 text-lg rounded-lg"
              >
                Split
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
        <div className="absolute bottom-8 right-8 z-40 bg-gray-900 rounded-lg px-4 py-3 flex flex-col items-start shadow-lg border border-gray-700">
          <span className="text-green-300 text-xs font-mono">Running Count: <span className="font-bold">{cardCounter.getRunningCount()}</span></span>
          <span className="text-blue-300 text-xs font-mono">True Count: <span className="font-bold">{cardCounter.getTrueCount().toFixed(2)}</span></span>
          
          {/* Betting Recommendation - Only show during betting phase */}
          {isBetting && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <span className="text-white text-xs font-semibold">Bet Suggestion:</span>
              <div className={`text-sm font-bold ${
                trueCount >= 3 ? 'text-green-400' : 
                trueCount >= 1 ? 'text-yellow-400' : 
                trueCount >= -1 ? 'text-white' : 
                trueCount >= -3 ? 'text-orange-400' : 
                'text-red-400'
              }`}>
                {bettingRecommendation}
              </div>
            </div>
          )}
          
          {/* Strategy Suggestion Box - Show during active play */}
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