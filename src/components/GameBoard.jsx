import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';

export default function GameBoard() {
  const { 
    selectedPolitician, currentTurn, maxTurns,
    popularity, budget, order, support, eventLog, nextTurn, updateGauge, addEventLog,
    useSkill, useUltimate, ultimateCooldown
  } = useGameStore();

  const handleNextMonth = () => {
    const randomEvent = Math.random();
    if (randomEvent < 0.3) {
      updateGauge('order', -10);
      addEventLog('Grève des transports ! L\'Ordre public chute.');
    } else if (randomEvent < 0.6) {
      updateGauge('popularity', 5);
      addEventLog('Discours réussi. La popularité grimpe.');
    } else {
      updateGauge('budget', -15);
      addEventLog('Dépense imprévue. Le budget en prend un coup.');
    }
    nextTurn();
  };

  const Gauge = ({ label, value }) => (
    <div style={{ marginBottom: '0.6vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: 'clamp(9px, 1.3vh, 13px)', fontFamily: 'var(--font-title)', letterSpacing: '1px', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 'clamp(9px, 1.3vh, 13px)', color: 'var(--accent-gold)' }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: '2px', background: 'rgba(212, 175, 55, 0.15)' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', background: 'var(--accent-gold)', boxShadow: '0 0 6px var(--accent-gold)' }}
        />
      </div>
    </div>
  );

  /*
   * ARCHITECTURE VISUELLE :
   * 
   * L'image source est une fiche de personnage complète (~1080x1080) :
   *   - Gauche (0-40%) : Texte incrusté (nom, stats, classe, compétences)  
   *   - Centre (30-65%) : Le personnage (tête + buste)
   *   - Droite (60-100%) : Bâtiment + slogan + capacité ultime
   *   - Bas (75-100%) : Barre de compétences + contrôles
   *
   * STRATÉGIE : 
   * 1. L'image en fond couvre 100% de la page (cover, centré haut)
   * 2. Un panneau gauche OPAQUE (background solide) couvre 45% - il cache 
   *    TOUT le texte de la moitié gauche de l'image
   * 3. Ce panneau a un bord droit avec dégradé transparent pour fusionner 
   *    avec le personnage au centre
   * 4. La barre du bas OPAQUE couvre le texte des compétences incrustées
   * 5. Le slogan à droite reste visible (c'est cohérent avec le design)
   */

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      backgroundColor: '#050505',
      position: 'relative'
    }}>
      
      {/* COUCHE 0 : Image de fond plein écran */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url('${selectedPolitician.imageQuery}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />

      {/* COUCHE 1 : Panneau gauche OPAQUE (cache le texte gauche de l'image) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '45%',
        height: '100%',
        backgroundColor: '#050505', // 100% opaque, aucun texte ne passe
        zIndex: 1,
      }} />

      {/* COUCHE 1b : Dégradé de fusion gauche → personnage */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '45%',
        width: '15%',
        height: '100%',
        background: 'linear-gradient(to right, #050505, transparent)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* COUCHE 2 : Contenu UI du panneau gauche */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '45%',
        height: '72vh', // Laisse 28vh pour la barre du bas
        zIndex: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '1vh 3vw',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.2vh' }}>
          <div style={{ color: 'var(--accent-gold-dark)', fontFamily: 'var(--font-title)', fontSize: 'clamp(8px, 1vh, 11px)', letterSpacing: '3px', textTransform: 'uppercase' }}>Personnage Jouable</div>
          <h1 style={{ fontSize: 'clamp(20px, 4.5vh, 38px)', margin: '0.3vh 0 0', lineHeight: 1 }}>{selectedPolitician.name.toUpperCase()}</h1>
          <div style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-title)', fontSize: 'clamp(10px, 1.5vh, 15px)', letterSpacing: '1px', marginTop: '0.5vh' }}>{selectedPolitician.role.toUpperCase()}</div>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(10px, 1.4vh, 14px)', marginBottom: '1.5vh', lineHeight: 1.4 }}>
          {selectedPolitician.description}
        </p>

        {/* Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2vw', marginBottom: '1.5vh' }}>
          <div>
            <h3 style={{ fontSize: 'clamp(10px, 1.4vh, 14px)', marginBottom: '0.6vh', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3vh' }}>ATTRIBUTS</h3>
            <Gauge label="CHARISME" value={selectedPolitician.attributes.charisme} />
            <Gauge label="INTELLIGENCE" value={selectedPolitician.attributes.intelligence} />
            <Gauge label="CONDESCENDANCE" value={selectedPolitician.attributes.condescendance} />
            <Gauge label="ENDURANCE" value={selectedPolitician.attributes.endurance} />
            <Gauge label="HUMILITÉ" value={selectedPolitician.attributes.humilite} />
          </div>
          <div>
            <h3 style={{ fontSize: 'clamp(10px, 1.4vh, 14px)', marginBottom: '0.6vh', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3vh' }}>NATION</h3>
            <Gauge label="POPULARITÉ" value={popularity} />
            <Gauge label="BUDGET" value={budget} />
            <Gauge label="ORDRE PUBLIC" value={order} />
            <Gauge label="SOUTIEN" value={support} />
          </div>
        </div>

        {/* Classe */}
        <div>
          <h3 style={{ fontSize: 'clamp(10px, 1.3vh, 13px)', marginBottom: '0.3vh' }}>CLASSE</h3>
          <div style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-title)', fontSize: 'clamp(11px, 1.5vh, 15px)', marginBottom: '0.3vh' }}>{selectedPolitician.classe.name.toUpperCase()}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(9px, 1.2vh, 13px)', lineHeight: 1.4 }}>{selectedPolitician.classe.description}</p>
        </div>
      </div>

      {/* COUCHE 2b : Event Log flottant à droite */}
      <div style={{ position: 'absolute', top: '2vh', right: '2vw', width: '22vw', zIndex: 3, pointerEvents: 'none' }}>
        {eventLog.slice(0, 3).map((log, index) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1 - index * 0.3, x: 0 }}
            key={log.turn + index + log.message} 
            style={{ 
              padding: '0.6vh 0.8vw', 
              background: 'linear-gradient(to right, transparent, rgba(5,5,5,0.9))', 
              backdropFilter: 'blur(6px)', 
              borderRight: '2px solid var(--accent-gold)', 
              marginBottom: '0.6vh', 
              fontSize: 'clamp(9px, 1.3vh, 13px)', 
              textAlign: 'right', 
              textShadow: '0 1px 3px black' 
            }}
          >
            {log.message}
          </motion.div>
        ))}
      </div>

      {/* COUCHE 3 : Barre du bas OPAQUE (cache les compétences incrustées) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28vh',
        backgroundColor: '#050505', // 100% opaque
        borderTop: '1px solid rgba(212, 175, 55, 0.25)',
        zIndex: 4,
        padding: '1.2vh 3vw 0.8vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Dégradé vers le haut pour fusionner avec le personnage */}
        <div style={{
          position: 'absolute',
          top: '-8vh',
          left: 0,
          right: 0,
          height: '8vh',
          background: 'linear-gradient(to top, #050505, transparent)',
          zIndex: -1,
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', gap: '2vw', flex: 1, minHeight: 0 }}>
          {/* Compétences */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 'clamp(10px, 1.3vh, 13px)', marginBottom: '0.8vh' }}>COMPÉTENCES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6vw' }}>
              {selectedPolitician.skills.map((skill, idx) => (
                <div key={idx} className="skill-card" onClick={() => useSkill(skill)} style={{ padding: '0.6vh 0.3vw' }}>
                  <div className="skill-icon" style={{ width: 'clamp(18px, 3vh, 36px)', height: 'clamp(18px, 3vh, 36px)', marginBottom: '0.4vh' }}></div>
                  <h4 style={{ fontFamily: 'var(--font-title)', fontSize: 'clamp(7px, 1vh, 11px)', marginBottom: '0.2vh', marginTop: 0 }}>{skill.name.toUpperCase()}</h4>
                  <p style={{ fontSize: 'clamp(6px, 0.9vh, 10px)', lineHeight: 1.2, marginBottom: 0 }}>{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ultimate */}
          <div style={{ width: '18vw', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <h3 style={{ fontSize: 'clamp(10px, 1.3vh, 13px)', marginBottom: '0.8vh', color: 'var(--accent-gold)' }}>CAPACITÉ ULTIME</h3>
            <div 
              className="skill-card" 
              style={{ padding: '0.8vh 0.6vw', flex: 1, opacity: ultimateCooldown > 0 ? 0.5 : 1, borderColor: 'var(--accent-gold)', justifyContent: 'center' }}
              onClick={() => useUltimate(selectedPolitician.ultimate)}
            >
              <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--accent-gold)', fontSize: 'clamp(9px, 1.2vh, 13px)', marginBottom: '0.3vh', marginTop: 0 }}>
                {selectedPolitician.ultimate.name.toUpperCase()}
              </h4>
              <p style={{ marginBottom: '0.4vh', fontSize: 'clamp(7px, 1vh, 11px)', lineHeight: 1.2 }}>{selectedPolitician.ultimate.description}</p>
              <div style={{ fontSize: 'clamp(7px, 0.9vh, 10px)', color: 'var(--accent-gold-dark)', textAlign: 'left', width: '100%' }}>
                DURÉE : {selectedPolitician.ultimate.duration} · RECH. : {selectedPolitician.ultimate.cooldown}
              </div>
              {ultimateCooldown > 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 2.5vh, 28px)', color: 'var(--accent-red)', fontFamily: 'var(--font-title)' }}>
                  {ultimateCooldown}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6vh', marginTop: '0.6vh', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '1.5vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3vw', color: 'var(--text-secondary)', fontFamily: 'var(--font-title)', fontSize: 'clamp(8px, 1vh, 11px)' }}>
              <div style={{ border: '1px solid var(--text-secondary)', borderRadius: '50%', width: 'clamp(14px, 1.8vh, 20px)', height: 'clamp(14px, 1.8vh, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(7px, 0.9vh, 10px)' }}>A</div>
              SÉLECTIONNER
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3vw', color: 'var(--text-secondary)', fontFamily: 'var(--font-title)', fontSize: 'clamp(8px, 1vh, 11px)' }}>
              <div style={{ border: '1px solid var(--text-secondary)', borderRadius: '50%', width: 'clamp(14px, 1.8vh, 20px)', height: 'clamp(14px, 1.8vh, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(7px, 0.9vh, 10px)' }}>B</div>
              RETOUR
            </div>
          </div>
          <button className="rpg-button" style={{ padding: '0.4vh 1.2vw', fontSize: 'clamp(8px, 1.1vh, 12px)' }} onClick={handleNextMonth}>
            ( R ) PASSER LE TOUR [{currentTurn}/{maxTurns}]
          </button>
        </div>
      </div>
    </div>
  );
}
