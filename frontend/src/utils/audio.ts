import { Platform } from 'react-native';

export const playAudioBeep = (freq = 900, duration = 0.12, type: OscillatorType = 'sine') => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }
};

export const playSuccessBeep = () => playAudioBeep(900, 0.12, 'sine');
export const playErrorBeep = () => {
  playAudioBeep(220, 0.25, 'sawtooth');
  setTimeout(() => playAudioBeep(180, 0.3, 'sawtooth'), 150);
};
