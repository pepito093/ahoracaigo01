import { motion } from 'motion/react';
import Platform from './Platform';
import { NPC, GameStatus } from '../../types';

interface ArenaProps {
  playerNPC: { name: string };
  npcs: NPC[];
  activeOpponentId: string | null;
  gameState: string;
  status: GameStatus;
  targetNPCId: string | null;
  onNpcClick: (npcId: string) => void;
}

export default function Arena({ 
  npcs, 
  activeOpponentId, 
  targetNPCId,
  onNpcClick,
  playerNPC
}: ArenaProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 overflow-visible">
      <div className="relative w-[600px] h-[600px] rounded-full border border-studio-blue/20">
        {/* NPCs Circle */}
        {npcs.map((npc, index) => {
          const angle = (index / npcs.length) * Math.PI * 2;
          const x = 50 + 50 * Math.cos(angle);
          const y = 50 + 50 * Math.sin(angle);

          return (
            <div
              key={npc.id}
              className="absolute z-10 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
              style={{
                top: `${y}%`,
                left: `${x}%`,
              }}
            >
              <Platform
                id={npc.id}
                name={npc.name}
                active={activeOpponentId === npc.id || targetNPCId === npc.id}
                isEliminated={npc.isEliminated}
                isFalling={npc.isEliminated && activeOpponentId === npc.id}
                delay={index * 0.1}
                onClick={() => onNpcClick(npc.id)}
              />
            </div>
          );
        })}

        {/* Player (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <Platform
            id="player"
            name={playerNPC.name}
            isPlayer={true}
            active={true}
            delay={1.5}
          />
        </div>
        
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-studio-blue/10 blur-[100px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
