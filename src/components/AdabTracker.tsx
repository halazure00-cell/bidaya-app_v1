import { FC } from 'react';
import { BidayatState, NetworkProtocol } from '../types';
import { motion } from 'motion/react';
import { Moon, Users, HeartHandshake, Shield, MessageCircleOff, Star, UserX, GraduationCap, Globe, CheckCircle2, Circle, HandHeart } from 'lucide-react';

interface AdabTrackerProps {
  state: BidayatState;
  onToggleProtocol: (id: string) => void;
}

interface AdabCardProps {
  protocol: NetworkProtocol;
  onToggleProtocol: (id: string) => void;
}

const AdabCard: FC<AdabCardProps> = ({ protocol, onToggleProtocol }) => {
  let Icon = Users;
  let colorClass = "text-slate-500";
  let bgClass = "bg-slate-50 dark:bg-slate-800";
  
  switch (protocol.target) {
    case 'Allah':
      Icon = Star; // Symbolizing Divine Light/Guidance
      colorClass = "text-emerald-600 dark:text-emerald-400";
      bgClass = "bg-emerald-50 dark:bg-emerald-900/20";
      break;
    case 'Parents':
      Icon = HeartHandshake; // Birrul Walidain
      colorClass = "text-rose-500";
      bgClass = "bg-rose-50 dark:bg-rose-900/20";
      break;
    case 'Scholars':
      Icon = GraduationCap; // Knowledge/Respect
      colorClass = "text-indigo-500";
      bgClass = "bg-indigo-50 dark:bg-indigo-900/20";
      break;
    case 'General':
      Icon = Globe; // Ummah/Society
      colorClass = "text-blue-500";
      bgClass = "bg-blue-50 dark:bg-blue-900/20";
      break;
    case 'Ignorant':
      Icon = UserX; // Avoiding ignorant debates
      colorClass = "text-amber-500";
      bgClass = "bg-amber-50 dark:bg-amber-900/20";
      break;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onToggleProtocol(protocol.id)}
      className={`relative p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer group
        ${protocol.completed 
          ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass} transition-colors duration-300`}>
          <Icon size={24} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className={`font-semibold text-base md:text-lg ${protocol.completed ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {protocol.title}
              </h3>
              <p className="font-arabic text-base md:text-lg text-slate-500 dark:text-slate-400 mt-1">
                {protocol.arabic}
              </p>
            </div>
            <div className={`transition-colors duration-300 ${protocol.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
              {protocol.completed ? <CheckCircle2 size={24} className="fill-emerald-100 dark:fill-emerald-900/20" /> : <Circle size={24} />}
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed ${protocol.completed ? 'text-emerald-700/70 dark:text-emerald-500/50' : 'text-slate-600 dark:text-slate-400'}`}>
            {protocol.description}
          </p>
        </div>
      </div>

      {/* Selection Glow */}
      {protocol.completed && (
        <motion.div
          layoutId={`glow-${protocol.id}`}
          className="absolute inset-0 rounded-2xl ring-1 ring-emerald-500/20 dark:ring-emerald-400/10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
};

export default function AdabTracker({ state, onToggleProtocol }: AdabTrackerProps) {
  const verticalProtocols = state.networkProtocols.filter(p => p.category === 'Vertical');
  const horizontalProtocols = state.networkProtocols.filter(p => p.category === 'Horizontal');

  return (
    <div className="space-y-10 pb-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <HandHeart className="text-emerald-600" size={28} />
          Adab & Muamalah
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-base md:text-lg">
          Menata hubungan dengan Sang Pencipta dan sesama manusia.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hablum Minallah (Vertical) */}
        <section className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800"
          >
            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400"
            >
              <Moon size={20} />
            </motion.div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Hablum Minallah</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hubungan Vertikal</p>
            </div>
          </motion.div>
          
          <div className="space-y-4">
            {verticalProtocols.map(protocol => (
              <AdabCard key={protocol.id} protocol={protocol} onToggleProtocol={onToggleProtocol} />
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <Shield size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-slate-200 mb-1">Tazkiyatun Nafs</strong>
              <p>Jaga hati dari ketergantungan kepada selain Allah. Ikhlaskan niat dalam setiap amal.</p>
            </div>
          </div>
        </section>

        {/* Hablum Minannas (Horizontal) */}
        <section className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800"
          >
            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400"
            >
              <Users size={20} />
            </motion.div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Hablum Minannas</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hubungan Horizontal</p>
            </div>
          </motion.div>

          <div className="space-y-4">
            {horizontalProtocols.map(protocol => (
              <AdabCard key={protocol.id} protocol={protocol} onToggleProtocol={onToggleProtocol} />
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <MessageCircleOff size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-900 dark:text-slate-200 mb-1">Adab Pergaulan</strong>
              <p>Batasi interaksi yang tidak bermanfaat (Fudhul Kalam). Hindari debat kusir dan ghibah.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
