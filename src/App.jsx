import MainMenu from './components/MainMenu';
import GameBoard from './components/GameBoard';
import { useGameStore } from './store/useGameStore';

export default function App() {
  const phase = useGameStore((state) => state.phase);

  return phase === 'game' ? <GameBoard /> : <MainMenu />;
}
