// ─────────────────────────────────────────────────────────────────────────────
// audio.js — Romantic Web Audio synthesizer & SpeechRecognition/Synthesis voice engine
// ─────────────────────────────────────────────────────────────────────────────

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.voiceEnabled = true;
    this.voiceVolume = 1.0;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Play a soft romantic chord (C maj9: C4, E4, G4, B4, D5)
  playRomanticChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  }

  // Soft romantic heart flutter (two quick soft low thumps)
  playHeartbeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [0, 0.18].forEach((offset, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 80 : 65, now + offset);
      osc.frequency.exponentialRampToValueAtTime(30, now + offset + 0.15);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  }

  // Cute terminal beep for incoming dev message
  playMessageBeep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.06); // E5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Mic recording activation tone
  playMicTone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Celebratory harp flourish for gifts
  playGiftFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.09, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.0);
    });
  }

  // SpeechSynthesis: speak text in a realistic romantic character tone
  speakRomanticVoice(text, characterGender = 'female', lang = 'en', onEnd = null) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Clean markdown, terminal markers, or emojis for natural speech
    const cleanText = text
      .replace(/[`*#$>\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Fine-tune tone based on gender
    if (characterGender === 'female') {
      utterance.pitch = 1.25; // sweet, warm higher pitch
      utterance.rate = 0.94;  // relaxed romantic tempo
    } else {
      utterance.pitch = 0.85; // deep, smooth masculine pitch
      utterance.rate = 0.90;
    }

    utterance.volume = this.voiceVolume;

    // Pick a voice matching lang if possible
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferred = voices.find(v => {
        if (lang === 'am' && v.lang.startsWith('am')) return true;
        if (characterGender === 'female' && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Victoria') || v.name.includes('Google US English'))) return true;
        if (characterGender === 'male' && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Alex') || v.name.includes('Natural'))) return true;
        return v.lang.startsWith('en');
      });
      if (preferred) utterance.voice = preferred;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  stopVoice() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();

/**
 * Check if the browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Helper to create and start a speech recognition session
 */
export function createSpeechRecognizer({ onResult, onError, onEnd, lang = 'en-US' }) {
  if (typeof window === 'undefined') return null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  try {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      const isFinal = Boolean(event.results[0]?.isFinal);
      onResult?.(transcript, isFinal);
    };

    recognition.onerror = (event) => {
      onError?.(event.error || 'Speech recognition error');
    };

    recognition.onend = () => {
      onEnd?.();
    };

    return recognition;
  } catch (err) {
    onError?.(err.message);
    return null;
  }
}
