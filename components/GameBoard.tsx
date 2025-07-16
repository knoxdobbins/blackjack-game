'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
    <>
      <div className="space-y-6 pb-48">
        {/* Credits and Bet Display */}
        <Card className="bg-slate-800/80 border-slate-600">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-600 hover:bg-slate-700 text-white">
                    Credits: ${credits}
                  </Badge>
                </div>
                {currentBet > 0 && (
                  <div className="flex items-center justify-between mt-2 w-56">
                    <span className="text-sm text-white/80">Current Bet:</span>
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
                variant="default"
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                New Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dealer Section */}
        <Card className="bg-slate-800/90 border-slate-600">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Dealer</CardTitle>
          </CardHeader>
          <CardContent>
            <HandDisplay
              hand={dealerHand}
              score={showDealerScore ? dealerScore : dealerHand[0]?.numericValue || 0}
              isDealer={true}
            />
          </CardContent>
        </Card>

        {/* Game Status */}
        <div className="text-center space-y-4">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <p className="text-xl font-semibold text-white">{message}</p>
            </CardContent>
          </Card>

          {/* Cards Remaining and Deck Status */}
          <div className="flex justify-center items-center gap-4">
            <Card className={`${cardsRemaining <= 30 ? 'bg-red-900/80 border-red-700' : 'bg-slate-800/80 border-slate-600'}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">
                    Cards: {cardsRemaining}
                  </span>
                  {cardsRemaining <= 30 && (
                    <span className="text-yellow-300 text-sm">
                      ⚠️ Low
                    </span>
                  )}
                </div>
                <Progress
                  value={(cardsRemaining / 104) * 100}
                  className="mt-2 h-2 bg-slate-600 text-white [&>div]:bg-green-500"
                />
              </CardContent>
            </Card>

            {deckShuffled && (
              <Card className="bg-amber-900/80 border-amber-700">
                <CardContent className="p-3">
                  <span className="text-white text-sm font-bold">
                    🔄 Deck Shuffled
                  </span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Player Section */}
        <Card className="bg-slate-800/90 border-slate-600">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Player</CardTitle>
          </CardHeader>
          <CardContent>
            <HandDisplay
              hand={playerHand}
              score={playerScore}
              isDealer={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Floating Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-600 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Betting Interface */}
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
              </div>

              {currentBet > 0 && (
                <div className="text-center">
                  <Button
                    onClick={onStartGame}
                    size="lg"
                    className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 text-lg"
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
                size="lg"
                variant="default"
                className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-3 text-lg"
              >
                Hit
              </Button>
              <Button
                onClick={onStand}
                size="lg"
                variant="secondary"
                className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3 text-lg"
              >
                Stand
              </Button>
              {canDoubleDown && (
                <Button
                  onClick={onDoubleDown}
                  disabled={credits < currentBet}
                  variant="secondary"
                  className="bg-slate-500 hover:bg-slate-600 text-white px-8 py-3 text-lg"
                >
                  Double Down
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
} 