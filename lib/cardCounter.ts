export interface CardCounterState {
  runningCount: number
  cardsSeen: number
  decksRemaining: number
  totalDecks: number
  isEnabled: boolean
}

export class CardCounter {
  private state: CardCounterState

  constructor(totalDecks: number = 6) {
    this.state = {
      runningCount: 0,
      cardsSeen: 0,
      decksRemaining: totalDecks,
      totalDecks,
      isEnabled: false
    }
  }

  resetCount(totalDecks: number = 6): void {
    this.state = {
      runningCount: 0,
      cardsSeen: 0,
      decksRemaining: totalDecks,
      totalDecks,
      isEnabled: this.state.isEnabled
    }
  }

  restoreState(state: CardCounterState): void {
    this.state = { ...state }
  }

  toggleEnabled(): void {
    this.state.isEnabled = !this.state.isEnabled
    if (this.state.isEnabled) {
      this.resetCount(this.state.totalDecks)
    }
  }

  setEnabled(enabled: boolean): void {
    this.state.isEnabled = enabled
    if (enabled) {
      this.resetCount(this.state.totalDecks)
    }
  }

  cardValueToCount(cardValue: string): number {
    const numericValue = this.getNumericValueForCounting(cardValue)
    
    if (numericValue >= 2 && numericValue <= 6) {
      return +1  // Low cards
    } else if (numericValue >= 7 && numericValue <= 9) {
      return 0   // Neutral cards
    } else {
      return -1  // High cards (10, J, Q, K, A)
    }
  }

  private getNumericValueForCounting(value: string): number {
    if (value === 'A') return 14  // Ace is high
    if (['J', 'Q', 'K'].includes(value)) return 10  // Face cards
    return parseInt(value)
  }

  processCard(cardValue: string): void {
    if (!this.state.isEnabled) return

    this.state.runningCount += this.cardValueToCount(cardValue)
    this.state.cardsSeen += 1
    this.state.decksRemaining = (this.state.totalDecks * 52 - this.state.cardsSeen) / 52
  }

  getTrueCount(): number {
    if (!this.state.isEnabled) return 0
    
    if (this.state.decksRemaining > 0) {
      return this.state.runningCount / this.state.decksRemaining
    } else {
      return this.state.runningCount  // no decks left
    }
  }

  getState(): CardCounterState {
    return { ...this.state }
  }

  getRunningCount(): number {
    return this.state.isEnabled ? this.state.runningCount : 0
  }

  getCardsSeen(): number {
    return this.state.isEnabled ? this.state.cardsSeen : 0
  }

  getDecksRemaining(): number {
    return this.state.isEnabled ? this.state.decksRemaining : this.state.totalDecks
  }

  isCounterEnabled(): boolean {
    return this.state.isEnabled
  }
} 