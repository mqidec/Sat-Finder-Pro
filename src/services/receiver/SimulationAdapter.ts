import { ReceiverConfig } from '../../types/satellite';
import { AdapterType, ConnectionResult, MotorCommand, TelemetryPacket } from '../../types/telemetry';
import { ReceiverAdapter } from './ReceiverAdapter';
import { SignalNormalizer } from '../telemetry/SignalNormalizer';

export class SimulationAdapter implements ReceiverAdapter {
  public readonly type: AdapterType = 'simulation';
  public readonly name = 'Ali 2661 Virtual Simulator';
  public readonly isSimulation = true;

  private connected: boolean = false;
  private currentBaseSnr: number = 13.8;
  private normalizer = new SignalNormalizer();

  public validateConfig(_config: ReceiverConfig): { isValid: boolean; error?: string; errorAr?: string } {
    return { isValid: true };
  }

  public async connect(_config: ReceiverConfig): Promise<ConnectionResult> {
    this.connected = true;
    return {
      success: true,
      state: 'connected',
      message: 'Simulation adapter activated (Virtual Ali 2661 demodulator)',
      messageAr: 'تم تفعيل وضع المحاكاة بنجاح (تيونر افتراضي لمعاينة القياسات)',
      messageFr: 'Mode simulation activé (Démodulateur virtuel Ali 2661)',
      latencyMs: 8
    };
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public setBaseSnr(snr: number): void {
    this.currentBaseSnr = Math.max(0, Math.min(18.0, snr));
  }

  public async readTelemetry(transponderContext?: {
    frequency: number;
    symbolRate: number;
    polarity: string;
    modulation?: string;
  }): Promise<TelemetryPacket | null> {
    if (!this.connected) return null;

    // Small atmospheric / wind jitter (±0.15 dB)
    const jitter = (Math.random() - 0.49) * 0.3;
    const finalSnr = Math.max(0, Math.min(18.0, this.currentBaseSnr + jitter));

    const metrics = this.normalizer.normalize(
      {
        rawSnr: finalSnr,
        frequencyMhz: transponderContext?.frequency,
        symbolRate: transponderContext?.symbolRate,
        polarization: transponderContext?.polarity as any,
        modulation: transponderContext?.modulation as any
      },
      transponderContext as any
    );

    const packet: TelemetryPacket = {
      id: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      receivedAt: Date.now(),
      source: 'simulation',
      sourceDeviceName: 'Ali 2661 Virtual Demo',
      isSimulated: true,
      raw: {
        rawSnr: Math.round(finalSnr * 10) / 10,
        rawQuality: metrics.qualityPercent,
        rawStrength: metrics.strengthPercent,
        isLocked: metrics.isLocked
      },
      metrics,
      latencyMs: 5 + Math.floor(Math.random() * 8)
    };

    return packet;
  }

  public async sendMotorCommand(cmd: MotorCommand): Promise<{ success: boolean; message: string }> {
    const dirText = cmd.direction === 'east' ? 'East (الشرق)' : 'West (الغرب)';
    return {
      success: true,
      message: `[Simulated DiSEqC 1.2] Dish nudged towards ${dirText}`
    };
  }
}
