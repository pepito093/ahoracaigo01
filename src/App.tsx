import React, { useState, useEffect, useRef } from 'react';
import { GameState, Question, NPC, GameStatus } from './types';
import { NPC_NAMES, CATEGORIES, INITIAL_LIVES, QUESTION_TIME, TOTAL_OPPONENTS } from './constants';
import { generateQuestion } from './services/geminiService';
import Arena from './components/Game/Arena';
import QuestionUI from './components/Game/QuestionUI';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Heart, Users, Play, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';

export default function App() {
  const [playerName, setPlayerName] = useState('MARCOS');
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [activeOpponentId, setActiveOpponentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [status, setStatus] = useState<GameStatus>({
    score: 0,
    currentLevel: 1,
    lives: INITIAL_LIVES,
    remainingOpponents: TOTAL_OPPONENTS,
    wildcards: 3
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Initialize NPCs once
  useEffect(() => {
    const initialNpcs = Array.from({ length: TOTAL_OPPONENTS }).map((_, i) => ({
      id: `npc-${i}`,
      name: NPC_NAMES[i % NPC_NAMES.length],
      difficulty: 1 + Math.floor(i / 2),
      isEliminated: false,
      avatarSeed: Math.random().toString(36).substring(7)
    }));
    setNpcs(initialNpcs);
  }, []);

  const startNewGame = () => {
    const initialNpcs = Array.from({ length: TOTAL_OPPONENTS }).map((_, i) => ({
      id: `npc-${i}`,
      name: NPC_NAMES[i % NPC_NAMES.length],
      difficulty: 1 + Math.floor(i / 2),
      isEliminated: false,
      avatarSeed: Math.random().toString(36).substring(7)
    }));
    setNpcs(initialNpcs);
    setStatus({
      score: 0,
      currentLevel: 1,
      lives: INITIAL_LIVES,
      remainingOpponents: TOTAL_OPPONENTS,
      wildcards: 3
    });
    setGameState(GameState.PICKING_OPPONENT);
    setActiveOpponentId(null);
    setCurrentQuestion(null);
    setMessage("¡ELIGE A TU OPONENTE!");
  };

  const handleNpcClick = async (npcId: string) => {
    if (gameState !== GameState.PICKING_OPPONENT) return;
    const npc = npcs.find(n => n.id === npcId);
    if (!npc || npc.isEliminated) return;

    setActiveOpponentId(npcId);
    setGameState(GameState.DUEL_INTRO);
    setMessage(`¡DUELO CONTRA ${npc.name}!`);

    setTimeout(() => {
      startDuel(npc);
    }, 2000);
  };

  const startDuel = async (npc: NPC) => {
    setGameState(GameState.QUESTION_ACTIVE);
    await fetchNextQuestion(npc.difficulty);
  };

  const fetchNextQuestion = async (difficulty: number) => {
    setIsProcessingAnswer(true);
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const q = await generateQuestion(category, difficulty);
    setCurrentQuestion(q);
    setTimeLeft(QUESTION_TIME);
    setIsProcessingAnswer(false);
  };

  // Timer logic
  useEffect(() => {
    if (gameState === GameState.QUESTION_ACTIVE && timeLeft > 0 && !isProcessingAnswer) {
      const start = Date.now();
      const initialTime = timeLeft;
      
      const updateTimer = () => {
        const elapsed = (Date.now() - start) / 1000;
        const newTime = Math.max(0, initialTime - elapsed);
        setTimeLeft(newTime);
        
        if (newTime > 0) {
          timerRef.current = requestAnimationFrame(updateTimer);
        } else {
          handleTimeUp();
        }
      };
      
      timerRef.current = requestAnimationFrame(updateTimer);
    }
    
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [gameState, isProcessingAnswer, timeLeft === QUESTION_TIME]);

  const handleTimeUp = () => {
    if (isProcessingAnswer) return;
    processTurn(null);
  };

  const handleAnswer = (answer: string) => {
    if (isProcessingAnswer) return;
    processTurn(answer);
  };

  const processTurn = async (answer: string | null) => {
    setIsProcessingAnswer(true);
    const isCorrect = answer?.toUpperCase() === currentQuestion?.answer.toUpperCase();

    if (isCorrect) {
      setMessage("¡CORRECTO!");
      const currentNpc = npcs.find(n => n.id === activeOpponentId);
      
      const npcWillFail = Math.random() > (0.6 + (currentNpc?.difficulty || 1) * 0.04);

      setTimeout(async () => {
        if (npcWillFail) {
          handleNpcFailure();
        } else {
          setMessage(`${currentNpc?.name} también acertó... ¡Otra!`);
          setTimeout(() => {
            fetchNextQuestion(currentNpc?.difficulty || 1);
          }, 1000);
        }
      }, 1500);

    } else {
      handlePlayerFailure();
    }
  };

  const handleNpcFailure = () => {
    setGameState(GameState.OPPONENT_FALLING);
    setMessage("¡FALLÓ! ¡AHORA CAE!");
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#facc15', '#ffffff']
    });

    setTimeout(() => {
      setNpcs(prev => prev.map(n => n.id === activeOpponentId ? { ...n, isEliminated: true } : n));
      setStatus(prev => {
        const newScore = prev.score + 100 * prev.currentLevel;
        const newRemaining = prev.remainingOpponents - 1;
        
        if (newRemaining === 0) {
          setGameState(GameState.VICTORY);
          setMessage("¡ERES EL GANADOR!");
        } else {
          setGameState(GameState.PICKING_OPPONENT);
          setActiveOpponentId(null);
          setMessage("¡ELIGE A TU OPONENTE!");
        }
        
        return {
          ...prev,
          score: newScore,
          remainingOpponents: newRemaining,
          currentLevel: prev.currentLevel + 1
        };
      });
      setIsProcessingAnswer(false);
    }, 2500);
  };

  const handlePlayerFailure = () => {
    setIsProcessingAnswer(true);
    if (status.lives > 1) {
      setStatus(prev => ({ ...prev, lives: prev.lives - 1 }));
      setMessage("¡MAL! Pierdes una vida...");
      setTimeout(() => {
        const currentNpc = npcs.find(n => n.id === activeOpponentId);
        fetchNextQuestion(currentNpc?.difficulty || 1);
      }, 2000);
    } else {
      setGameState(GameState.PLAYER_FALLING);
      setMessage("¡HAS PERDIDO! ¡AL VACÍO!");
      setTimeout(() => {
        setGameState(GameState.GAME_OVER);
        setIsProcessingAnswer(false);
      }, 2500);
    }
  };

  return (
    <div className="relative w-full h-screen bg-studio-bg flex flex-col font-sans select-none overflow-hidden text-slate-200">
      <header className="tv-header">
        <div className="text-3xl font-black tracking-widest text-studio-gold neon-gold uppercase">
          ¡Ahora Caigo!
        </div>
        
        <div className="flex gap-10">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Premio Actual</span>
            <span className="text-2xl font-bold text-white tracking-widest">€ {(status.score * 125).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Oponentes</span>
            <span className="text-2xl font-bold text-white tracking-widest">{TOTAL_OPPONENTS - status.remainingOpponents} / {TOTAL_OPPONENTS}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Nivel</span>
            <span className="text-2xl font-bold text-studio-gold tracking-widest uppercase">
              {status.currentLevel < 4 ? "Bronce" : status.currentLevel < 8 ? "Plata" : "Oro"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-xs transition-all duration-500",
                i < status.wildcards 
                  ? "border-studio-gold text-studio-gold shadow-[0_0_10px_rgba(250,204,21,0.3)]" 
                  : "border-slate-800 text-slate-800 line-through"
              )}
            >
              C
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 studio-floor relative flex items-center justify-center overflow-hidden">
        <Arena 
          npcs={npcs}
          activeOpponentId={activeOpponentId}
          gameState={gameState}
          status={status}
          targetNPCId={null}
          onNpcClick={handleNpcClick}
          playerNPC={{ name: playerName }}
        />

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none"
            >
              <div className="bg-studio-dark/80 backdrop-blur-xl border-2 border-white/20 px-12 py-6 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                <h2 className="text-5xl font-black uppercase tracking-widest text-center text-studio-gold neon-gold whitespace-nowrap">
                  {message}
                </h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {gameState === GameState.QUESTION_ACTIVE && currentQuestion && (
        <QuestionUI 
          question={currentQuestion}
          timeLeft={timeLeft}
          totalTime={QUESTION_TIME}
          onAnswer={handleAnswer}
          disabled={isProcessingAnswer}
        />
      )}

      {/* Start and End screens remain similar but styled for Geometric Balance */}
      <AnimatePresence>
        {gameState === GameState.START_MENU && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-studio-dark/95 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <h1 className="text-9xl font-black uppercase tracking-tighter mb-12 text-studio-gold neon-gold">
              ¡AHORA CAIGO!
            </h1>

            <div className="w-full max-w-md mb-12 flex flex-col gap-4">
              <span className="text-slate-400 uppercase tracking-widest text-xs font-black">Introduce tu nombre de Líder</span>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                className="bg-white/5 border-2 border-studio-blue/30 focus:border-studio-gold outline-none rounded-2xl px-8 py-5 text-3xl font-black uppercase tracking-widest text-center transition-all"
                placeholder="TU NOMBRE..."
                maxLength={15}
              />
            </div>

            <button 
              onClick={startNewGame}
              disabled={!playerName.trim()}
              className="group relative px-20 py-10 bg-studio-blue text-white font-black text-6xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              JUGAR
            </button>
          </motion.div>
        )}

        {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-studio-dark/98 backdrop-blur-3xl z-[100] flex flex-col items-center justify-center p-6 text-center"
          >
            <h1 className={cn(
              "text-9xl font-black uppercase mb-8",
              gameState === GameState.VICTORY ? "text-studio-gold neon-gold" : "text-studio-danger"
            )}>
              {gameState === GameState.VICTORY ? "¡CAMPEÓN!" : "GAME OVER"}
            </h1>
            <div className="mb-12">
              <span className="text-slate-400 uppercase tracking-widest text-sm font-black">Puntuación Final</span>
              <div className="text-[8rem] font-black text-white leading-none tracking-tighter">
                € {(status.score * 125).toLocaleString()}
              </div>
            </div>
            <button 
              onClick={startNewGame}
              className="px-12 py-6 bg-studio-blue text-white font-black text-3xl uppercase tracking-widest hover:bg-studio-gold hover:text-black transition-all rounded-full"
            >
              Reiniciar Duelo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
