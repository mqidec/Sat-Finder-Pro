import { Modulation, Polarization, SignalMetrics } from '../../types/satellite';
import { RawTelemetryData, SignalHistorySample, TelemetryPacket } from '../../types/telemetry';

export class SignalNormalizer {
  private history: SignalHistorySample[] = [];
  private readonly maxHistoryLength = 30;

  /**
   * Evaluates minimum SNR threshold required for carrier lock based on modulation scheme
   */
  public static getLockThresholdDb(modulation: Modulation = 'DVB-S2 8PSK'): number {
    switch (modulation) {
      case 'DVB-S QPSK':
        return 5.5;
      case 'DVB-S2 QPSK':
        return 6.5;
      case 'DVB-S2 8PSK':
        return 8.2;
      case 'DVB-S2X':
        return 9.0;
      default:
        return 7.5;
    }
  }

  /**
   * Normalizes raw receiver hardware registers into calibrated SignalMetrics
   */
  public normalize(
    raw: RawTelemetryData,
    fallbackContext?: {
      frequency?: number;
      symbolRate?: number;
      polarization?: Polarization;
      modulation?: Modulation;
    }
  ): SignalMetrics {
    const modulation = raw.modulation || fallbackContext?.modulation || 'DVB-S2 8PSK';
    const lockThreshold = SignalNormalizer.getLockThresholdDb(modulation);

    // 1. Determine SNR in dB
    let snrDb = 0;
    if (typeof raw.rawSnr === 'number' && !isNaN(raw.rawSnr)) {
      // If receiver sends calibrated dB (e.g. 0-18 dB) or 0-100 register
      snrDb = raw.rawSnr > 30 ? (raw.rawSnr / 100) * 16.5 : raw.rawSnr;
    } else if (typeof raw.rawQuality === 'number' && !isNaN(raw.rawQuality)) {
      // Quality % to SNR dB mapping: 0% -> 4.0 dB, 100% -> 16.0 dB
      snrDb = 4.0 + (Math.max(0, Math.min(100, raw.rawQuality)) / 100) * 12.0;
    }
    snrDb = Math.round(Math.max(0, Math.min(22.0, snrDb)) * 10) / 10;

    // 2. Lock status
    const isLocked = raw.isLocked !== undefined ? Boolean(raw.isLocked) : snrDb >= lockThreshold;

    // 3. Quality Percentage
    let qualityPercent = 0;
    if (typeof raw.rawQuality === 'number' && !isNaN(raw.rawQuality)) {
      qualityPercent = Math.min(100, Math.max(0, Math.round(raw.rawQuality)));
    } else {
      if (snrDb > 4.5) {
        qualityPercent = Math.min(100, Math.max(0, Math.round(((snrDb - 4.5) / 11.5) * 100)));
      }
    }

    // 4. Strength Percentage & Signal Power (dBm)
    let strengthPercent = 0;
    if (typeof raw.rawStrength === 'number' && !isNaN(raw.rawStrength)) {
      strengthPercent = Math.min(100, Math.max(0, Math.round(raw.rawStrength)));
    } else {
      // Estimate RF strength based on AGC or SNR baseline
      strengthPercent = isLocked ? Math.min(98, Math.round(50 + (snrDb / 18) * 45)) : 25;
    }
    // Convert 0-100% strength to approximate RF power in dBm (-85 dBm to -35 dBm)
    const strengthDbm = Math.round(-85 + (strengthPercent / 100) * 50);

    // 5. Bit Error Rate (BER)
    let ber = '--';
    if (raw.rawBer !== undefined && raw.rawBer !== null) {
      ber = String(raw.rawBer);
    } else if (isLocked) {
      if (snrDb >= 13.5) ber = '< 1.0E-07';
      else if (snrDb >= 11.0) ber = '1.8E-06';
      else if (snrDb >= 9.0) ber = '3.4E-05';
      else ber = '8.2E-04';
    } else {
      ber = snrDb > 4.5 ? '4.8E-02' : '9.9E-01';
    }

    return {
      snrDb,
      qualityPercent,
      strengthPercent,
      strengthDbm,
      ber,
      isLocked,
      modulation,
      frequencyMhz: raw.frequencyMhz || fallbackContext?.frequency || 11636,
      symbolRate: raw.symbolRate || fallbackContext?.symbolRate || 27500,
      polarization: raw.polarization || fallbackContext?.polarization || 'V'
    };
  }

  /**
   * Pushes packet into moving history buffer
   */
  public recordSample(packet: TelemetryPacket): void {
    this.history.push({
      timestamp: packet.receivedAt,
      snrDb: packet.metrics.snrDb,
      qualityPercent: packet.metrics.qualityPercent,
      isLocked: packet.metrics.isLocked
    });

    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  /**
   * Returns current history for visualization
   */
  public getHistory(): SignalHistorySample[] {
    return [...this.history];
  }

  /**
   * Clears signal history buffer
   */
  public clearHistory(): void {
    this.history = [];
  }
}
