/**
 * Acoustic Audio Beeper Synthesizer for Satellite Dish Alignment
 * Implements pitch-frequency scaling and beep pulse cadence based on SNR dB and signal lock.
 */

class SatAudioBeeper {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isEnabled: boolean = false;
  private volume: number = 0.5;
  private intervalId: number | null = null;
  private currentSnr: number = 0;
  private isLocked: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public isAudioActive(): boolean {
    return this.isEnabled;
  }

  public toggle(): boolean {
    if (this.isEnabled) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start() {
    this.initContext();
    this.isEnabled = true;
    this.scheduleBeeps();
  }

  public stop() {
    this.isEnabled = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.osc = null;
    }
  }

  /**
   * Updates signal parameters and dynamically adjusts audio pitch & cadence
   */
  public updateSignal(snrDb: number, isLocked: boolean) {
    this.currentSnr = Math.max(0, snrDb);
    this.isLocked = isLocked;

    if (this.isEnabled) {
      this.scheduleBeeps();
    }
  }

  private scheduleBeeps() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (!this.isEnabled || !this.ctx) return;

    // If signal is zero or very close to zero, no sound or very rare click
    if (this.currentSnr <= 0.5) {
      return;
    }

    // High lock: SNR > 13.5 dB -> Super fast beeps or near continuous tone
    // SNR 10 - 13 dB -> Fast rapid beeps (100 - 180ms)
    // SNR 6 - 10 dB -> Medium beeps (250 - 450ms)
    // SNR 1 - 6 dB -> Slow searching clicks (600 - 900ms)
    let periodMs: number;
    let beepDurationMs: number;

    if (this.currentSnr >= 13.5) {
      periodMs = 90;
      beepDurationMs = 50;
    } else if (this.currentSnr >= 10.0) {
      periodMs = 160 - (this.currentSnr - 10) * 15;
      beepDurationMs = 70;
    } else if (this.currentSnr >= 6.0) {
      periodMs = 380 - (this.currentSnr - 6) * 50;
      beepDurationMs = 80;
    } else {
      periodMs = 850 - this.currentSnr * 75;
      beepDurationMs = 60;
    }

    // Play first immediate beep
    this.playTone(beepDurationMs);

    this.intervalId = window.setInterval(() => {
      if (this.isEnabled) {
        this.playTone(beepDurationMs);
      }
    }, periodMs);
  }

  private playTone(durationMs: number) {
    if (!this.ctx || !this.isEnabled || this.volume <= 0) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch calculation: 500 Hz (at 1 dB) to 2200 Hz (at 16 dB)
      // When locked, add harmonic clarity
      const baseFreq = 520 + Math.min(16, this.currentSnr) * 105;
      const freq = this.isLocked ? baseFreq * 1.08 : baseFreq;

      osc.type = this.isLocked ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Smooth envelope to prevent audio pops
      const peakVol = this.volume * 0.45;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakVol, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.01);
    } catch {
      // AudioContext safe catch
    }
  }
}

export const audioBeeper = new SatAudioBeeper();
