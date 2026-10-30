import { Modulation, Polarization, SignalMetrics } from './satellite';

export type AdapterType = 'simulation' | 'ali2661' | 'dvbfinder' | 'http_api';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error' | 'stale';

export interface RawTelemetryData {
  rawStrength?: number; // 0-100 or 0-255 device scale
  rawQuality?: number; // 0-100 or 0-65535
  rawSnr?: number; // raw register value
  rawBer?: number | string; // bit error rate from tuner demodulator
  rawAgc?: number; // automatic gain control
  isLocked?: boolean;
  frequencyMhz?: number;
  symbolRate?: number;
  polarization?: Polarization;
  modulation?: Modulation;
  tunerIndex?: number;
}

export interface TelemetryPacket {
  id: string;
  receivedAt: number; // UNIX timestamp in ms
  source: AdapterType;
  sourceDeviceName: string;
  isSimulated: boolean;
  raw: RawTelemetryData;
  metrics: SignalMetrics;
  latencyMs: number;
}

export interface SignalHistorySample {
  timestamp: number;
  snrDb: number;
  qualityPercent: number;
  isLocked: boolean;
}

export interface ConnectionResult {
  success: boolean;
  state: ConnectionState;
  message: string;
  messageAr: string;
  messageFr?: string;
  latencyMs?: number;
  errorCode?: 'INVALID_IP' | 'INVALID_PORT' | 'TIMEOUT' | 'HOST_UNREACHABLE' | 'REFUSED' | 'PROTOCOL_ERROR' | 'UNKNOWN';
  diagnosticHint?: string;
  diagnosticHintAr?: string;
}

export interface MotorCommand {
  action: 'step' | 'continuous' | 'goto' | 'stop';
  direction?: 'east' | 'west';
  steps?: number;
  satellitePosition?: number; // for USALS
}

export interface ObstacleEvaluation {
  userElevationDeg: number;
  minClearanceElevationDeg: number;
  isClear: boolean;
  clearanceMarginDeg: number;
  estimatedObstacleHeightLimitMeters?: number; // Max building height at distance D
  recommendationAr: string;
  recommendationFr: string;
  recommendationEn: string;
}
