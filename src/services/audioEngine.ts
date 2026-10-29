/**
 * ASMR & Zen Sound Engine using native Web Audio API.
 * Generates authentic temple bells, wooden fish (mõ), singing bowls,
 * bamboo brooms, rain, streams, and gentle meditation drones.
 */

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private ambientBellTimer: number | null = null;
  private isAmbientBellActive: boolean = false;

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Tiếng chuông chùa vang vẳng từ xa (Distant Echo Temple Bell)
   * Authentic Buddhist Đại Hồng Chung reverberating across mist-covered mountains.
   */
  public playDistantEchoBell(pitch = 1, volume = 0.65) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 144 * pitch; // Deep sacred bronze tone

    // Master bell gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(volume, t);

    // Atmospheric low-pass filter (mist and distance absorption)
    const distanceFilter = this.ctx.createBiquadFilter();
    distanceFilter.type = 'lowpass';
    distanceFilter.frequency.setValueAtTime(1300, t);
    distanceFilter.Q.value = 1.1;

    // Mountain reflection / reverberation delay
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.38; // 380ms mountain reflection
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = 0.32;
    const delayFilter = this.ctx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 750;

    // Connect echo network
    distanceFilter.connect(masterGain);
    distanceFilter.connect(delay);
    delay.connect(delayFilter);
    delayFilter.connect(delayGain);
    delayGain.connect(masterGain);
    delayGain.connect(delay); // Feedback
    masterGain.connect(this.ctx.destination);

    // Bell harmonic spectrum:
    // [hum, prime, tierce (minor 3rd), quint (5th), nominal (octave), overtones]
    const spectrum = [
      { ratio: 0.5, gain: 0.55, decay: 13.0, type: 'sine' as OscillatorType },    // Hum note: 72Hz deep sub vibration
      { ratio: 1.0, gain: 0.65, decay: 11.5, type: 'sine' as OscillatorType },    // Prime strike note
      { ratio: 1.183, gain: 0.42, decay: 10.0, type: 'sine' as OscillatorType },  // Minor 3rd: signature Buddhist bell sound
      { ratio: 1.506, gain: 0.28, decay: 8.0, type: 'triangle' as OscillatorType },// Quint
      { ratio: 2.00, gain: 0.22, decay: 6.5, type: 'sine' as OscillatorType },    // Nominal octave
      { ratio: 2.76, gain: 0.12, decay: 5.0, type: 'triangle' as OscillatorType },// Overtones
      { ratio: 3.98, gain: 0.08, decay: 3.8, type: 'sine' as OscillatorType },
    ];

    spectrum.forEach((part) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const partGain = this.ctx.createGain();

      osc.type = part.type;
      osc.frequency.setValueAtTime(baseFreq * part.ratio, t);

      // Gentle mallet strike swell (0.04s) and natural lingering exponential decay
      partGain.gain.setValueAtTime(0.001, t);
      partGain.gain.linearRampToValueAtTime(part.gain, t + 0.05);
      partGain.gain.exponentialRampToValueAtTime(0.00004, t + part.decay);

      osc.connect(partGain);
      partGain.connect(distanceFilter);

      osc.start(t);
      osc.stop(t + part.decay);
    });
  }

  /**
   * Bật chuông chùa định kỳ vang vẳng tự động mỗi 20s
   */
  public startAmbientTempleBells(intervalSec = 22) {
    if (this.ambientBellTimer) return;
    this.isAmbientBellActive = true;
    this.playDistantEchoBell(1, 0.6);

    if (typeof window !== 'undefined') {
      this.ambientBellTimer = window.setInterval(() => {
        if (!this.isAmbientBellActive || this.isMuted) return;
        const pitchVar = 0.97 + Math.random() * 0.06;
        this.playDistantEchoBell(pitchVar, 0.55);
      }, intervalSec * 1000);
    }
  }

  public stopAmbientTempleBells() {
    this.isAmbientBellActive = false;
    if (this.ambientBellTimer) {
      if (typeof window !== 'undefined') window.clearInterval(this.ambientBellTimer);
      this.ambientBellTimer = null;
    }
  }

  public getIsAmbientBellActive(): boolean {
    return this.isAmbientBellActive;
  }

  /**
   * Tiếng chuông đại hồng chung (Temple Bell)
   */
  public playTempleBell(pitch = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 216 * pitch; // Healing harmonic frequency
    const harmonics = [1, 2.02, 2.98, 4.15, 5.43];
    const gains = [0.4, 0.25, 0.15, 0.08, 0.04];

    harmonics.forEach((h, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * h, t);

      // Bell envelope: instant punch, long slow warm decay
      const decayDuration = 4.5 + idx * 0.5;
      gain.gain.setValueAtTime(gains[idx], t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decayDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + decayDuration);
    });
  }

  /**
   * Tiếng gõ mõ (Wooden Fish / Temple Block)
   * Hollow wooden knock with cavity resonance.
   */
  public playWoodenFish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Main body sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    
    // Pitch drop gives the hollow wood knock feel
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    // Wood click noise burst
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 3;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Tiếng chuông xoay Tây Tạng (Singing Bowl)
   * 432Hz pure sinusoidal tone with gentle pulsation for meditation.
   */
  public playSingingBowl() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Gentle vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 4.2; // 4.2Hz alpha wave modulation
    lfoGain.gain.value = 3;
    lfo.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 6.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);
    lfo.stop(t + 6.0);
    osc.stop(t + 6.0);
  }

  /**
   * Tiếng chổi tre quét lá khô (Bamboo Broom Sweep)
   * Filtered noise with swish envelope.
   */
  public playBroomSweep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.linearRampToValueAtTime(900, t + 0.35);
    filter.Q.value = 2.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  /**
   * Tiếng chuông gió (Wind Chimes)
   */
  public playWindChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const pentatonic = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760];
    const count = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < count; i++) {
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const delay = i * 0.15 + Math.random() * 0.1;
      const t = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.0);
    }
  }

  /**
   * Tiếng rót trà vào chén (Tea Pouring)
   */
  public playTeaPour() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 1.2;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1100, t + dur); // Pitch rises as cup fills!
    filter.Q.value = 5.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  /**
   * Âm thanh đạt Đốn Ngộ / Thành tựu (Enlightenment Chord)
   */
  public playEnlightenment() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [216, 270, 324, 432, 540]; // Just intonation major harmony
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 3.5);
    });
  }

  /**
   * Âm thanh cảnh báo Anti-Rush (Stumble / Rushing penalty)
   */
  public playAntiRushStumble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Bật nhạc nền thiền tĩnh tâm (Zen Ambient Drone)
   */
  public startZenAmbient() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.droneOscillators.length > 0) return;

    const t = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.12, t);
    this.ambientGain.connect(this.ctx.destination);

    // 108Hz and 162Hz fifth harmonic drone
    const droneFreqs = [108, 162, 216];
    droneFreqs.forEach((freq) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      osc.connect(filter);
      filter.connect(this.ambientGain);
      osc.start();
      this.droneOscillators.push(osc);
    });
  }

  public playBell(freq = 432, _duration = 3.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    if (freq <= 350) {
      this.playDistantEchoBell(freq / 216, 0.65);
    } else {
      this.playTempleBell(freq / 432);
    }
  }

  public playSweep() {
    this.playBroomSweep();
  }

  public playWarning() {
    this.playAntiRushStumble();
  }

  /**
   * Tiếng chẻ củi (Wood Chopping Impact & Crack)
   */
  public playWoodChop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Heavy axe impact thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);

    // 2. Wood snap / crackle noise burst
    const dur = 0.22;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.value = 3.0;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  /**
   * Tiếng múc nước suối & rót nước vào lu (Water Ladle & Pouring)
   */
  public playWaterPour() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 1.1;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(950, t + dur);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  /**
   * Tiếng chuông khánh đồng thanh tao (Altar Chime)
   */
  public playAltarChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freq = 1056; // High clear sacred bell

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 3.2);
  }

  /**
   * Âm thanh thiện tâm / Bố thí hoan hỷ (Warm Charity Arpeggio)
   */
  public playCharityChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [528, 660, 792, 1056];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 2.0);
    });
  }
}

export const soundEngine = new ZenAudioEngine();
