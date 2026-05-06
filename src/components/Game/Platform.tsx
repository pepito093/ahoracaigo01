import { motion, AnimatePresence } from 'motion/react';
import { User, UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PlatformProps {
  id: string;
  name: string;
  isPlayer?: boolean;
  active?: boolean;
  isFalling?: boolean;
  isEliminated?: boolean;
  delay?: number;
  onClick?: () => void;
}

export default function Platform({ 
  name, 
  isPlayer = false, 
  active = false, 
  isFalling = false, 
  isEliminated = false,
  delay = 0,
  onClick 
}: PlatformProps) {
  return (
    <div className="relative group overflow-visible">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: isFalling ? 500 : 0,
          rotateX: isFalling ? -45 : 0,
        }}
        transition={{ delay, duration: isFalling ? 1 : 0.5, type: isFalling ? 'tween' : 'spring' }}
        className={cn(
          "relative flex flex-col items-center justify-center transition-all duration-500",
          isPlayer ? "w-32 h-32 md:w-36 md:h-36" : "w-16 h-16 md:w-20 md:h-20",
          !isEliminated && !isPlayer && "cursor-pointer hover:scale-110",
        )}
        onClick={!isEliminated && !isPlayer ? onClick : undefined}
      >
        {/* Platform Surface (Circle) */}
        <div className={cn(
          "absolute inset-0 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden",
          active ? "border-studio-gold shadow-[0_0_30px_rgba(250,204,21,0.4)]" : "border-studio-blue shadow-[0_0_20px_rgba(59,130,246,0.2)]",
          isEliminated && "border-studio-danger bg-studio-dark opacity-30 shadow-none",
          !isEliminated && "bg-slate-800"
        )}>
          {/* Trapdoor Line */}
          <div className="absolute w-full h-[1px] bg-white/20 top-1/2 -translate-y-1/2" />
          
          <AnimatePresence>
            {!isFalling && (
              <motion.div
                exit={{ opacity: 0, y: 100 }}
                className="flex flex-col items-center pointer-events-none"
              >
                {isPlayer ? (
                  <User className="w-12 h-12 text-studio-gold neon-gold" />
                ) : (
                  <UserRound className={cn(
                    "w-6 h-6 md:w-8 md:h-8",
                    active ? "text-white" : "text-slate-500"
                  )} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Label bellow the circle */}
        {!isFalling && (
          <div className={cn(
            "absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-colors",
            active ? "text-studio-gold neon-gold" : "text-slate-500/50"
          )}>
            {name}
          </div>
        )}
      </motion.div>
    </div>
  );
}
