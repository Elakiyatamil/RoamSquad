let audioCtx = null;

/**
 * Web Audio API synthesizer for warm, soft tactile pop sound.
 * Target actions: Primary milestone buttons (Next/Continue in Itinerary, Gashapon insert coin/crank, Group cards)
 */
export function playSatisfyingPopSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const ctx = audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch sweep for a warm, soft tactile pop
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

    // Quick decay envelope
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);

    // Optional haptic tap on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
  } catch (err) {
    console.warn('Pop sound audio error:', err);
  }
}

export const playGlassClinkSound = playSatisfyingPopSound;
