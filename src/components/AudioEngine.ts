class AudioEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playBeep(freq = 800, duration = 0.08, type: OscillatorType = "sine") {
    try {
      this.init();
      if (!this.ctx) return;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context disabled or not allowed
    }
  }

  playClick() {
    this.playBeep(1200, 0.03, "triangle");
  }

  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.playBeep(600, 0.08);
      setTimeout(() => this.playBeep(900, 0.12), 80);
    } catch (e) {}
  }

  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      this.playBeep(180, 0.25, "sawtooth");
    } catch (e) {}
  }

  playTyping() {
    const randomFreq = 600 + Math.random() * 800;
    this.playBeep(randomFreq, 0.01, "sine");
  }

  playAccessGranted() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.playBeep(523.25, 0.1); // C5
      setTimeout(() => this.playBeep(659.25, 0.1), 100); // E5
      setTimeout(() => this.playBeep(783.99, 0.12), 200); // G5
      setTimeout(() => this.playBeep(1046.50, 0.15), 300); // C6
    } catch (e) {}
  }
}

export const sound = new AudioEngine();
export default sound;
