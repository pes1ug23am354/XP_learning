import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MapNode({ topic, index }) {
  const statusClass = topic.completed
    ? 'bg-emerald-500/30 border-emerald-300 shadow-neon'
    : topic.unlocked
      ? 'bg-orange-500/20 border-orange-300'
      : 'bg-slate-800/60 border-slate-600 opacity-60';

  return (
    <div className="relative">
      {index > 0 && <div className="absolute -left-8 top-6 hidden h-[2px] w-8 node-line md:block" />}
      <motion.div whileHover={{ scale: topic.unlocked ? 1.03 : 1 }} className={`rounded-xl border p-3 ${statusClass}`}>
        <p className="text-xs text-slate-300">Level {topic.order}</p>
        <h4 className="font-semibold">{topic.title}</h4>
        <div className="mt-2 flex gap-2 text-xs">
          {topic.completed && <span className="rounded bg-emerald-300/20 px-2 py-1">Completed</span>}
          {topic.read && !topic.completed && <span className="rounded bg-cyan-200/20 px-2 py-1">Read</span>}
          {!topic.unlocked && <span className="rounded bg-slate-600 px-2 py-1">Locked</span>}
        </div>
        {topic.unlocked && (
          <div className="mt-3 flex gap-2">
            <Link className="rounded bg-cyan-700 px-2 py-1 text-xs" to={`/topic/${topic.id}/learn`}>Learn</Link>
            <Link className="rounded bg-orange-600 px-2 py-1 text-xs" to={`/topic/${topic.id}/quiz`}>Quiz</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
