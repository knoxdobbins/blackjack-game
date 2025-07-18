import { CardCounter } from './cardCounter'

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  value: string
  numericValue: number
  isHidden?: boolean
}

export interface GameState {
  playerHand: Card[]
  dealerHand: Card[]
  deck: Card[]
  gameStatus: 'waiting' | 'betting' | 'playing' | 'dealer-turn' | 'finished'
  playerScore: number
  dealerScore: number
  message: string
  cardsRemaining: number
  deckShuffled: boolean
  credits: number
  currentBet: number
  selectedChips: { [amount: number]: number } // Track individual chip selections
  canDoubleDown: boolean
  isDoubleDown: boolean
  gameResult?: 'win' | 'lose' | 'tie' | null // Track the result of the last round
  winnings?: number // Track winnings from the last round
  cardCounter: CardCounter // Card counting system
  // Add this for debugging card counts
  cardCounts?: { [key: string]: number }
  // Split functionality
  splitHands: Card[][]
  currentHandIndex: number
  splitBets: number[]
  canSplit: boolean
  isSplit: boolean
  splitCount: number // Track how many times we've split (max 3)
}

export type GameAction = 
  | { type: 'NEW_GAME' }
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'REMOVE_BET_CHIP'; amount: number }
  | { type: 'UNDO_LAST_BET' }
  | { type: 'CLEAR_BET' }
  | { type: 'START_GAME' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE_DOWN' }
  | { type: 'TOGGLE_CARD_COUNTING' }
  | { type: 'SPLIT' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return initializeGame(state.credits)
    case 'PLACE_BET':
      return handlePlaceBet(state, action.amount)
    case 'REMOVE_BET_CHIP':
      return handleRemoveBetChip(state, action.amount)
    case 'UNDO_LAST_BET':
      return handleUndoLastBet(state)
    case 'CLEAR_BET':
      return handleClearBet(state)
    case 'START_GAME':
      return startGame(state)
    case 'HIT':
      return handleHit(state)
    case 'STAND':
      return handleStand(state)
    case 'DOUBLE_DOWN':
      return handleDoubleDown(state)
    case 'TOGGLE_CARD_COUNTING':
      return handleToggleCardCounting(state)
    case 'SPLIT':
      return handleSplit(state)
    default:
      return state
  }
}

export function initializeGame(currentCredits: number = 1000): GameState {
  return {
    playerHand: [],
    dealerHand: [],
    deck: [],
    gameStatus: 'betting',
    playerScore: 0,
    dealerScore: 0,
    message: `Place your bet! You have $${currentCredits} credits.`,
    cardsRemaining: 0,
    deckShuffled: false,
    credits: currentCredits,
    currentBet: 0,
    selectedChips: {},
    canDoubleDown: false,
    isDoubleDown: false,
    gameResult: null,
    winnings: 0,
    cardCounter: (() => {
      const counter = new CardCounter(2) // 2 decks as per the game setup
      counter.setEnabled(true) // Enable card counting by default
      return counter
    })(),
    // Initialize split properties
    splitHands: [],
    currentHandIndex: 0,
    splitBets: [],
    canSplit: false,
    isSplit: false,
    splitCount: 0
  }
}

function handlePlaceBet(state: GameState, amount: number): GameState {
  if (state.gameStatus !== 'betting') return state
  
  const newBet = state.currentBet + amount
  const newCredits = state.credits - amount
  
  if (newCredits < 0) {
    return {
      ...state,
      message: 'Not enough credits!'
    }
  }
  
  // Update selected chips
  const newSelectedChips = { ...state.selectedChips }
  newSelectedChips[amount] = (newSelectedChips[amount] || 0) + 1
  
  return {
    ...state,
    currentBet: newBet,
    credits: newCredits,
    selectedChips: newSelectedChips,
    message: `Bet placed: $${newBet}. Click "Deal" to start!`
  }
}

function handleRemoveBetChip(state: GameState, amount: number): GameState {
  if (state.gameStatus !== 'betting') return state
  if (!state.selectedChips[amount] || state.selectedChips[amount] <= 0) return state

  const newSelectedChips = { ...state.selectedChips }
  newSelectedChips[amount] -= 1
  if (newSelectedChips[amount] === 0) {
    delete newSelectedChips[amount]
  }

  const newBet = state.currentBet - amount
  const newCredits = state.credits + amount

  return {
    ...state,
    currentBet: newBet,
    credits: newCredits,
    selectedChips: newSelectedChips,
    message: newBet > 0 ? `Bet placed: $${newBet}. Click "Deal" to start!` : 'Place your bet!'
  }
}

function handleUndoLastBet(state: GameState): GameState {
  if (state.gameStatus !== 'betting') return state
  if (state.currentBet === 0) return state

  // Find the last chip that was placed (highest amount with count > 0)
  const chipAmounts = Object.keys(state.selectedChips)
    .map(Number)
    .filter(amount => state.selectedChips[amount] > 0)
    .sort((a, b) => b - a) // Sort in descending order

  if (chipAmounts.length === 0) return state

  const lastChipAmount = chipAmounts[0]
  return handleRemoveBetChip(state, lastChipAmount)
}

function handleClearBet(state: GameState): GameState {
  if (state.gameStatus !== 'betting') return state
  if (state.currentBet === 0) return state

  return {
    ...state,
    currentBet: 0,
    credits: state.credits + state.currentBet,
    selectedChips: {},
    message: 'Place your bet!'
  }
}

function handleToggleCardCounting(state: GameState): GameState {
  const newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
  newCardCounter.setEnabled(!state.cardCounter.isCounterEnabled())
  
  return {
    ...state,
    cardCounter: newCardCounter
  }
}

// Helper function to check if splitting is possible
function canSplitHand(hand: Card[], credits: number, currentBet: number, splitCount: number): boolean {
  // Must have exactly 2 cards
  if (hand.length !== 2) return false
  
  // Must have enough credits for equal bet
  if (credits < currentBet) return false
  
  // Maximum 3 splits allowed (4 total hands)
  if (splitCount >= 3) return false
  
  // Cards must have the same value (10, J, Q, K all count as 10)
  const value1 = hand[0].numericValue
  const value2 = hand[1].numericValue
  
  // Handle face cards (J, Q, K) and 10s
  const normalizedValue1 = value1 >= 10 ? 10 : value1
  const normalizedValue2 = value2 >= 10 ? 10 : value2
  
  return normalizedValue1 === normalizedValue2
}

function startGame(state: GameState): GameState {
  if (state.gameStatus !== 'betting' || state.currentBet === 0) return state
  
  // Use existing deck if it has enough cards, otherwise create a new one
  let deck = state.deck.length > 30 ? [...state.deck] : createDeck()
  let shuffledDeck = state.deck.length > 30 ? deck : shuffleDeck(deck)
  let deckShuffled = state.deck.length <= 30 // Only mark as shuffled if we created a new deck
  
  const playerHand = [shuffledDeck.pop()!, shuffledDeck.pop()!]
  const dealerHand = [shuffledDeck.pop()!, shuffledDeck.pop()!]
  
  // Hide dealer's second card
  dealerHand[1] = { ...dealerHand[1], isHidden: true }
  
  // Handle card counter - preserve existing count unless deck was shuffled
  let newCardCounter: CardCounter
  if (deckShuffled) {
    // Deck was just shuffled, reset the counter
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
  } else {
    // Same deck, preserve existing counter state
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
    // Restore the previous count state
    const previousState = state.cardCounter.getState()
    newCardCounter.restoreState(previousState)
  }
  
  // Process the dealt cards
  playerHand.forEach(card => newCardCounter.processCard(card.value))
  dealerHand.forEach(card => newCardCounter.processCard(card.value))
  
  const playerScore = calculateHandValue(playerHand)
  const dealerScore = calculateHandValue(dealerHand)
  
  // Check for blackjack
  const playerBlackjack = isBlackjack(playerHand)
  const dealerBlackjack = isBlackjack(dealerHand)
  
  let gameStatus: GameState['gameStatus'] = 'playing'
  let message = 'Your turn!'
  let gameResult: 'win' | 'lose' | 'tie' | null = null
  let winnings = 0
  let canDoubleDown = false
  let canSplit = false
  
  if (playerBlackjack && dealerBlackjack) {
    gameStatus = 'betting'
    message = 'Push! Both you and dealer have blackjack.'
    gameResult = 'tie'
    winnings = 0
  } else if (playerBlackjack) {
    gameStatus = 'betting'
    message = 'Blackjack! You win!'
    gameResult = 'win'
    winnings = state.currentBet + Math.floor(state.currentBet * 1.5)
  } else if (dealerBlackjack) {
    gameStatus = 'betting'
    message = 'Dealer has blackjack! You lose.'
    gameResult = 'lose'
    winnings = -state.currentBet
  } else {
    // Check if player can double down (only on first two cards)
    canDoubleDown = playerHand.length === 2 && state.credits >= state.currentBet
    
    // Check if player can split
    canSplit = canSplitHand(playerHand, state.credits, state.currentBet, state.splitCount)
  }
  
  return {
    ...state,
    playerHand,
    dealerHand,
    deck: shuffledDeck,
    gameStatus,
    playerScore,
    dealerScore,
    message,
    cardsRemaining: shuffledDeck.length,
    deckShuffled,
    canDoubleDown,
    canSplit,
    isDoubleDown: false,
    gameResult,
    winnings,
    selectedChips: gameStatus === 'betting' ? {} : state.selectedChips,
    cardCounter: newCardCounter,
    // Reset split state for new game
    splitHands: [],
    currentHandIndex: 0,
    splitBets: [],
    isSplit: false
  }
}

function handleDoubleDown(state: GameState): GameState {
  if (state.gameStatus !== 'playing' || !state.canDoubleDown) return state
  
  // Check if player has enough credits for double down
  if (state.credits < state.currentBet) {
    return {
      ...state,
      message: 'Not enough credits to double down!'
    }
  }

  let newDeck = [...state.deck]
  let deckShuffled = state.deckShuffled
  
  // Check if we need to reshuffle
  if (newDeck.length <= 30) {
    newDeck = shuffleDeck(createDeck())
    deckShuffled = true
  }
  
  const newCard = newDeck.pop()!
  const newPlayerHand = [...state.playerHand, newCard]
  const newPlayerScore = calculateHandValue(newPlayerHand)
  
  // Handle card counter
  let newCardCounter: CardCounter
  if (deckShuffled && !state.deckShuffled) {
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
  } else {
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
    const previousState = state.cardCounter.getState()
    newCardCounter.restoreState(previousState)
  }
  
  // Process the new card
  newCardCounter.processCard(newCard.value)
  
  // Deduct the double down bet
  const newCredits = state.credits - state.currentBet
  const doubleDownBet = state.currentBet * 2
  
  // Handle split hands double down
  if (state.isSplit) {
    // Update the current split hand
    const updatedSplitHands = [...state.splitHands]
    updatedSplitHands[state.currentHandIndex] = newPlayerHand
    
    // Update the bet for this hand
    const updatedSplitBets = [...state.splitBets]
    updatedSplitBets[state.currentHandIndex] = doubleDownBet
    
    let message = ''
    let gameStatus: GameState['gameStatus'] = 'playing'
    
    if (newPlayerScore > 21) {
      message = `Hand ${state.currentHandIndex + 1} double down bust!`
    } else if (newPlayerScore === 21) {
      message = `Hand ${state.currentHandIndex + 1} double down 21!`
    } else {
      message = `Hand ${state.currentHandIndex + 1} double down complete.`
    }
    
    // Check if there are more hands to play
    if (state.currentHandIndex < state.splitHands.length - 1) {
      // Move to next split hand
      const nextHandIndex = state.currentHandIndex + 1
      const nextHand = state.splitHands[nextHandIndex]
      const nextHandScore = calculateHandValue(nextHand)
      
      return {
        ...state,
        playerHand: nextHand,
        splitHands: updatedSplitHands,
        splitBets: updatedSplitBets,
        currentHandIndex: nextHandIndex,
        playerScore: nextHandScore,
        currentBet: state.splitBets[nextHandIndex],
        canDoubleDown: nextHand.length === 2 && newCredits >= state.splitBets[nextHandIndex],
        deck: newDeck,
        cardsRemaining: newDeck.length,
        deckShuffled,
        credits: newCredits,
        cardCounter: newCardCounter,
        message: `${message} Playing Hand ${nextHandIndex + 1}`
      }
    } else {
      // All split hands are done, move to dealer's turn
      return handleStand({
        ...state,
        playerHand: newPlayerHand,
        splitHands: updatedSplitHands,
        splitBets: updatedSplitBets,
        deck: newDeck,
        playerScore: newPlayerScore,
        cardsRemaining: newDeck.length,
        deckShuffled,
        credits: newCredits,
        cardCounter: newCardCounter
      })
    }
  } else {
    // Regular double down
    if (newPlayerScore > 21) {
      const canContinuePlaying = newCredits > 0
      const gameStatus = canContinuePlaying ? 'betting' : 'finished'
      const message = canContinuePlaying 
        ? 'Double down bust! You lose! Place your next bet!'
        : 'Double down bust! You lose! Game Over - No credits left!'
      
      return {
        ...state,
        playerHand: newPlayerHand,
        deck: newDeck,
        gameStatus,
        playerScore: newPlayerScore,
        message,
        cardsRemaining: newDeck.length,
        deckShuffled,
        credits: newCredits,
        currentBet: 0,
        selectedChips: {},
        canDoubleDown: false,
        isDoubleDown: true,
        gameResult: 'lose',
        winnings: -doubleDownBet,
        cardCounter: newCardCounter
      }
    } else {
      // Automatically trigger dealer's turn when player double downs
      return handleStand({
        ...state,
        playerHand: newPlayerHand,
        deck: newDeck,
        playerScore: newPlayerScore,
        cardsRemaining: newDeck.length,
        deckShuffled,
        credits: newCredits,
        currentBet: doubleDownBet,
        isDoubleDown: true,
        cardCounter: newCardCounter
      })
    }
  }
}

function handleHit(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state
  
  let newDeck = [...state.deck]
  let newMessage = state.message
  let deckShuffled = state.deckShuffled
  
  // Check if we need to reshuffle (30 or fewer cards left)
  if (newDeck.length <= 30) {
    newDeck = shuffleDeck(createDeck())
    newMessage = 'Deck reshuffled! Your turn! Hit or Stand?'
    deckShuffled = true
  }
  
  const newCard = newDeck.pop()!
  const newPlayerHand = [...state.playerHand, newCard]
  const newPlayerScore = calculateHandValue(newPlayerHand)
  
  // Handle card counter - preserve existing count unless deck was shuffled
  let newCardCounter: CardCounter
  if (deckShuffled && !state.deckShuffled) {
    // Deck was just shuffled, reset the counter
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
  } else {
    // Same deck, preserve existing counter state
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
    // Restore the previous count state
    const previousState = state.cardCounter.getState()
    newCardCounter.restoreState(previousState)
  }
  
  // Process the new card
  newCardCounter.processCard(newCard.value)
  
  let newGameStatus: GameState['gameStatus'] = state.gameStatus
  
  if (newPlayerScore > 21) {
    // Handle bust for split hands
    if (state.isSplit) {
      // Update the current split hand
      const updatedSplitHands = [...state.splitHands]
      updatedSplitHands[state.currentHandIndex] = newPlayerHand
      
      // Check if there are more hands to play
      if (state.currentHandIndex < state.splitHands.length - 1) {
        // Move to next split hand
        const nextHandIndex = state.currentHandIndex + 1
        const nextHand = state.splitHands[nextHandIndex]
        const nextHandScore = calculateHandValue(nextHand)
        
        return {
          ...state,
          playerHand: nextHand,
          splitHands: updatedSplitHands,
          currentHandIndex: nextHandIndex,
          playerScore: nextHandScore,
          currentBet: state.splitBets[nextHandIndex],
          canDoubleDown: nextHand.length === 2 && state.credits >= state.splitBets[nextHandIndex],
          deck: newDeck,
          cardsRemaining: newDeck.length,
          deckShuffled,
          cardCounter: newCardCounter,
          message: `Hand ${state.currentHandIndex + 1} bust! Playing Hand ${nextHandIndex + 1}`
        }
      } else {
        // All split hands are done, move to dealer's turn
        return handleStand({
          ...state,
          playerHand: newPlayerHand,
          splitHands: updatedSplitHands,
          deck: newDeck,
          playerScore: newPlayerScore,
          cardsRemaining: newDeck.length,
          deckShuffled,
          cardCounter: newCardCounter
        })
      }
    } else {
      // Regular hand bust
      const canContinuePlaying = state.credits > 0
      newGameStatus = canContinuePlaying ? 'betting' : 'finished'
      newMessage = canContinuePlaying 
        ? 'Bust! You lose! Place your next bet!'
        : 'Bust! You lose! Game Over - No credits left!'
      
      return {
        ...state,
        playerHand: newPlayerHand,
        deck: newDeck,
        gameStatus: newGameStatus,
        playerScore: newPlayerScore,
        message: newMessage,
        cardsRemaining: newDeck.length,
        deckShuffled,
        canDoubleDown: false,
        gameResult: 'lose',
        winnings: -state.currentBet, // Show the amount lost (negative)
        currentBet: newGameStatus === 'betting' ? 0 : state.currentBet,
        selectedChips: newGameStatus === 'betting' ? {} : state.selectedChips,
        cardCounter: newCardCounter
      }
    }
  } else if (newPlayerScore === 21) {
    // Automatically trigger dealer's turn when player gets 21
    if (state.isSplit) {
      // Update the current split hand
      const updatedSplitHands = [...state.splitHands]
      updatedSplitHands[state.currentHandIndex] = newPlayerHand
      
      // Check if there are more hands to play
      if (state.currentHandIndex < state.splitHands.length - 1) {
        // Move to next split hand
        const nextHandIndex = state.currentHandIndex + 1
        const nextHand = state.splitHands[nextHandIndex]
        const nextHandScore = calculateHandValue(nextHand)
        
        return {
          ...state,
          playerHand: nextHand,
          splitHands: updatedSplitHands,
          currentHandIndex: nextHandIndex,
          playerScore: nextHandScore,
          currentBet: state.splitBets[nextHandIndex],
          canDoubleDown: nextHand.length === 2 && state.credits >= state.splitBets[nextHandIndex],
          deck: newDeck,
          cardsRemaining: newDeck.length,
          deckShuffled,
          cardCounter: newCardCounter,
          message: `Hand ${state.currentHandIndex + 1} got 21! Playing Hand ${nextHandIndex + 1}`
        }
      } else {
        // All split hands are done, move to dealer's turn
        return handleStand({
          ...state,
          playerHand: newPlayerHand,
          splitHands: updatedSplitHands,
          deck: newDeck,
          playerScore: newPlayerScore,
          cardsRemaining: newDeck.length,
          deckShuffled,
          cardCounter: newCardCounter
        })
      }
    } else {
      return handleStand({
        ...state,
        playerHand: newPlayerHand,
        deck: newDeck,
        playerScore: newPlayerScore,
        cardsRemaining: newDeck.length,
        deckShuffled,
        cardCounter: newCardCounter
      })
    }
  } else {
    newMessage = newMessage || 'Your turn! Hit or Stand?'
  }
  
  // Update the current split hand if this is a split
  if (state.isSplit) {
    const updatedSplitHands = [...state.splitHands]
    updatedSplitHands[state.currentHandIndex] = newPlayerHand
    
    // Check if we can split the current hand (resplit)
    const canResplit = canSplitHand(newPlayerHand, state.credits, state.currentBet, state.splitCount)
    
    return {
      ...state,
      playerHand: newPlayerHand,
      splitHands: updatedSplitHands,
      canSplit: canResplit, // Update canSplit for resplitting
      deck: newDeck,
      gameStatus: newGameStatus,
      playerScore: newPlayerScore,
      message: newMessage,
      cardsRemaining: newDeck.length,
      deckShuffled,
      canDoubleDown: false, // Can't double down after hitting
      cardCounter: newCardCounter
    }
  }
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck: newDeck,
    gameStatus: newGameStatus,
    playerScore: newPlayerScore,
    message: newMessage,
    cardsRemaining: newDeck.length,
    deckShuffled,
    canDoubleDown: false, // Can't double down after hitting
    cardCounter: newCardCounter
  }
}

function handleStand(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state
  
  // If this is a split hand, check if there are more hands to play
  if (state.isSplit && state.currentHandIndex < state.splitHands.length - 1) {
    // Move to next split hand
    const nextHandIndex = state.currentHandIndex + 1
    const nextHand = state.splitHands[nextHandIndex]
    const nextHandScore = calculateHandValue(nextHand)
    
    return {
      ...state,
      playerHand: nextHand,
      currentHandIndex: nextHandIndex,
      playerScore: nextHandScore,
      currentBet: state.splitBets[nextHandIndex],
      canDoubleDown: nextHand.length === 2 && state.credits >= state.splitBets[nextHandIndex],
      message: `Playing Hand ${nextHandIndex + 1}`
    }
  }
  
  // If this is the last split hand or not a split, move to dealer's turn
  const gameStatus: GameState['gameStatus'] = 'dealer-turn'
  
  // Reveal dealer's hidden card
  const currentDealerHand = [...state.dealerHand]
  currentDealerHand[1] = { ...currentDealerHand[1], isHidden: false }
  
  let currentDeck = [...state.deck]
  let deckShuffled = state.deckShuffled
  
  // Dealer plays according to house rules (hit on 16 or less, stand on 17 or more)
  while (calculateHandValue(currentDealerHand) < 17) {
    // Check if we need to reshuffle
    if (currentDeck.length <= 30) {
      currentDeck = shuffleDeck(createDeck())
      deckShuffled = true
    }
    
    const newCard = currentDeck.pop()!
    currentDealerHand.push(newCard)
  }

  // Handle card counter - preserve existing count unless deck was shuffled
  let newCardCounter: CardCounter
  if (deckShuffled && !state.deckShuffled) {
    // Deck was just shuffled, reset the counter
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
  } else {
    // Same deck, preserve existing counter state
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
    // Restore the previous count state
    const previousState = state.cardCounter.getState()
    newCardCounter.restoreState(previousState)
  }
  
  // Process the dealer's hidden card (second card) when it becomes visible
  newCardCounter.processCard(currentDealerHand[1].value)
  
  // Process any additional dealer cards (cards beyond the first two)
  for (let i = 2; i < currentDealerHand.length; i++) {
    newCardCounter.processCard(currentDealerHand[i].value)
  }

  const finalDealerScore = calculateHandValue(currentDealerHand)
  
  // Handle split hands vs dealer
  if (state.isSplit) {
    return handleSplitHandResults(state, currentDealerHand, finalDealerScore, currentDeck, deckShuffled, newCardCounter)
  } else {
    // Regular single hand vs dealer
    const finalPlayerScore = state.playerScore
    
    // Determine winner and calculate winnings
    let message = ''
    let newCredits = state.credits
    let winnings = 0
    let gameResult: 'win' | 'lose' | 'tie' = 'lose'
    
    if (finalDealerScore > 21) {
      message = 'Dealer busts! You win!'
      winnings = state.currentBet * 2 // 2x your bet (your bet + your winnings)
      newCredits += winnings
      gameResult = 'win'
    } else if (finalPlayerScore > finalDealerScore) {
      message = 'You win!'
      winnings = state.currentBet * 2 // 2x your bet (your bet + your winnings)
      newCredits += winnings
      gameResult = 'win'
    } else if (finalDealerScore > finalPlayerScore) {
      message = 'Dealer wins!'
      // Player loses their bet (already deducted)
      gameResult = 'lose'
      winnings = -state.currentBet // Show the amount lost (negative)
    } else {
      message = 'Push! It\'s a tie!'
      // Return the bet
      newCredits += state.currentBet
      gameResult = 'tie'
    }
    
    // Check if player has enough credits to continue playing
    const canContinuePlaying = newCredits > 0
    
    return {
      ...state,
      dealerHand: currentDealerHand,
      deck: currentDeck,
      gameStatus: canContinuePlaying ? 'betting' : 'finished',
      dealerScore: finalDealerScore,
      message: canContinuePlaying 
        ? `${winnings > 0 ? `${message} You won $${winnings}!` : message} Place your next bet!`
        : `${winnings > 0 ? `${message} You won $${winnings}!` : message} Game Over - No credits left!`,
      cardsRemaining: currentDeck.length,
      deckShuffled,
      credits: newCredits,
      currentBet: 0,
      selectedChips: {},
      canDoubleDown: false,
      isDoubleDown: false,
      gameResult,
      winnings,
      cardCounter: newCardCounter
    }
  }
}

function handleSplit(state: GameState): GameState {
  if (state.gameStatus !== 'playing' || !state.canSplit || state.isSplit) return state
  
  // Check if player has enough credits for split
  if (state.credits < state.currentBet) {
    return {
      ...state,
      message: 'Not enough credits to split!'
    }
  }

  // Create two split hands from the original pair
  const card1 = state.playerHand[0]
  const card2 = state.playerHand[1]
  
  // Create split hands
  const splitHand1 = [card1]
  const splitHand2 = [card2]
  
  // Deal one card to each split hand
  let newDeck = [...state.deck]
  let deckShuffled = state.deckShuffled
  
  // Check if we need to reshuffle
  if (newDeck.length <= 30) {
    newDeck = shuffleDeck(createDeck())
    deckShuffled = true
  }
  
  const newCard1 = newDeck.pop()!
  const newCard2 = newDeck.pop()!
  
  splitHand1.push(newCard1)
  splitHand2.push(newCard2)
  
  // Handle card counter
  let newCardCounter: CardCounter
  if (deckShuffled && !state.deckShuffled) {
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
  } else {
    newCardCounter = new CardCounter(state.cardCounter.getState().totalDecks)
    newCardCounter.setEnabled(state.cardCounter.isCounterEnabled())
    const previousState = state.cardCounter.getState()
    newCardCounter.restoreState(previousState)
  }
  
  // Process the new cards
  newCardCounter.processCard(newCard1.value)
  newCardCounter.processCard(newCard2.value)
  
  // Calculate scores
  const score1 = calculateHandValue(splitHand1)
  const score2 = calculateHandValue(splitHand2)
  
  // Check for blackjack on either hand
  const isBlackjack1 = isBlackjack(splitHand1)
  const isBlackjack2 = isBlackjack(splitHand2)
  
  // Check if this is an Ace split
  const isAceSplit = card1.value === 'A' && card2.value === 'A'
  
  // Update split count
  const newSplitCount = state.splitCount + 1
  
  // For Ace splits, automatically move to next hand if current hand is complete
  let nextHandIndex = 0
  let nextHand = splitHand1
  let nextHandScore = score1
  let message = 'Split complete. Playing Hand 1.'
  
  if (isAceSplit) {
    // Ace splits get only one card each, no more hits
    if (isBlackjack1) {
      message = 'Split Hand 1 Blackjack!'
    } else {
      message = 'Split Hand 1 complete (Ace split - one card only).'
    }
    
    // If there's a second hand, move to it
    if (splitHand2.length > 0) {
      nextHandIndex = 1
      nextHand = splitHand2
      nextHandScore = score2
      message += ' Playing Hand 2.'
    }
  } else if (isBlackjack1) {
    message = 'Split Hand 1 Blackjack!'
  }
  
  return {
    ...state,
    playerHand: nextHand, // Start with appropriate hand
    splitHands: [splitHand1, splitHand2],
    currentHandIndex: nextHandIndex,
    splitBets: [state.currentBet, state.currentBet],
    canSplit: !isAceSplit && canSplitHand(nextHand, state.credits - state.currentBet, state.currentBet, newSplitCount), // No resplitting on Ace splits
    isSplit: true,
    splitCount: newSplitCount,
    playerScore: nextHandScore,
    deck: newDeck,
    cardsRemaining: newDeck.length,
    deckShuffled,
    credits: state.credits - state.currentBet, // Deduct the second bet
    currentBet: state.currentBet, // Keep original bet for first hand
    cardCounter: newCardCounter,
    message
  }
}

// Helper function to handle split hand results
function handleSplitHandResults(
  state: GameState, 
  dealerHand: Card[], 
  dealerScore: number, 
  deck: Card[], 
  deckShuffled: boolean,
  cardCounter: CardCounter
): GameState {
  let totalWinnings = 0
  let results: string[] = []
  
  // Evaluate each split hand against dealer
  for (let i = 0; i < state.splitHands.length; i++) {
    const hand = state.splitHands[i]
    const handScore = calculateHandValue(hand)
    const handBet = state.splitBets[i]
    
    if (handScore > 21) {
      results.push(`Hand ${i + 1}: Bust (lose $${handBet})`)
      totalWinnings -= handBet
    } else if (dealerScore > 21) {
      results.push(`Hand ${i + 1}: Win (dealer bust, win $${handBet})`)
      totalWinnings += handBet
    } else if (handScore > dealerScore) {
      results.push(`Hand ${i + 1}: Win (win $${handBet})`)
      totalWinnings += handBet
    } else if (dealerScore > handScore) {
      results.push(`Hand ${i + 1}: Lose (lose $${handBet})`)
      totalWinnings -= handBet
    } else {
      results.push(`Hand ${i + 1}: Push (tie, bet returned)`)
      // Push doesn't change total winnings
    }
  }
  
  const newCredits = state.credits + totalWinnings
  const canContinuePlaying = newCredits > 0
  const gameResult: 'win' | 'lose' | 'tie' = totalWinnings > 0 ? 'win' : totalWinnings < 0 ? 'lose' : 'tie'
  
  return {
    ...state,
    dealerHand,
    deck,
    gameStatus: canContinuePlaying ? 'betting' : 'finished',
    dealerScore,
    message: canContinuePlaying 
      ? `${results.join(', ')}. ${totalWinnings > 0 ? `Total winnings: $${totalWinnings}` : totalWinnings < 0 ? `Total loss: $${Math.abs(totalWinnings)}` : 'Push - no change'}. Place your next bet!`
      : `${results.join(', ')}. ${totalWinnings > 0 ? `Total winnings: $${totalWinnings}` : totalWinnings < 0 ? `Total loss: $${Math.abs(totalWinnings)}` : 'Push - no change'}. Game Over - No credits left!`,
    cardsRemaining: deck.length,
    deckShuffled,
    credits: newCredits,
    currentBet: 0,
    selectedChips: {},
    canDoubleDown: false,
    isDoubleDown: false,
    gameResult,
    winnings: totalWinnings,
    cardCounter,
    // Reset split state
    splitHands: [],
    currentHandIndex: 0,
    splitBets: [],
    isSplit: false
  }
}

function createDeck(): Card[] {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const deck: Card[] = []
  
  // Create 2 full decks (104 cards total)
  for (let deckCount = 0; deckCount < 2; deckCount++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          suit,
          value,
          numericValue: getNumericValue(value)
        })
      }
    }
  }
  
  return deck
}

function getNumericValue(value: string): number {
  if (value === 'A') return 11
  if (['J', 'Q', 'K'].includes(value)) return 10
  return parseInt(value)
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateHandValue(hand: Card[]): number {
  let total = 0
  let aces = 0
  
  // First pass: add up all non-ace cards
  for (const card of hand) {
    if (card.value === 'A') {
      aces++
    } else {
      total += card.numericValue
    }
  }
  
  // Second pass: add aces, treating them as 11 if possible, otherwise 1
  for (let i = 0; i < aces; i++) {
    if (total + 11 <= 21) {
      total += 11
    } else {
      total += 1
    }
  }
  
  return total
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

export function isBust(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21
} 

// Add this helper function after the existing functions
function countCardInDeck(deck: Card[], suit: string, value: string): number {
  return deck.filter(card => card.suit === suit && card.value === value).length
} 