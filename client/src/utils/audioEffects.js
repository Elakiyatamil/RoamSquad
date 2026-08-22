let audioCtx = null;

function getAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

/**
  1. COIN INSERT SOUND
  Realistic metallic coin drop / slot insertion SFX.
 */
export function playCoinInsertSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First metallic ping
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1480, now);
    osc1.frequency.exponentialRampToValueAtTime(1100, now + 0.08);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);

    // Second metal resonance clink (delayed by 40ms)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2200, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.12);

    gain2.gain.setValueAtTime(0.3, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.12);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch (err) {
    console.warn('Coin sound error:', err);
  }
}

/**
  2. VENDING / CRANK SOUND
  Mechanical gear-turning / ratchet vending SFX when dial spins.
 */
export function playVendingCrankSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Series of 4 gear teeth clicks
    for (let i = 0; i < 4; i++) {
      const clickTime = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220 + i * 40, clickTime);
      osc.frequency.exponentialRampToValueAtTime(80, clickTime + 0.06);

      gain.gain.setValueAtTime(0.3, clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(clickTime);
      osc.stop(clickTime + 0.06);
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([12, 30, 12, 30, 12]);
    }
  } catch (err) {
    console.warn('Vending crank sound error:', err);
  }
}

/**
  3. LOOT BOX OPEN SOUND
  Rewarding "chest reveal" arpeggio SFX when destination card reveals.
 */
export function playLootBoxOpenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Major chord arpeggio: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 784.88, 1046.50];

    notes.forEach((freq, index) => {
      const noteTime = now + index * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      const duration = index === notes.length - 1 ? 0.4 : 0.15;
      const volume = index === notes.length - 1 ? 0.45 : 0.35;

      gain.gain.setValueAtTime(volume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 50, 40]);
    }
  } catch (err) {
    console.warn('Loot box sound error:', err);
  }
}

/**
  Backward compatibility pop sound
 */
export function playSatisfyingPopSound() {
  playCoinInsertSound();
}

export const playGlassClinkSound = playCoinInsertSound;
