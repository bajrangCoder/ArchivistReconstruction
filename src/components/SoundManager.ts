
class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  private resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(80, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    thumpGain.gain.setValueAtTime(0.4, now);
    thumpGain.gain.linearRampToValueAtTime(0, now + 0.15);
    thump.connect(thumpGain);
    thumpGain.connect(this.ctx.destination);
    thump.start();
    thump.stop(now + 0.15);

    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(200 + Math.random() * 50, now);
    popGain.gain.setValueAtTime(0.15, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    pop.connect(popGain);
    popGain.connect(this.ctx.destination);
    pop.start();
    pop.stop(now + 0.1);
  }

  playDestroy() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.4);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();

    [100, 150].forEach(f => {
      const ctx = this.ctx!;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.2, now);
      g.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.4);
    });
  }

  playCombo() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const ctx = this.ctx!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6 + i * 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + 0.7 + i * 0.08);
    });

    this.playDestroy();
  }

  playInvalid() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(60, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.2);
  }

  playRefill() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }

  playStart() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.0);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 1.2);
  }

  playGameOver() {
    if (this.muted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low, somber minor chord resonance
    [55, 65.41, 82.41, 110].forEach((freq, i) => {
      const ctx = this.ctx!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 3.0);
      
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.5 + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      
      const panner = ctx.createStereoPanner();
      panner.pan.value = (i / 3) * 2 - 1;
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + 4.0);
    });

    // Sub-bass impact
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, now);
    subGain.gain.setValueAtTime(0.3, now);
    subGain.gain.linearRampToValueAtTime(0, now + 1.5);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start();
    sub.stop(now + 1.5);
  }
}

export const soundManager = new SoundManager();
