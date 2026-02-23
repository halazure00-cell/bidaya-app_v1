import { BidayatState } from '../types';
import { defaultState } from './defaultState';

const STORAGE_KEY = 'bidayat_os_state';

export const store = {
  getState: (): BidayatState => {
    if (typeof window === 'undefined') return defaultState;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initializeState(defaultState);
    
    try {
      const parsed = JSON.parse(saved);
      return initializeState({ ...defaultState, ...parsed });
    } catch (e) {
      console.error('Failed to parse local storage data, resetting to default.');
      return initializeState(defaultState);
    }
  },
  
  saveState: (state: BidayatState) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  
  resetState: (): BidayatState => {
    const reset = { ...defaultState };
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    }
    return initializeState(reset);
  }
};

function initializeState(state: BidayatState): BidayatState {
  const today = new Date().toISOString().split('T')[0];
  let todayPrayer = state.prayerStats?.find(p => p.date === today);
  
  let newPrayerStats = state.prayerStats || [];
  
  if (!todayPrayer) {
    todayPrayer = { date: today, subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 };
    newPrayerStats = [...newPrayerStats, todayPrayer].slice(-30); // Keep last 30 days
  }

  return {
    ...state,
    todayPrayer,
    prayerStats: newPrayerStats
  };
}
