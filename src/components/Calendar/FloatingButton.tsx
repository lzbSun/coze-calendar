import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#FFD1DC] shadow-lg flex items-center justify-center text-white z-50"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
}