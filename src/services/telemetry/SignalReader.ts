import { ReceiverConfig, SignalMetrics, Transponder } from '../../types/satellite';
import { ConnectionResult, ConnectionState, SignalHistorySample, TelemetryPacket } from '../../types/telemetry';
import { ReceiverAdapter } from '../receiver/ReceiverAdapter';
import { SimulationAdapter } from '../receiver/SimulationAdapter';
import { Ali2661Adapter } from '../receiver/Ali2661Adapter';
import { DvbFinderAdapter } from '../receiver/DvbFinderAdapter';
import { SignalNormalizer } from './SignalNormalizer';

export type TelemetryListener = (packet: TelemetryPacket) => void;
export type ConnectionListener = (state: ConnectionState, result?: ConnectionResult) => void;

export class SignalReader {
  private static instance: SignalReader | null = null;

  private adapter: ReceiverAdapter;
  private config: ReceiverConfig;
  private currentContext: Transponder | null = null;
  private pollingTimer: number | null = null;
  private pollIntervalMs: number = 400; // 2.5 Hz refresh rate

  private lastPacket: TelemetryPacket | null = null;
  private lastPacketTime: number = 0;
  private connectionState: ConnectionState = 'disconnected';

  private telemetryListeners: Set<TelemetryListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private normalizer = new SignalNormalizer();

  private constructor() {
    this.config = {
      ip: '192.168.1.15',
      port: 20000,
      protocol: 'simulation',
      isConnected: false,
      model: 'Cristor Toro 700 4K',
      tuner: 1,
      isSimulating: true,
      lastPingMs: null
    };
    this.adapter = new SimulationAdapter();
  }

  public static getInstance(): SignalReader {
    if (!SignalReader.instance) {
      SignalReader.instance = new SignalReader();
    }
    return SignalReader.instance;
  }

  public getAdapter(): ReceiverAdapter {
    return this.adapter;
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getLastPacket(): TelemetryPacket | null {
    return this.lastPacket;
  }

  public getHistory(): SignalHistorySample[] {
    return this.normalizer.getHistory();
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    if (this.lastPacket) {
      listener(this.lastPacket);
    }
    return () => this.telemetryListeners.delete(listener);
  }

  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connectionState);
    return () => this.connectionListeners.delete(listener);
  }

  public setTransponderContext(tp: Transponder): void {
    this.currentContext = tp;
  }

  public async setConfiguration(newConfig: ReceiverConfig): Promise<ConnectionResult> {
    this.config = newConfig;

    // Switch adapter based on protocol
    if (newConfig.protocol === 'simulation' || newConfig.isSimulating) {
      this.adapter = new SimulationAdapter();
    } else if (newConfig.protocol === 'ali2661') {
      this.adapter = new Ali2661Adapter();
    } else {
      this.adapter = new DvbFinderAdapter();
    }

    this.connectionState = 'connecting';
    this.notifyConnection(this.connectionState);

    const result = await this.adapter.connect(newConfig);

    if (result.success) {
      this.connectionState = 'connected';
      this.startPolling();
    } else {
      this.connectionState = 'error';
      this.stopPolling();
    }

    this.notifyConnection(this.connectionState, result);
    return result;
  }

  public setSimulationSnr(snr: number): void {
    if (this.adapter instanceof SimulationAdapter) {
      this.adapter.setBaseSnr(snr);
    }
  }

  public startPolling(): void {
    this.stopPolling();
    this.pollingTimer = window.setInterval(async () => {
      await this.pollOnce();
    }, this.pollIntervalMs);
  }

  public stopPolling(): void {
    if (this.pollingTimer !== null) {
      window.clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private async pollOnce(): Promise<void> {
    if (!this.adapter.isConnected()) {
      if (this.connectionState === 'connected') {
        this.connectionState = 'disconnected';
        this.notifyConnection(this.connectionState);
      }
      return;
    }

    const tp = this.currentContext;
    const packet = await this.adapter.readTelemetry(
      tp
        ? {
            frequency: tp.frequency,
            symbolRate: tp.symbolRate,
            polarity: tp.polarity,
            modulation: tp.modulation
          }
        : undefined
    );

    if (packet) {
      this.lastPacket = packet;
      this.lastPacketTime = Date.now();
      this.normalizer.recordSample(packet);
      this.notifyTelemetry(packet);
    } else {
      // Packet dropped or timeout: check if connection is stale (> 2500ms without packet)
      if (Date.now() - this.lastPacketTime > 2500 && this.connectionState === 'connected') {
        this.connectionState = 'stale';
        this.notifyConnection(this.connectionState);
      }
    }
  }

  private notifyTelemetry(packet: TelemetryPacket): void {
    for (const listener of this.telemetryListeners) {
      try {
        listener(packet);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    }
  }

  private notifyConnection(state: ConnectionState, result?: ConnectionResult): void {
    for (const listener of this.connectionListeners) {
      try {
        listener(state, result);
      } catch (err) {
        console.error('Error in connection listener:', err);
      }
    }
  }
}

export const signalReader = SignalReader.getInstance();
