import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Navigation, Info, CheckCircle2, Sparkles, TrendingUp, Building2, HelpCircle, ShieldCheck } from 'lucide-react';
import { Satellite, UserLocation } from '../types/satellite';
import { calculateDishAngles, estimateMagneticDeclination, evaluateObstacleClearance, formatOrbitalPos, suggestNearestSatellites } from '../utils/satelliteMath';
import { POPULAR_CITIES } from '../data/satellites';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';

interface Props {
  satellite: Satellite;
  userLocation: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
  isOutdoorSunMode: boolean;
  satellites?: Satellite[];
  onSelectSatellite?: (sat: Satellite) => void;
  onOpenSuggester?: () => void;
  t?: Translations;
  lang?: Language;
}

export const DishPointer: React.FC<Props> = ({
  satellite,
  userLocation,
  onLocationChange,
  isOutdoorSunMode,
  satellites = [],
  onSelectSatellite,
  onOpenSuggester,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [devicePitch, setDevicePitch] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState<boolean>(false);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [useDeviceSensor, setUseDeviceSensor] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Phase 4: Obstacle Clearance evaluation state
  const [showObstacleTool, setShowObstacleTool] = useState<boolean>(false);
  const [obstacleDistance, setObstacleDistance] = useState<number>(20);
  const [obstacleHeight, setObstacleHeight] = useState<number>(5);
  const [showAzimuthExplainer, setShowAzimuthExplainer] = useState<boolean>(false);

  // Calculate angles
  const angles = calculateDishAngles(
    userLocation.latitude,
    userLocation.longitude,
    satellite.pos
  );

  const declination = estimateMagneticDeclination(userLocation.latitude, userLocation.longitude);
  const obstacleEval = evaluateObstacleClearance(angles.elevation, obstacleDistance, obstacleHeight);

  // Device orientation listener
  useEffect(() => {
    let handler: ((event: DeviceOrientationEvent) => void) | null = null;

    if (window.DeviceOrientationEvent) {
      handler = (event: DeviceOrientationEvent) => {
        const heading = (event as unknown as { webkitCompassHeading?: number }).webkitCompassHeading ?? 
          (event.alpha !== null ? (360 - event.alpha) % 360 : null);
        
        if (heading !== null && heading !== undefined) {
          setDeviceHeading(Math.round(heading));
          setCompassSupported(true);
        }

        if (event.beta !== null) {
          setDevicePitch(Math.round(event.beta));
        }
      };

      window.addEventListener('deviceorientation', handler, true);
    }

    return () => {
      if (handler) {
        window.removeEventListener('deviceorientation', handler, true);
      }
    };
  }, []);

  // Handle GPS location request
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(lang === 'ar' ? 'خاصية GPS غير مدعومة في هذا المتصفح' : 'GPS not supported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocationChange({
          name: 'GPS Location',
          nameAr: 'موقعي الحالي (GPS)',
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
          isGps: true
        });
      },
      (err) => {
        setIsLocating(false);
        setLocationError(lang === 'ar' ? `تعذر الحصول على الموقع: ${err.message}` : `GPS error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const currentHeading = useDeviceSensor && deviceHeading !== null ? deviceHeading : manualHeading;
  const deltaAzimuth = ((angles.azimuthTrue - currentHeading + 540) % 360) - 180;
  const isAlignedAzimuth = Math.abs(deltaAzimuth) <= 3.5;

  return (
    <div className="space-y-4">
      {/* Location Selector Bar */}
      <div className={`p-3 rounded-xl border ${isOutdoorSunMode ? 'bg-black border-yellow-400/40' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.dishLocationTitle}</span>
            <span className="text-white font-bold">{lang === 'ar' ? userLocation.nameAr : userLocation.name}</span>
          </div>
          <button
            onClick={handleGetGpsLocation}
            disabled={isLocating}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              isLocating
                ? 'bg-slate-800 text-slate-400'
                : isOutdoorSunMode
                ? 'bg-yellow-400 text-black font-black'
                : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30'
            }`}
          >
            <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? t.locatingGps : t.locateGpsBtn}</span>
          </button>
        </div>

        {/* City Quick Picker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">{t.chooseCity}</label>
            <select
              value={userLocation.name}
              onChange={(e) => {
                const city = POPULAR_CITIES.find(c => c.name === e.target.value);
                if (city) {
                  onLocationChange({
                    name: city.name,
                    nameAr: city.nameAr,
                    latitude: city.latitude,
                    longitude: city.longitude
                  });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <optgroup label={lang === 'ar' ? 'الجزائر' : 'Algérie / Algeria'}>
                {POPULAR_CITIES.slice(0, 7).map(c => (
                  <option key={c.name} value={c.name}>{lang === 'ar' ? c.nameAr : c.name} ({c.name})</option>
                ))}
              </optgroup>
              <optgroup label={lang === 'ar' ? 'تونس والمغرب' : 'Tunisie & Maroc'}>
                {POPULAR_CITIES.slice(7, 12).map(c => (
                  <option key={c.name} value={c.name}>{lang === 'ar' ? c.nameAr : c.name} ({c.name})</option>
                ))}
              </optgroup>
              <optgroup label={lang === 'ar' ? 'الشرق الأوسط والخليج' : 'Middle East & Gulf'}>
                {POPULAR_CITIES.slice(12, 20).map(c => (
                  <option key={c.name} value={c.name}>{lang === 'ar' ? c.nameAr : c.name} ({c.name})</option>
                ))}
              </optgroup>
              <optgroup label={lang === 'ar' ? 'أوروبا' : 'Europe'}>
                {POPULAR_CITIES.slice(20).map(c => (
                  <option key={c.name} value={c.name}>{lang === 'ar' ? c.nameAr : c.name} ({c.name})</option>
                ))}
              </optgroup>
            </select>
          </div>
          <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 text-[11px] text-slate-400 font-mono">
            <span>Lat: {userLocation.latitude.toFixed(2)}°</span>
            <span>Lon: {userLocation.longitude.toFixed(2)}°</span>
          </div>
        </div>

        {locationError && (
          <div className="mt-2 text-[11px] text-rose-400 bg-rose-950/30 p-1.5 rounded border border-rose-900/50">
            {locationError}
          </div>
        )}

        {/* Nearest Zenith Satellite Suggester Box */}
        {satellites.length > 0 && (() => {
          const suggestions = suggestNearestSatellites(userLocation.latitude, userLocation.longitude, satellites);
          const top = suggestions.length > 0 ? suggestions[0] : null;
          if (!top) return null;
          const isCurrentSelected = top.satellite.id === satellite.id;

          return (
            <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
              <div className="flex items-center gap-1.5 min-w-0">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-[11px] truncate">
                  <span className="text-slate-400">{t.nearestZenithLabel} </span>
                  <strong className="text-white font-bold">{lang === 'ar' ? top.satellite.nameAr : top.satellite.name}</strong>
                  <span className="text-emerald-400 font-mono font-bold mx-1">({top.angles.elevation}°)</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isCurrentSelected && onSelectSatellite && (
                  <button
                    onClick={() => onSelectSatellite(top.satellite)}
                    className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[10px] whitespace-nowrap transition-colors"
                  >
                    {t.tuneDishToSat}
                  </button>
                )}
                {onOpenSuggester && (
                  <button
                    onClick={onOpenSuggester}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] whitespace-nowrap flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>GPS ❯</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Primary Triad of Calculated Angles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Azimuth Card */}
        <div className={`p-3 rounded-xl border text-center relative overflow-hidden ${
          isOutdoorSunMode ? 'bg-black border-yellow-400' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-medium">
            <span>{t.azimuthTrue}</span>
            <button
              onClick={() => setShowAzimuthExplainer(!showAzimuthExplainer)}
              className="text-sky-400 hover:text-sky-300"
              title="توضيح الفرق بين السمت الحقيقي والمغناطيسي"
            >
              <HelpCircle className="w-3 h-3" />
            </button>
          </div>
          <div className="text-2xl font-black font-mono my-1 tracking-tight text-sky-400">
            {angles.azimuthTrue}°
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            {t.azimuthMag}: <strong className="text-amber-300">{angles.azimuthMagnetic}°</strong>
          </span>
          {isAlignedAzimuth && (
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-bold">
              <CheckCircle2 className="w-3 h-3" /> {t.pointingAligned}
            </div>
          )}
        </div>

        {/* Elevation Card */}
        <div className={`p-3 rounded-xl border text-center relative overflow-hidden ${
          isOutdoorSunMode ? 'bg-black border-yellow-400' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-400 font-medium block">{t.elevation}</span>
          <div className={`text-2xl font-black font-mono my-1 tracking-tight ${angles.elevation > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {angles.elevation}°
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {angles.elevation > 0 ? t.aboveHorizon : t.belowHorizon}
          </span>
        </div>

        {/* LNB Skew Card */}
        <div className={`p-3 rounded-xl border text-center relative overflow-hidden ${
          isOutdoorSunMode ? 'bg-black border-yellow-400' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-400 font-medium block">{t.lnbSkew}</span>
          <div className="text-2xl font-black font-mono my-1 tracking-tight text-amber-400">
            {angles.lnbSkew > 0 ? `+${angles.lnbSkew}°` : `${angles.lnbSkew}°`}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {angles.lnbSkew > 0 ? t.clockwise : t.counterClockwise}
          </span>
        </div>
      </div>

      {/* Explainer: True North vs Magnetic North */}
      {showAzimuthExplainer && (
        <div className="bg-sky-950/40 p-3 rounded-xl border border-sky-800/60 text-xs text-sky-200 space-y-1.5 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-sky-300">
            <Info className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الفرق بين السمت الحقيقي والمغناطيسي:' : 'True vs Magnetic Azimuth:'}</span>
          </div>
          <p>
            {lang === 'ar'
              ? `• السمت الحقيقي (${angles.azimuthTrue}°): زاوية التوجيه المقاسة بالنسبة للشمال الجغرافي للأرض (الخرائط والأقمار).`
              : `• True Azimuth (${angles.azimuthTrue}°): Referenced to Earth geographic North.`}
          </p>
          <p>
            {lang === 'ar'
              ? `• السمت المغناطيسي (${angles.azimuthMagnetic}°): الزاوية التي تقرأها مباشرة على إبرة البوصلة الميدانية، بعد تصحيح الانحراف المغناطيسي للموقع (${declination > 0 ? `+${declination}°` : `${declination}°`}).`
              : `• Magnetic Azimuth (${angles.azimuthMagnetic}°): Compass needle heading, corrected for local declination (${declination}°).`}
          </p>
        </div>
      )}

      {/* Visual Compass & Interactive Inclinometer */}
      <div className={`p-4 rounded-xl border ${isOutdoorSunMode ? 'bg-black border-yellow-400/40' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>{t.compassTitle} {lang === 'ar' ? satellite.nameAr : satellite.name}</span>
          </div>
          {compassSupported && (
            <button
              onClick={() => setUseDeviceSensor(!useDeviceSensor)}
              className="text-[10px] text-sky-400 hover:underline"
            >
              {useDeviceSensor ? t.sensorActive : t.sensorManual}
            </button>
          )}
        </div>

        {/* Compass Visual Dial */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
          {/* Compass Dial SVG */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full transform transition-transform duration-300">
              <circle cx="100" cy="100" r="92" fill="#090d16" stroke="#1e293b" strokeWidth="3" />
              
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const x1 = 100 + Math.cos(rad) * 82;
                const y1 = 100 + Math.sin(rad) * 82;
                const x2 = 100 + Math.cos(rad) * 90;
                const y2 = 100 + Math.sin(rad) * 90;
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={deg % 90 === 0 ? '#38bdf8' : '#334155'}
                    strokeWidth={deg % 90 === 0 ? 2 : 1}
                  />
                );
              })}

              <text x="100" y="24" fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">{t.north}</text>
              <text x="178" y="104" fill="#94a3b8" fontSize="11" textAnchor="middle">{t.east}</text>
              <text x="100" y="186" fill="#94a3b8" fontSize="11" textAnchor="middle">{t.south}</text>
              <text x="22" y="104" fill="#94a3b8" fontSize="11" textAnchor="middle">{t.west}</text>

              {/* Satellite Target Line & Indicator */}
              {(() => {
                const targetRad = ((angles.azimuthTrue - 90) * Math.PI) / 180;
                const tx = 100 + Math.cos(targetRad) * 78;
                const ty = 100 + Math.sin(targetRad) * 78;
                return (
                  <g>
                    <line
                      x1="100"
                      y1="100"
                      x2={tx}
                      y2={ty}
                      stroke={isAlignedAzimuth ? '#22c55e' : '#38bdf8'}
                      strokeWidth="3.5"
                      strokeDasharray={isAlignedAzimuth ? 'none' : '4,2'}
                    />
                    <circle cx={tx} cy={ty} r="7" fill={isAlignedAzimuth ? '#22c55e' : '#38bdf8'} />
                    <circle cx={tx} cy={ty} r="3" fill="#ffffff" />
                  </g>
                );
              })()}

              {/* Current Phone Pointer Needle */}
              {(() => {
                const headingRad = ((currentHeading - 90) * Math.PI) / 180;
                const hx = 100 + Math.cos(headingRad) * 65;
                const hy = 100 + Math.sin(headingRad) * 65;
                return (
                  <g>
                    <line
                      x1="100"
                      y1="100"
                      x2={hx}
                      y2={hy}
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <polygon
                      points={`${hx},${hy} ${100 + Math.cos(headingRad - 0.2) * 50},${100 + Math.sin(headingRad - 0.2) * 50} ${100 + Math.cos(headingRad + 0.2) * 50},${100 + Math.sin(headingRad + 0.2) * 50}`}
                      fill="#f59e0b"
                    />
                  </g>
                );
              })()}

              <circle cx="100" cy="100" r="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
              <circle cx="100" cy="100" r="3" fill="#ffffff" />
            </svg>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-6 pointer-events-none text-center">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isAlignedAzimuth ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {currentHeading}°
              </span>
            </div>
          </div>

          {/* LNB Skew Dial Graphic */}
          <div className="flex flex-col items-center text-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1.5">
              {lang === 'ar' ? 'وضع وميل اللاقط LNB' : 'LNB Skew Position'}
            </span>
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-2 border-dashed border-slate-700 bg-slate-950">
              <div
                className="w-2.5 h-16 bg-gradient-to-t from-amber-400 to-amber-200 rounded-full shadow-lg transition-transform duration-300"
                style={{ transform: `rotate(${angles.lnbSkew}deg)` }}
              />
              <div className="absolute w-7 h-7 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-amber-300">F</span>
              </div>
              <div className="absolute top-1 text-[8px] font-mono text-slate-500">0°</div>
              <div className="absolute right-1 text-[8px] font-mono text-slate-500">+90°</div>
              <div className="absolute left-1 text-[8px] font-mono text-slate-500">-90°</div>
            </div>
            <div className="mt-2 text-[11px] text-slate-300 font-mono">
              {lang === 'ar' ? 'الميل:' : 'Skew:'} <span className="text-amber-400 font-bold">{angles.lnbSkew}°</span>
            </div>
            <span className="text-[10px] text-slate-500 max-w-[140px] leading-tight mt-0.5">
              ({angles.lnbSkew > 0 ? (lang === 'ar' ? 'أدر اللاقط يميناً' : 'Rotate clockwise') : (lang === 'ar' ? 'أدر اللاقط يساراً' : 'Rotate CCW')})
            </span>
          </div>
        </div>

        {/* Manual Heading Slider */}
        {(!compassSupported || !useDeviceSensor) && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{t.manualHeadingAdjust}</span>
              <span className="font-mono text-sky-400 font-bold">{manualHeading}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={manualHeading}
              onChange={(e) => setManualHeading(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Phase 4: Obstacle Clearance Evaluation Tool */}
      <div className={`p-3.5 rounded-xl border ${isOutdoorSunMode ? 'bg-black border-yellow-400/40' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white">
              {lang === 'ar' ? 'التقييم الهندسي للعوائق والمباني المجاورة' : 'Obstacle & Line-of-Sight Clearance'}
            </h3>
          </div>
          <button
            onClick={() => setShowObstacleTool(!showObstacleTool)}
            className="text-[11px] font-semibold text-sky-400 hover:text-sky-300"
          >
            {showObstacleTool ? (lang === 'ar' ? 'إخفاء ▲' : 'Hide ▲') : (lang === 'ar' ? 'فحص العوائق ▼' : 'Inspect ▼')}
          </button>
        </div>

        {showObstacleTool && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  {lang === 'ar' ? 'المسافة إلى العائق (متر):' : 'Obstacle Distance (m):'}
                </label>
                <input
                  type="number"
                  min="2"
                  max="500"
                  value={obstacleDistance}
                  onChange={(e) => setObstacleDistance(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">
                  {lang === 'ar' ? 'ارتفاع العائق فوق الصحن (متر):' : 'Obstacle Height Above Dish (m):'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={obstacleHeight}
                  onChange={(e) => setObstacleHeight(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Obstacle Evaluation Result */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              obstacleEval.isClear
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}>
              {obstacleEval.isClear ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-1">
                <span className="font-bold block">
                  {lang === 'ar' ? obstacleEval.recommendationAr : obstacleEval.recommendationEn}
                </span>
                <div className="text-[10px] text-slate-400 font-mono">
                  {lang === 'ar'
                    ? `زاوية الارتفاع المطلوبة: ${angles.elevation}° | الحد الأدنى لتجاوز العائق: ${obstacleEval.minClearanceElevationDeg}°`
                    : `Dish Elevation: ${angles.elevation}° | Min Clearance Angle: ${obstacleEval.minClearanceElevationDeg}°`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
