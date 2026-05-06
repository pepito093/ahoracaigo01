import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Send } from 'lucide-react';
import { Question } from '../../types';
import { cn } from '../../lib/utils';

interface QuestionUIProps {
  question: Question;
  timeLeft: number;
  totalTime: number;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export default function QuestionUI({ 
  question, 
  timeLeft, 
  totalTime, 
  onAnswer,
  disabled = false
}: QuestionUIProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !input.trim()) return;
    onAnswer(input.trim().toUpperCase());
    setInput('');
  };

  const progress = (timeLeft / totalTime) * 100;

  return (
    <motion.div 
      initial={{ y: 250 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="question-area pointer-events-auto border-t-4 border-studio-blue">
        <div className="w-full max-w-6xl flex items-center justify-between gap-12">
          {/* Question Text */}
          <div className="flex-1">
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mb-2">{question.category}</div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {question.text.toUpperCase()}
            </h2>
          </div>

          {/* Answer Area */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-2">
              {question.displayHint.split('').map((char, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "slot",
                    char !== '_' && "slot-filled"
                  )}
                >
                  {char === '_' ? '' : char}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="w-full flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={disabled}
                placeholder="ESCRIBE AQUÍ..."
                className="flex-1 bg-studio-dark/50 border-2 border-studio-blue/30 focus:border-studio-gold outline-none rounded-lg px-6 py-3 text-xl font-black uppercase tracking-widest transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={disabled || !input.trim()}
                className="bg-studio-gold text-black hover:bg-white disabled:bg-slate-800 disabled:text-slate-600 px-6 py-3 rounded-lg transition-all font-black"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Timer Area */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={timeLeft < 3 ? "var(--color-studio-danger)" : "var(--color-studio-gold)"}
                strokeWidth="8"
                strokeLinecap="butt"
                style={{ strokeDasharray: 352, strokeDashoffset: 352 - (352 * progress) / 100 }}
              />
            </svg>
            <div className={cn(
              "absolute text-4xl font-black transition-colors duration-300",
              timeLeft < 3 ? "text-studio-danger animate-pulse" : "text-studio-gold neon-gold"
            )}>
              {Math.ceil(timeLeft)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
