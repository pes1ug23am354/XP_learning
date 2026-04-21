import { motion } from 'framer-motion';

export default function HUDBar({ xp = 0, level = 1, streak = 0 }) {
  const pct = Math.min(100, Math.round((xp % 500) / 5));

  return (
    <div className="mb-5 rounded-2xl border border-cyan-200/30 bg-slate-900/40 p-4 neon-border">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-orange-300">LEVEL {level}</span>
        <span className="text-cyan-200">STREAK {streak} days</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-cyan-300"
        />
      </div>
      <p className="mt-2 text-xs text-slate-300">XP {xp} | Next level at {Math.ceil((xp + 1) / 500) * 500}</p>
    </div>
  );
}
