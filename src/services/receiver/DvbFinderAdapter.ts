import { ReceiverConfig } from '../../types/satellite';
import { AdapterType, ConnectionResult, MotorCommand, TelemetryPacket } from '../../types/telemetry';
import { ReceiverAdapter } from './ReceiverAdapter';
import { SignalNormalizer } from '../telemetry/SignalNormalizer';
import { isValidIPv4, isValidPort } from './Ali2661Adapter';

export class DvbFinderAdapter implements ReceiverAdapter {
  public readonly type: AdapterType = 'dvbfinder';
  public readonly name = 'DVB-Finder Protocol Adapter';
  public readonly isSimulation = false;

  private connected: boolean = false;
  private currentConfig: ReceiverConfig | null = null;
  private normalizer = new SignalNormalizer();

  public validateConfig(config: ReceiverConfig): { isValid: boolean; error?: string; errorAr?: string } {
    if (!isValidIPv4(config.ip)) {
      return {
        isValid: false,
        error: `Invalid IP format: "${config.ip}"`,
        errorAr: `عنوان IP غير صالح: "${config.ip}"`
      };
    }
    if (!isValidPort(config.port)) {
      return {
        isValid: false,
        error: `Invalid port: ${config.port}`,
        errorAr: `رقم المنفذ غير صالح: ${config.port}`
      };
    }
    return { isValid: true };
  }

  public async connect(config: ReceiverConfig): Promise<ConnectionResult> {
    const val = this.validateConfig(config);
    if (!val.isValid) {
      return {
        success: false,
        state: 'error',
        errorCode: 'INVALID_IP',
        message: val.error || 'Invalid configuration',
        messageAr: val.errorAr || 'إعدادات غير صحيحة'
      };
    }

    this.currentConfig = config;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://${config.ip}:${config.port}/status.xml`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.connected = true;
        return {
          success: true,
          state: 'connected',
          latencyMs: Date.now() - startTime,
          message: `Connected via DVB-Finder on ${config.ip}:${config.port}`,
          messageAr: `تم الاتصال عبر بروتوكول DVB-Finder بنجاح`
        };
      }
      return {
        success: false,
        state: 'error',
        errorCode: 'REFUSED',
        message: `DVB-Finder endpoint unreachable (HTTP ${res.status})`,
        messageAr: `منفذ DVB-Finder غير متاح على الجهاز (${res.status})`
      };
    } catch {
      this.connected = false;
      return {
        success: false,
        state: 'error',
        errorCode: 'HOST_UNREACHABLE',
        message: `Failed to discover DVB-Finder service on ${config.ip}:${config.port}`,
        messageAr: `تعذر العثور على بث DVB-Finder على العنوان ${config.ip}:${config.port}`
      };
    }
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async readTelemetry(_transponderContext?: any): Promise<TelemetryPacket | null> {
    if (!this.connected) return null;
    return null;
  }

  public async sendMotorCommand(_cmd: MotorCommand): Promise<{ success: boolean; message: string }> {
    return { success: false, message: 'Motor command not implemented for DVB-Finder profile' };
  }
}
