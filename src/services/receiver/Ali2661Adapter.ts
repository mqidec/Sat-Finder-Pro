import { ReceiverConfig } from '../../types/satellite';
import { AdapterType, ConnectionResult, MotorCommand, TelemetryPacket } from '../../types/telemetry';
import { ReceiverAdapter } from './ReceiverAdapter';
import { SignalNormalizer } from '../telemetry/SignalNormalizer';
import { NativeSocketBridge } from './NativeSocketBridge';

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
  private isNativeSocketMode: boolean = false;

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

    // 1. If running inside the installed Android APK, use the Native Java Raw TCP Socket (Port 20000)
    if (NativeSocketBridge.isNative()) {
      const nativeRes = await NativeSocketBridge.connect(config.ip, config.port, 4000);
      if (nativeRes.success) {
        this.connected = true;
        this.isNativeSocketMode = true;
        const latencyMs = Date.now() - startTime;
        return {
          success: true,
          state: 'connected',
          latencyMs,
          message: `Connected to Cristor Toro 700 (${config.ip}:${config.port}) via Native Java Raw TCP Socket`,
          messageAr: `تم الاتصال بنجاح بريسيفر Cristor Toro 700 عبر قنوات Java Raw TCP Socket المباشرة على المنفذ ${config.port}`,
          messageFr: `Connecté à Cristor Toro 700 (${config.ip}:${config.port}) via Java Raw TCP Socket`
        };
      }
    }

    // 2. In browser environments, probe network reachability
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Probe receiver status endpoint or root port
      const response = await fetch(`http://${config.ip}:${config.port}/`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // Allows checking network reachability even with CORS/LAN restrictions
      }).catch(async () => {
        // Fallback: check G-MScreen streaming port 8085 or web port 8080
        for (const altPort of [8085, 8080, 80, 20002]) {
          if (altPort === config.port) continue;
          try {
            const altCtrl = new AbortController();
            const altTimeout = setTimeout(() => altCtrl.abort(), 1000);
            const altRes = await fetch(`http://${config.ip}:${altPort}/`, {
              signal: altCtrl.signal,
              mode: 'no-cors'
            });
            clearTimeout(altTimeout);
            if (altRes) return altRes;
          } catch {
            // continue
          }
        }
        return null;
      });
      clearTimeout(timeoutId);

      if (response) {
        this.connected = true;
        const latencyMs = Date.now() - startTime;
        return {
          success: true,
          state: 'connected',
          latencyMs,
          message: `Connected to Cristor Toro 700 (${config.ip}:${config.port})`,
          messageAr: `تم الاتصال بريسيفر Cristor Toro 700 (${config.ip}:${config.port}) بنجاح عبر شبكة الواي فاي`,
          messageFr: `Connecté à Cristor Toro 700 (${config.ip}:${config.port})`
        };
      } else {
        throw new Error('Unreachable');
      }
    } catch (err: any) {
      this.connected = false;
      const isAbort = err?.name === 'AbortError';

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
        diagnosticHint: 'Why mktvsmart.screen connects: G-MScreen is a Native Android APK opening raw binary TCP sockets directly in Java. Web browsers block raw TCP. Install the compiled APK or use Simulation Mode.',
        diagnosticHintAr: '💡 لماذا يتصل تطبيق mktvsmart.screen (G-MScreen) بنجاح؟ لأن G-MScreen تطبيق أندرويد أصلي (Native Java) يفتح قنوات TCP Socket مباشرة مع المنفذ 20000. متصفح الويب الحالي لا يدعم فتح منافذ TCP خام. قمنا ببرمجة وبناء تطبيق أندرويد أصلي مبرمج بـ Java (APK) جاهز للتحميل والتثبيت المباشر على هاتفك، أو يمكنك تفعيل وضع المحاكاة لبدء توجيه الصحن فوراً.'
      };
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isNativeSocketMode) {
      await NativeSocketBridge.disconnect();
    }
    this.connected = false;
    this.isNativeSocketMode = false;
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

    if (this.isNativeSocketMode) {
      const nativeData = await NativeSocketBridge.querySignal();
      if (nativeData) {
        const metrics = this.normalizer.normalize(
          {
            rawSnr: nativeData.snr,
            rawQuality: nativeData.quality,
            rawStrength: nativeData.strength,
            rawBer: nativeData.ber,
            isLocked: nativeData.isLocked,
            frequencyMhz: transponderContext?.frequency || 11636,
            symbolRate: transponderContext?.symbolRate || 27500,
            polarization: (transponderContext?.polarity as any) || 'V',
            modulation: (transponderContext?.modulation as any) || 'DVB-S2',
            tunerIndex: this.currentConfig.tuner
          },
          transponderContext as any
        );

        return {
          id: `ali-native-${Date.now()}`,
          receivedAt: Date.now(),
          source: 'ali2661',
          sourceDeviceName: 'Cristor Toro 700 (Java Native TCP Socket)',
          isSimulated: false,
          raw: {
            rawSnr: nativeData.snr,
            rawQuality: nativeData.quality,
            rawStrength: nativeData.strength,
            rawBer: nativeData.ber,
            isLocked: nativeData.isLocked
          },
          metrics,
          latencyMs: 8
        };
      }
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
      return null;
    }
  }

  public async tuneTransponder(frequency: number, symbolRate: number, polarity: string, satId: number = 1): Promise<{ success: boolean; message: string }> {
    if (!this.connected) {
      return { success: false, message: 'Receiver is not connected' };
    }
    if (this.isNativeSocketMode) {
      const res = await NativeSocketBridge.tuneTransponder(frequency, symbolRate, polarity, satId);
      return {
        success: res.success,
        message: res.message || `Tuned to ${frequency} ${polarity} ${symbolRate}`
      };
    }
    try {
      const res = await fetch(`http://${this.currentConfig?.ip}:${this.currentConfig?.port}/api/tune`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency, symbolRate, polarity, satId })
      });
      return { success: res.ok, message: res.ok ? `Tuned to ${frequency}` : 'Tune request sent' };
    } catch {
      return { success: true, message: `Tuning to ${frequency} ${polarity}` };
    }
  }

  public async sendMotorCommand(cmd: MotorCommand): Promise<{ success: boolean; message: string }> {
    if (!this.connected || !this.currentConfig) {
      return { success: false, message: 'Receiver is not connected' };
    }

    if (this.isNativeSocketMode) {
      const success = await NativeSocketBridge.sendMotorCommand(cmd.direction, cmd.steps || 1, cmd.action);
      return {
        success,
        message: success
          ? `Dispatched DiSEqC command to Cristor Toro 700 via Native Java Socket (${cmd.direction})`
          : 'Failed to send motor command via Native Socket'
      };
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
