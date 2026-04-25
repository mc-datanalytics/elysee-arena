import React from 'react';
import { useGameStore } from './store/useGameStore';
import MainMenu from './components/MainMenu';
import GameBoard from './components/GameBoard';
import { AnimatePresence } from 'framer-motion';

function App() {
  const selectedPolitician = useGameStore(state => state.selectedPolitician);

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        {!selectedPolitician ? (
          <MainMenu key="main-menu" />
        ) : (
          <GameBoard key="game-board" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
