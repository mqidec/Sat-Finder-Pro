import { DishCalculation, Satellite } from '../types/satellite';

// Earth radius in kilometers
const RE = 6378.137;
// Geostationary satellite orbit radius in kilometers (Earth radius + ~35,786 km)
const RS = 42164.57;

/**
 * Converts degrees to radians
 */
const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Converts radians to degrees
 */
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Calculates dish pointing parameters:
 * - True Azimuth
 * - Elevation
 * - LNB Polarization Tilt / Skew
 * - Distance to satellite (km)
 */
export function calculateDishAngles(
  userLat: number,
  userLon: number,
  satLon: number
): DishCalculation {
  const latR = toRad(userLat);
  const deltaLon = satLon - userLon;
  const deltaLonR = toRad(deltaLon);

  // 1. Elevation Calculation
  // cos(g) = cos(lat) * cos(deltaLon)
  const cosG = Math.cos(latR) * Math.cos(deltaLonR);
  
  // Elevation angle:
  // tan(El) = (cos(g) - (RE / RS)) / sin(g)
  const sinG = Math.sqrt(Math.max(0, 1 - cosG * cosG));
  let elevation = 0;
  
  if (sinG !== 0) {
    const elRad = Math.atan((cosG - (RE / RS)) / sinG);
    elevation = toDeg(elRad);
  }

  // Check if satellite is above horizon
  const isLineOfSight = elevation > 0;

  // 2. Azimuth Calculation
  let azimuthTrue = 0;
  if (Math.abs(userLat) > 0.0001) {
    const azRad = Math.PI + Math.atan2(-Math.sin(deltaLonR), Math.tan(latR));
    azimuthTrue = toDeg(azRad);
    
    // Normalize to 0 - 360
    if (azimuthTrue < 0) azimuthTrue += 360;
    if (azimuthTrue >= 360) azimuthTrue -= 360;
  } else {
    // On the equator
    azimuthTrue = deltaLon > 0 ? 90 : 270;
  }

  // 3. LNB Skew / Polarization Tilt Calculation
  // Positive = Clockwise looking into dish from front of LNB
  let lnbSkew = 0;
  if (Math.abs(userLat) > 0.001) {
    const skewRad = Math.atan(Math.sin(deltaLonR) / Math.tan(latR));
    lnbSkew = toDeg(skewRad);
  }

  // 4. Distance to Satellite:
  // d = sqrt(RE^2 + RS^2 - 2*RE*RS*cos(g))
  const distanceKm = Math.round(
    Math.sqrt(RE * RE + RS * RS - 2 * RE * RS * cosG)
  );

  // Magnetic Azimuth (Rough magnetic declination estimation based on lon/lat)
  const approxDeclination = Math.sin(toRad(userLon)) * 2.5;
  let azimuthMagnetic = azimuthTrue - approxDeclination;
  if (azimuthMagnetic < 0) azimuthMagnetic += 360;
  if (azimuthMagnetic >= 360) azimuthMagnetic -= 360;

  return {
    azimuthTrue: Math.round(azimuthTrue * 10) / 10,
    azimuthMagnetic: Math.round(azimuthMagnetic * 10) / 10,
    elevation: Math.round(elevation * 10) / 10,
    lnbSkew: Math.round(lnbSkew * 10) / 10,
    distanceKm,
    isLineOfSight
  };
}

/**
 * Format orbital position nicely (e.g., "7.0°W" or "19.2°E")
 */
export function formatOrbitalPos(pos: number): string {
  if (pos === 0) return '0.0°';
  const abs = Math.abs(pos).toFixed(1);
  return pos > 0 ? `${abs}°E` : `${abs}°W`;
}

/**
 * Computes Haversine ground distance between two lat/lon coordinates in kilometers
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(RE * c);
}

export interface SatelliteSuggestion {
  satellite: Satellite;
  angles: DishCalculation;
  distanceDeltaLon: number; // |sat.pos - userLon|
  isZenith: boolean; // Highest elevation in sky
  receptionQuality: 'OPTIMAL' | 'VERY_GOOD' | 'GOOD' | 'MARGINAL';
  installerNote: string;
}

/**
 * Suggests the nearest / best satellites based on real-world device coordinates
 */
export function suggestNearestSatellites(
  userLat: number,
  userLon: number,
  satellites: Satellite[]
): SatelliteSuggestion[] {
  const calculated = satellites
    .map((sat) => {
      const angles = calculateDishAngles(userLat, userLon, sat.pos);
      const distanceDeltaLon = Math.abs(sat.pos - userLon);
      return {
        satellite: sat,
        angles,
        distanceDeltaLon
      };
    })
    .filter((item) => item.angles.isLineOfSight && item.angles.elevation >= 10.0);

  // Sort primarily by highest elevation (zenith proximity = highest overhead, shortest path through atmosphere)
  calculated.sort((a, b) => b.angles.elevation - a.angles.elevation);

  const highestElevation = calculated.length > 0 ? calculated[0].angles.elevation : 0;

  return calculated.map((item, index) => {
    const isZenith = index === 0;
    let receptionQuality: 'OPTIMAL' | 'VERY_GOOD' | 'GOOD' | 'MARGINAL' = 'GOOD';
    let installerNote = '';

    if (item.angles.elevation >= 42) {
      receptionQuality = 'OPTIMAL';
      installerNote = isZenith
        ? 'الأقرب والأعلى في سمائك (أقل مسار جوي وأسهل التقاط)'
        : 'إشارة ممتازة وزاوية ارتفاع مرتفعة';
    } else if (item.angles.elevation >= 32) {
      receptionQuality = 'VERY_GOOD';
      installerNote = 'زاوية مريحة جداً بعيداً عن المباني والعوائق';
    } else if (item.angles.elevation >= 20) {
      receptionQuality = 'GOOD';
      installerNote = 'استقبال جيد يتطلب خط رؤية مفتوح';
    } else {
      receptionQuality = 'MARGINAL';
      installerNote = 'منخفض بالقرب من خط الأفق، تجنب العوائق';
    }

    return {
      satellite: item.satellite,
      angles: item.angles,
      distanceDeltaLon: item.distanceDeltaLon,
      isZenith,
      receptionQuality,
      installerNote
    };
  });
}
