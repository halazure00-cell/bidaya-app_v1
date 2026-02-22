import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string | null;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-md
            ${type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-100' 
              : 'bg-red-50/90 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-800 dark:text-red-100'
            }`}
        >
          {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <p className="font-medium flex-1">{message}</p>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
