import {
  calculateDishAngles,
  estimateMagneticDeclination,
  evaluateObstacleClearance,
  haversineDistanceKm
} from './satelliteMath';

/**
 * Self-contained verification suite for satellite positioning calculations
 * Can be executed in browser console, Node runtime, or test runner.
 */
export function runSatelliteMathTests(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${testName} - ${detail || 'Condition not met'}`);
    }
  }

  // Test 1: Algiers to Nilesat 7.0°W (SatLex / ITU Standard)
  // Reference: Azimuth = 196.5°, Elevation = 46.1°, Skew = +13.2°
  const algiersNilesat = calculateDishAngles(36.75, 3.05, -7.0);
  assert(
    Math.abs(algiersNilesat.azimuthTrue - 196.5) <= 0.2,
    'Algiers -> Nilesat 7.0°W True Azimuth = 196.5°',
    `Got ${algiersNilesat.azimuthTrue}`
  );
  assert(
    Math.abs(algiersNilesat.elevation - 46.1) <= 0.2,
    'Algiers -> Nilesat 7.0°W Elevation = 46.1°',
    `Got ${algiersNilesat.elevation}`
  );
  assert(
    Math.abs(algiersNilesat.lnbSkew - 13.2) <= 0.2,
    'Algiers -> Nilesat 7.0°W LNB Skew = +13.2° (Clockwise looking into dish)',
    `Got ${algiersNilesat.lnbSkew}`
  );
  assert(algiersNilesat.isLineOfSight === true, 'Algiers -> Nilesat is above horizon');

  // Test 2: Algiers to Hotbird 13.0°E
  // Reference: Azimuth = 163.7°, Elevation = 46.1°, Skew = -13.0°
  const algiersHotbird = calculateDishAngles(36.75, 3.05, 13.0);
  assert(
    Math.abs(algiersHotbird.azimuthTrue - 163.7) <= 0.2,
    'Algiers -> Hotbird 13.0°E True Azimuth = 163.7°',
    `Got ${algiersHotbird.azimuthTrue}`
  );
  assert(
    Math.abs(algiersHotbird.elevation - 46.1) <= 0.2,
    'Algiers -> Hotbird 13.0°E Elevation = 46.1°',
    `Got ${algiersHotbird.elevation}`
  );
  assert(
    Math.abs(algiersHotbird.lnbSkew - -13.0) <= 0.2,
    'Algiers -> Hotbird 13.0°E LNB Skew = -13.0° (Counter-clockwise)',
    `Got ${algiersHotbird.lnbSkew}`
  );

  // Test 3: Paris to Astra 19.2°E
  // Reference: Azimuth = 158.1°, Elevation = 31.6°, Skew = -14.2°
  const parisAstra = calculateDishAngles(48.85, 2.35, 19.2);
  assert(
    Math.abs(parisAstra.azimuthTrue - 158.1) <= 0.2,
    'Paris -> Astra 19.2°E True Azimuth = 158.1°',
    `Got ${parisAstra.azimuthTrue}`
  );
  assert(
    Math.abs(parisAstra.elevation - 31.6) <= 0.2,
    'Paris -> Astra 19.2°E Elevation = 31.6°',
    `Got ${parisAstra.elevation}`
  );
  assert(
    Math.abs(parisAstra.lnbSkew - -14.2) <= 0.2,
    'Paris -> Astra 19.2°E LNB Skew = -14.2°',
    `Got ${parisAstra.lnbSkew}`
  );

  // Test 4: Magnetic Declination
  const decAlgiers = estimateMagneticDeclination(36.75, 3.05);
  assert(
    decAlgiers >= 0.5 && decAlgiers <= 3.5,
    'Algiers Magnetic Declination between +0.5° and +3.5°',
    `Got ${decAlgiers}°`
  );

  // Test 5: Obstacle Clearance evaluation
  const clearObstacle = evaluateObstacleClearance(46.0, 20, 5);
  assert(clearObstacle.isClear === true, 'Clear obstacle passes with margin', `${clearObstacle.clearanceMarginDeg}°`);

  const blockedObstacle = evaluateObstacleClearance(15.0, 10, 8);
  assert(blockedObstacle.isClear === false, 'Blocked obstacle flagged correctly', `${blockedObstacle.clearanceMarginDeg}°`);

  // Test 6: Haversine distance Algiers to Oran (~350 km)
  const dist = haversineDistanceKm(36.75, 3.05, 35.7, -0.63);
  assert(Math.abs(dist - 355) < 25, 'Algiers to Oran distance ~355 km', `Got ${dist} km`);

  return { passed, failed, results };
}
