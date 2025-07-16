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
}

export type GameAction = 
  | { type: 'NEW_GAME' }
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'REMOVE_BET_CHIP'; amount: number }
  | { type: 'START_GAME' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE_DOWN' }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return initializeGame(state.credits)
    case 'PLACE_BET':
      return handlePlaceBet(state, action.amount)
    case 'REMOVE_BET_CHIP':
      return handleRemoveBetChip(state, action.amount)
    case 'START_GAME':
      return startGame(state)
    case 'HIT':
      return handleHit(state)
    case 'STAND':
      return handleStand(state)
    case 'DOUBLE_DOWN':
      return handleDoubleDown(state)
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
    isDoubleDown: false
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
  
  const playerScore = calculateHandValue(playerHand)
  const dealerScore = calculateHandValue([dealerHand[0]]) // Only show first card
  
  // Check for natural blackjack
  const playerBlackjack = isBlackjack(playerHand)
  const dealerBlackjack = isBlackjack([dealerHand[0], dealerHand[1]])
  
  let gameStatus: GameState['gameStatus'] = 'playing'
  let message = 'Your turn! Hit, Stand, or Double Down?'
  let newCredits = state.credits
  
  if (playerBlackjack && dealerBlackjack) {
    // Return the bet
    newCredits += state.currentBet
    const canContinuePlaying = newCredits > 0
    gameStatus = canContinuePlaying ? 'betting' : 'finished'
    message = canContinuePlaying 
      ? 'Push! Both have blackjack. Place your next bet!'
      : 'Push! Both have blackjack. Game Over - No credits left!'
  } else if (playerBlackjack) {
    const winnings = Math.floor(state.currentBet * 1.5)
    newCredits += winnings
    const canContinuePlaying = newCredits > 0
    gameStatus = canContinuePlaying ? 'betting' : 'finished'
    message = canContinuePlaying 
      ? `Blackjack! You win $${winnings}! (1.5x your bet) Place your next bet!`
      : `Blackjack! You win $${winnings}! (1.5x your bet) Game Over - No credits left!`
  } else if (dealerBlackjack) {
    const canContinuePlaying = newCredits > 0
    gameStatus = canContinuePlaying ? 'betting' : 'finished'
    message = canContinuePlaying 
      ? 'Dealer has blackjack! You lose. Place your next bet!'
      : 'Dealer has blackjack! You lose. Game Over - No credits left!'
  }
  
  // Check if player can double down (only on first two cards, total 9-11)
  const canDoubleDown = playerHand.length === 2 && playerScore >= 9 && playerScore <= 11
  
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
    credits: newCredits,
    currentBet: gameStatus === 'betting' ? 0 : state.currentBet,
    selectedChips: gameStatus === 'betting' ? {} : state.selectedChips
  }
}

function handleDoubleDown(state: GameState): GameState {
  if (state.gameStatus !== 'playing' || !state.canDoubleDown || state.isDoubleDown) return state
  
  // Check if player has enough credits to double down
  if (state.credits < state.currentBet) {
    return {
      ...state,
      message: 'Not enough credits to double down!'
    }
  }
  
  // Double the bet and take one more card
  const newCredits = state.credits - state.currentBet
  const newBet = state.currentBet * 2
  
  let newDeck = [...state.deck]
  let newMessage = state.message
  let deckShuffled = state.deckShuffled
  
  // Check if we need to reshuffle
  if (newDeck.length <= 30) {
    newDeck = shuffleDeck(createDeck())
    newMessage = 'Deck reshuffled!'
    deckShuffled = true
  }
  
  const newCard = newDeck.pop()!
  const newPlayerHand = [...state.playerHand, newCard]
  const newPlayerScore = calculateHandValue(newPlayerHand)
  
  let newGameStatus: GameState['gameStatus'] = 'dealer-turn'
  let finalMessage = newMessage
  
  if (newPlayerScore > 21) {
    const canContinuePlaying = newCredits > 0
    newGameStatus = canContinuePlaying ? 'betting' : 'finished'
    finalMessage = canContinuePlaying 
      ? 'Double Down Bust! You lose. Place your next bet!'
      : 'Double Down Bust! You lose. Game Over - No credits left!'
  } else {
    finalMessage = 'Double Down! Dealer\'s turn.'
    // Automatically trigger dealer's turn when double down doesn't bust
    return handleStand({
      ...state,
      playerHand: newPlayerHand,
      deck: newDeck,
      playerScore: newPlayerScore,
      cardsRemaining: newDeck.length,
      deckShuffled,
      credits: newCredits,
      currentBet: newBet,
      canDoubleDown: false,
      isDoubleDown: true
    })
  }
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck: newDeck,
    gameStatus: newGameStatus,
    playerScore: newPlayerScore,
    message: finalMessage,
    cardsRemaining: newDeck.length,
    deckShuffled,
    credits: newCredits,
    currentBet: newBet,
    canDoubleDown: false,
    isDoubleDown: true
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
  
  let newGameStatus: GameState['gameStatus'] = state.gameStatus
  
  if (newPlayerScore > 21) {
    const canContinuePlaying = state.credits > 0
    newGameStatus = canContinuePlaying ? 'betting' : 'finished'
    newMessage = canContinuePlaying 
      ? 'Bust! You lose! Place your next bet!'
      : 'Bust! You lose! Game Over - No credits left!'
  } else if (newPlayerScore === 21) {
    // Automatically trigger dealer's turn when player gets 21
    return handleStand({
      ...state,
      playerHand: newPlayerHand,
      deck: newDeck,
      playerScore: newPlayerScore,
      cardsRemaining: newDeck.length,
      deckShuffled
    })
  } else {
    newMessage = newMessage || 'Your turn! Hit or Stand?'
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
    canDoubleDown: false // Can't double down after hitting
  }
}

function handleStand(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state
  
  // Reveal dealer's hidden card
  const revealedDealerHand = state.dealerHand.map(card => ({ ...card, isHidden: false })) as Card[]
  let currentDealerHand = revealedDealerHand
  let currentDeck = [...state.deck]
  let deckShuffled = state.deckShuffled
  
  // Dealer plays their hand
  while (calculateHandValue(currentDealerHand) < 17) {
    // Check if we need to reshuffle during dealer's turn
    if (currentDeck.length <= 30) {
      currentDeck = shuffleDeck(createDeck())
      deckShuffled = true
    }
    
    const newCard = currentDeck.pop()!
    currentDealerHand = [...currentDealerHand, newCard]
  }
  
  const finalDealerScore = calculateHandValue(currentDealerHand)
  const finalPlayerScore = state.playerScore
  
  // Determine winner and calculate winnings
  let message = ''
  let newCredits = state.credits
  let winnings = 0
  
  if (finalDealerScore > 21) {
    message = 'Dealer busts! You win!'
    winnings = state.currentBet * 2 // 2x your bet (your bet + your winnings)
    newCredits += winnings
  } else if (finalPlayerScore > finalDealerScore) {
    message = 'You win!'
    winnings = state.currentBet * 2 // 2x your bet (your bet + your winnings)
    newCredits += winnings
  } else if (finalDealerScore > finalPlayerScore) {
    message = 'Dealer wins!'
    // Player loses their bet (already deducted)
  } else {
    message = 'Push! It\'s a tie!'
    // Return the bet
    newCredits += state.currentBet
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
    isDoubleDown: false
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

function calculateHandValue(hand: Card[]): number {
  let total = 0
  let aces = 0
  
  // First pass: add up all cards, count aces (excluding hidden cards)
  for (const card of hand) {
    if (card.isHidden) continue // Skip hidden cards
    
    if (card.value === 'A') {
      aces++
      total += 11
    } else {
      total += card.numericValue
    }
  }
  
  // Second pass: adjust aces if needed
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  
  return total
}

export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

export function isBust(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21
} 