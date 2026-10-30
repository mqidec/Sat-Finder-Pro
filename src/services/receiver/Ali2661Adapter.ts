import { ReceiverConfig } from '../../types/satellite';
import { AdapterType, ConnectionResult, MotorCommand, TelemetryPacket } from '../../types/telemetry';
import { ReceiverAdapter } from './ReceiverAdapter';
import { SignalNormalizer } from '../telemetry/SignalNormalizer';

/**
 * Validates IPv4 address string format and range
 */
export function isValidIPv4(ip: string): boolean {
  const trimmed = ip.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false; // No leading zeroes
  }
  return true;
}

/**
 * Validates TCP / UDP port number range
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export class Ali2661Adapter implements ReceiverAdapter {
  public readonly type: AdapterType = 'ali2661';
  public readonly name = 'Cristor Toro 700 / Ali M2661 Hardware Probe';
  public readonly isSimulation = false;

  private connected: boolean = false;
  private currentConfig: ReceiverConfig | null = null;
  private normalizer = new SignalNormalizer();

  public validateConfig(config: ReceiverConfig): { isValid: boolean; error?: string; errorAr?: string } {
    if (!isValidIPv4(config.ip)) {
      return {
        isValid: false,
        error: `Invalid IP address format: "${config.ip}". Must be a valid IPv4 (e.g. 192.168.1.15)`,
        errorAr: `عنوان IP غير صالح: "${config.ip}". يجب أن يكون بصيغة IPv4 صحيحة (مثال: 192.168.1.15)`
      };
    }

    if (!isValidPort(config.port)) {
      return {
        isValid: false,
        error: `Invalid port number: ${config.port}. Port must be between 1 and 65535`,
        errorAr: `رقم المنفذ غير صالح: ${config.port}. يجب أن يكون بين 1 و 65535`
      };
    }

    return { isValid: true };
  }

  public async connect(config: ReceiverConfig): Promise<ConnectionResult> {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      this.connected = false;
      return {
        success: false,
        state: 'error',
        errorCode: 'INVALID_IP',
        message: validation.error || 'Configuration validation failed',
        messageAr: validation.errorAr || 'فشل التحقق من صحة عنوان الجهاز',
        messageFr: 'Format IP ou port invalide'
      };
    }

    this.currentConfig = config;
    const startTime = Date.now();

    try {
      // Direct network probe to the Ali2661 receiver IP and port
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      // Probe receiver status endpoint
      const response = await fetch(`http://${config.ip}:${config.port}/api/status`, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json, text/plain, */*' }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        this.connected = true;
        const latencyMs = Date.now() - startTime;
        return {
          success: true,
          state: 'connected',
          latencyMs,
          message: `Connected to Cristor Toro 700 (${config.ip}:${config.port})`,
          messageAr: `تم الاتصال بجهاز Cristor Toro 700 (${config.ip}:${config.port}) بنجاح`,
          messageFr: `Connecté à Cristor Toro 700 (${config.ip}:${config.port})`
        };
      } else {
        this.connected = false;
        return {
          success: false,
          state: 'error',
          errorCode: 'REFUSED',
          message: `Receiver replied with HTTP error status: ${response.status}`,
          messageAr: `استجاب الرسيفر برمز خطأ: ${response.status}. تأكد من تفعيل خدمة التحكم بالشبكة في إعدادات الرسيفر`,
          messageFr: `Erreur HTTP ${response.status} reçue du récepteur`
        };
      }
    } catch (err: any) {
      this.connected = false;
      const isAbort = err?.name === 'AbortError';
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

      return {
        success: false,
        state: 'error',
        errorCode: isAbort ? 'TIMEOUT' : 'HOST_UNREACHABLE',
        message: isAbort
          ? `انتهت مهلة الاتصال بالجهاز (${config.ip}:${config.port}).`
          : `تعذر الاتصال بـ (${config.ip}:${config.port}). تأكد من إعدادات الشبكة أو استخدم وضع المحاكاة للتجربة الميدانية بدون رسيفر.`,
        messageAr: isAbort
          ? `انتهت مهلة الاتصال بالجهاز (${config.ip}:${config.port}). تأكد أن الرسيفر قيد التشغيل ومتصل بنفس شبكة الواي فاي.`
          : `تعذر الاتصال بـ (${config.ip}:${config.port}). تأكد من إعدادات الشبكة أو استخدم وضع المحاكاة للتجربة الميدانية بدون رسيفر.`,
        messageFr: isAbort
          ? `Délai d'attente dépassé pour ${config.ip}:${config.port}`
          : `Impossible de joindre ${config.ip}:${config.port}`,
        diagnosticHint: isHttps
          ? 'Browsers running over HTTPS block direct fetch to private LAN IPs (192.168.x.x) due to Mixed Content / Private Network policies. Install the native APK on Android or switch to Simulation Mode.'
          : 'Browsers enforce CORS / Mixed-Content security. If using local IP, ensure receiver supports WebSockets/HTTP CORS or use the simulator for dish aiming.',
        diagnosticHintAr: isHttps
          ? 'المتصفح يمنع الاتصال المباشر بالشبكة المحلية (192.168.x.x) بسبب حماية (Mixed Content). لتخطي هذا القيد، قم بتثبيت ملف الـ APK على هاتفك، أو اضغط زر "التبديل إلى وضع المحاكاة" لبدء ضبط الصحن فوراً.'
          : 'المتصفحات تطبق قيود أمان الشبكة. تأكد من تطابق شبكة الواي فاي أو استخدم وضع المحاكاة (Simulation Mode) إذا لم يكن الرسيفر متصلاً الآن.'
      };
    }
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async readTelemetry(transponderContext?: {
    frequency: number;
    symbolRate: number;
    polarity: string;
    modulation?: string;
  }): Promise<TelemetryPacket | null> {
    if (!this.connected || !this.currentConfig) {
      return null;
    }

    try {
      const response = await fetch(
        `http://${this.currentConfig.ip}:${this.currentConfig.port}/api/tuner/${this.currentConfig.tuner}/signal`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const metrics = this.normalizer.normalize(
        {
          rawSnr: data.snr || data.snrDb,
          rawQuality: data.quality || data.qualityPercent,
          rawStrength: data.strength || data.strengthPercent,
          rawBer: data.ber,
          isLocked: Boolean(data.lock || data.isLocked),
          frequencyMhz: data.frequency || transponderContext?.frequency,
          symbolRate: data.symbolRate || transponderContext?.symbolRate,
          polarization: data.polarity || (transponderContext?.polarity as any),
          modulation: data.modulation || (transponderContext?.modulation as any),
          tunerIndex: this.currentConfig.tuner
        },
        transponderContext as any
      );

      return {
        id: `ali-${Date.now()}`,
        receivedAt: Date.now(),
        source: 'ali2661',
        sourceDeviceName: 'Cristor Toro 700 (Hardware Tuner)',
        isSimulated: false,
        raw: {
          rawSnr: data.snr,
          rawQuality: data.quality,
          rawStrength: data.strength,
          rawBer: data.ber,
          isLocked: data.lock
        },
        metrics,
        latencyMs: 15
      };
    } catch {
      // Device packet missed or disconnected
      return null;
    }
  }

  public async sendMotorCommand(cmd: MotorCommand): Promise<{ success: boolean; message: string }> {
    if (!this.connected || !this.currentConfig) {
      return { success: false, message: 'Receiver is not connected' };
    }

    try {
      const res = await fetch(`http://${this.currentConfig.ip}:${this.currentConfig.port}/api/motor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd)
      });
      return {
        success: res.ok,
        message: res.ok ? 'Motor command executed' : `Receiver responded with status ${res.status}`
      };
    } catch (err: any) {
      return { success: false, message: `Failed to dispatch motor command: ${err?.message || 'Network error'}` };
    }
  }
}
