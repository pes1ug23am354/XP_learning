import { motion } from 'framer-motion';

export default function SubjectCard({ subject, onOpen, onEnroll }) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass rounded-2xl border border-orange-300/20 p-5"
    >
      <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${subject.coverGradient}`} />
      <h3 className="text-lg font-bold text-white">{subject.title} ({subject.board} {subject.classLevel})</h3>
      <p className="mt-2 text-sm text-slate-200">{subject.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-cyan-100">
        <span>Chapters: {subject.chapterCount}</span>
        <span>Topics cleared: {subject.completedTopics}</span>
      </div>
      <div className="mt-4 flex gap-2">
        {!subject.enrolled ? (
          <button onClick={onEnroll} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold">Enroll</button>
        ) : (
          <button onClick={onOpen} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold">Open Map</button>
        )}
      </div>
    </motion.article>
  );
}
