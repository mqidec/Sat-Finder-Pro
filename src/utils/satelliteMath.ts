import { DishCalculation, Satellite } from '../types/satellite';
import { ObstacleEvaluation } from '../types/telemetry';

// Earth equatorial radius in kilometers (WGS-84 standard)
export const RE = 6378.137;
// Geostationary satellite orbit radius in kilometers (Earth radius + ~35,786.4 km altitude)
export const RS = 42164.57;
// Geostationary ratio RE / RS
export const RE_OVER_RS = RE / RS; // ~0.151267

/**
 * Converts degrees to radians
 */
export const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Converts radians to degrees
 */
export const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Calculates World Magnetic Model (WMM) approximate magnetic declination in degrees.
 * Positive = East declination (Compass needle points East of True North)
 * Negative = West declination (Compass needle points West of True North)
 */
export function estimateMagneticDeclination(lat: number, lon: number): number {
  const latR = toRad(lat);
  const lonR = toRad(lon);

  // Dipole & quadrupole spherical approximation
  const baseDec =
    1.2 +
    0.08 * (lon - 3.0) -
    0.03 * (lat - 36.0) +
    0.001 * (lon - 3.0) * (lat - 36.0) +
    Math.sin(lonR * 2) * 1.5 * Math.cos(latR);

  return Math.round(Math.max(-25, Math.min(25, baseDec)) * 10) / 10;
}

/**
 * Calculates dish pointing parameters based on international SatLex & ITU-R standards:
 * - True Azimuth (السمت الحقيقي بالنسبة للشمال الجغرافي 0°)
 * - Magnetic Azimuth (السمت المغناطيسي بالنسبة للبوصلة)
 * - Elevation (زاوية الارتفاع الرأسي)
 * - LNB Polarization Tilt / Skew (زاوية دوران اللاقط LNB)
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

  // 1. Central angle / Great circle arc angle g
  // cos(g) = cos(lat) * cos(deltaLon)
  const cosG = Math.cos(latR) * Math.cos(deltaLonR);
  const sinG = Math.sqrt(Math.max(0, 1 - cosG * cosG));

  // 2. Elevation Calculation
  // tan(El) = (cos(g) - (RE / RS)) / sin(g)
  let elevation = -90;
  if (sinG > 1e-7) {
    const elRad = Math.atan((cosG - RE_OVER_RS) / sinG);
    elevation = toDeg(elRad);
  } else if (cosG >= 1.0) {
    elevation = 90;
  }

  const isLineOfSight = elevation > 0;

  // 3. True Azimuth Calculation (SatLex / ITU-R Standard):
  // alpha = atan(tan(|deltaLon|) / sin(lat))
  let azimuthTrue = 0;
  if (Math.abs(userLat) > 0.001) {
    const alphaRad = Math.atan(Math.tan(Math.abs(deltaLonR)) / Math.sin(Math.abs(latR)));
    const alpha = toDeg(alphaRad);

    if (userLat >= 0) {
      // Northern Hemisphere: South is 180°
      if (deltaLon > 0) {
        azimuthTrue = 180 - alpha; // South-East
      } else if (deltaLon < 0) {
        azimuthTrue = 180 + alpha; // South-West
      } else {
        azimuthTrue = 180; // Due South
      }
    } else {
      // Southern Hemisphere: North is 0°
      if (deltaLon > 0) {
        azimuthTrue = alpha; // North-East
      } else if (deltaLon < 0) {
        azimuthTrue = 360 - alpha; // North-West
      } else {
        azimuthTrue = 0; // Due North
      }
    }
  } else {
    // Equator
    azimuthTrue = deltaLon > 0 ? 90 : 270;
  }
  azimuthTrue = ((azimuthTrue % 360) + 360) % 360;

  // 4. Magnetic Azimuth
  const declination = estimateMagneticDeclination(userLat, userLon);
  let azimuthMagnetic = azimuthTrue - declination;
  azimuthMagnetic = ((azimuthMagnetic % 360) + 360) % 360;

  // 5. LNB Polarization Tilt / Skew (degrees)
  // Standard convention (looking into dish face):
  // When sat is West of user (deltaLon < 0), rotate LNB Clockwise (+)
  // When sat is East of user (deltaLon > 0), rotate LNB Counter-Clockwise (-)
  let lnbSkew = 0;
  if (Math.abs(userLat) > 0.001) {
    const skewRad = -Math.atan(Math.sin(deltaLonR) / Math.tan(latR));
    lnbSkew = toDeg(skewRad);
  }

  // 6. Slant range / Distance to Satellite in km
  const distanceKm = Math.round(
    Math.sqrt(Math.max(0, RE * RE + RS * RS - 2 * RE * RS * cosG))
  );

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
 * Evaluates geometric obstacle clearance
 */
export function evaluateObstacleClearance(
  dishElevationDeg: number,
  obstacleDistanceMeters: number = 20,
  obstacleHeightAboveDishMeters: number = 5
): ObstacleEvaluation {
  const obstacleAngleDeg =
    toDeg(Math.atan(Math.max(0, obstacleHeightAboveDishMeters) / Math.max(1, obstacleDistanceMeters)));

  const minClearanceElevationDeg = obstacleAngleDeg + 3.0;
  const clearanceMarginDeg = Math.round((dishElevationDeg - minClearanceElevationDeg) * 10) / 10;
  const isClear = dishElevationDeg >= minClearanceElevationDeg;

  const maxAllowedHeight =
    Math.tan(toRad(Math.max(0, dishElevationDeg - 3.0))) * obstacleDistanceMeters;

  let recommendationAr = '';
  let recommendationFr = '';
  let recommendationEn = '';

  if (isClear) {
    recommendationAr = `خط الرؤية مفتوح تماماً بهامش أمان ${clearanceMarginDeg}° فوق العائق.`;
    recommendationFr = `Ligne de vue dégagée avec une marge de sécurité de ${clearanceMarginDeg}°.`;
    recommendationEn = `Line of sight completely clear with ${clearanceMarginDeg}° safety margin.`;
  } else {
    const deficit = Math.abs(clearanceMarginDeg);
    recommendationAr = `تنبيه: العائق يحجب مسار الإشارة بزاوية نقص ${deficit}°. يجب رفع الصحن أو نقله.`;
    recommendationFr = `Attention: Obstacle bloquant la vue directe de ${deficit}°. Élever la parabole.`;
    recommendationEn = `Warning: Obstacle blocking path by ${deficit}°. Raise dish or relocate.`;
  }

  return {
    userElevationDeg: dishElevationDeg,
    minClearanceElevationDeg: Math.round(minClearanceElevationDeg * 10) / 10,
    isClear,
    clearanceMarginDeg,
    estimatedObstacleHeightLimitMeters: Math.round(maxAllowedHeight * 10) / 10,
    recommendationAr,
    recommendationFr,
    recommendationEn
  };
}

/**
 * Format orbital position nicely
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
  distanceDeltaLon: number;
  isZenith: boolean;
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
    .filter((item) => item.angles.isLineOfSight && item.angles.elevation >= 8.0);

  calculated.sort((a, b) => b.angles.elevation - a.angles.elevation);

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
