export type SatBand = 'KU' | 'C' | 'KA';
export type Polarization = 'H' | 'V' | 'L' | 'R';
export type Modulation = 'DVB-S QPSK' | 'DVB-S2 QPSK' | 'DVB-S2 8PSK' | 'DVB-S2X';

export interface Transponder {
  id: string;
  frequency: number; // e.g. 11636 MHz
  polarity: Polarization;
  symbolRate: number; // e.g. 27500
  fec?: string; // e.g. '5/6', '2/3', '3/4', '8/9'
  modulation: Modulation;
  description?: string;
  beam?: string; // e.g. "MENA", "Europe Wide", "North Africa", "Global"
  isFta?: boolean; // Free-to-Air reference transponder
  channels?: string[]; // e.g. ["Al Masriya", "Nile News", "ERTU 1"]
  isCustom?: boolean;
}

export interface Satellite {
  id: string;
  name: string;
  nameAr: string;
  pos: number; // Positive = East (e.g. 19.2), Negative = West (e.g. -7.0)
  band: SatBand;
  lnbDefault: string; // e.g. "9750/10600", "5150", "10750"
  region: string;
  orbitalSlot: string; // e.g. "7.0°W", "19.2°E"
  kingOfSatUrl?: string; // Official KingOfSat directory link
  kingOfSatSlug?: string;
  transponders: Transponder[];
  isCustom?: boolean;
  isFavorite?: boolean;
}

export interface SignalMetrics {
  snrDb: number; // Signal to Noise Ratio in dB (0.0 - 18.0)
  qualityPercent: number; // 0 - 100%
  strengthPercent: number; // 0 - 100%
  strengthDbm: number; // e.g. -45 dBm
  ber: string; // Bit Error Rate, e.g. "1.0E-07"
  isLocked: boolean;
  modulation: Modulation;
  frequencyMhz: number;
  symbolRate: number;
  polarization: Polarization;
}

export interface DishCalculation {
  azimuthTrue: number; // degrees 0 - 360
  azimuthMagnetic: number; // degrees 0 - 360
  elevation: number; // degrees -10 to 90
  lnbSkew: number; // degrees -90 to +90
  distanceKm: number;
  isLineOfSight: boolean;
}

export interface UserLocation {
  name: string;
  nameAr: string;
  latitude: number;
  longitude: number;
  isGps?: boolean;
}

export interface ReceiverConfig {
  ip: string;
  port: number;
  protocol: 'ali2661' | 'dvbfinder' | 'http_api' | 'simulation';
  isConnected: boolean;
  model: string;
  tuner: number;
  isSimulating: boolean;
  lastPingMs: number | null;
}
