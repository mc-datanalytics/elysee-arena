import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { politicians } from '../data/politicians';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MainMenu() {
  const { setMode, selectPolitician } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const startGame = () => {
    setMode('realistic'); // Automatically realistic since images have baked-in stats
    selectPolitician(politicians[currentIndex]);
  };

  const nextPol = () => setCurrentIndex((prev) => (prev + 1) % politicians.length);
  const prevPol = () => setCurrentIndex((prev) => (prev - 1 + politicians.length) % politicians.length);

  const currentPol = politicians[currentIndex];

  return (
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#000'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPol.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${currentPol.imageQuery}')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevPol}
        style={{
          position: 'absolute',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: 'var(--accent-gold)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
      >
        <ChevronLeft size={32} />
      </button>

      <button 
        onClick={nextPol}
        style={{
          position: 'absolute',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          color: 'var(--accent-gold)',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-color)',
          cursor: 'pointer'
        }}
      >
        <ChevronRight size={32} />
      </button>

      {/* Bottom Action Bar */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 4rem'
      }}>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          style={{
            background: 'linear-gradient(to bottom, rgba(15,15,15,0.9), rgba(5,5,5,0.95))',
            color: 'var(--accent-gold)',
            fontFamily: 'var(--font-title)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '1rem 3rem',
            border: '1px solid var(--accent-gold)',
            borderRadius: '2px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.2), inset 0 0 10px rgba(212, 175, 55, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ border: '1px solid var(--accent-gold)', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>A</div>
          SÉLECTIONNER
        </motion.button>
      </div>
    </div>
  );
}
