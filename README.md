# Blackjack Game

A classic blackjack game built with Next.js and shadcn/ui components. Play against the dealer in this single-player card game.

## Features

- **Classic Blackjack Rules**: Standard casino blackjack gameplay
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Built with shadcn/ui and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **Real-time Game State**: React hooks for state management

## Game Rules

- **Objective**: Beat the dealer by getting closer to 21 without going over
- **Card Values**: 
  - Number cards (2-10): Face value
  - Face cards (J, Q, K): 10 points
  - Ace: 1 or 11 points (whichever is better for your hand)
- **Dealer Rules**: Dealer must hit on soft 17 and stand on hard 17 or higher

### Game Actions
- **Hit**: Take another card from the deck
- **Stand**: Keep your current hand and end your turn
- **New Game**: Start a fresh game with a new deck

### Winning Conditions
- **Blackjack**: Natural 21 with first two cards (Ace + 10-value card)
- **Win**: Your hand is closer to 21 than the dealer's
- **Push**: Both you and dealer have the same total (tie)
- **Bust**: Your hand exceeds 21 (automatic loss)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blackjack-game
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
blackjack-game/
├── app/
│   └── page.tsx              # Main game page
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── GameBoard.tsx         # Main game interface
│   ├── HandDisplay.tsx       # Player/dealer hand display
│   └── PlayingCard.tsx       # Individual card component
├── lib/
│   ├── gameLogic.ts          # Game state and logic
│   └── utils.ts              # Utility functions
├── package.json
├── tailwind.config.js
└── next.config.js
```

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **React Hooks**: State management with useReducer

## Game Logic

The game uses a reducer pattern for state management:

- **Game State**: Tracks hands, scores, deck, and game status
- **Actions**: NEW_GAME, HIT, STAND
- **Card Logic**: Proper Ace value calculation (1 or 11)
- **Dealer AI**: Follows standard blackjack rules

## Customization

### Styling
- Modify `tailwind.config.js` for theme changes
- Update component styles in individual files
- Add animations with Tailwind CSS classes

### Game Rules
- Edit `lib/gameLogic.ts` to modify game behavior
- Adjust dealer AI logic in `handleStand` function
- Add new game features like betting or multiple decks

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- shadcn/ui for the excellent component library
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach 