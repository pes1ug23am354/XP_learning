import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-4 md:p-5 ${className}`}
    >
      {children}
    </motion.section>
  );
}
