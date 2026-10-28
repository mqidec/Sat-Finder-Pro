import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Sparkles,
  Compass,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Radio,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Satellite, UserLocation } from '../types/satellite';
import {
  suggestNearestSatellites,
  SatelliteSuggestion,
  haversineDistanceKm,
  formatOrbitalPos
} from '../utils/satelliteMath';
import { POPULAR_CITIES } from '../data/satellites';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';

interface Props {
  satellites: Satellite[];
  selectedSat: Satellite;
  userLocation: UserLocation;
  onSelectSatellite: (sat: Satellite) => void;
  onUpdateLocation: (loc: UserLocation) => void;
  isOutdoorSunMode: boolean;
  onClose?: () => void;
  t?: Translations;
  lang?: Language;
}

export const GeoSatelliteSuggester: React.FC<Props> = ({
  satellites,
  selectedSat,
  userLocation,
  onSelectSatellite,
  onUpdateLocation,
  isOutdoorSunMode,
  onClose,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [nearestCityInfo, setNearestCityInfo] = useState<{ nameAr: string; distanceKm: number } | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  // Compute nearest satellites based on current user coordinates
  const suggestions = suggestNearestSatellites(
    userLocation.latitude,
    userLocation.longitude,
    satellites
  );

  const topZenith = suggestions.length > 0 ? suggestions[0] : null;
  const topList = suggestions.slice(0, 6);

  // Update nearest city info whenever user coordinates change
  useEffect(() => {
    let closestCity = POPULAR_CITIES[0];
    let minDistance = 999999;

    for (const city of POPULAR_CITIES) {
      const dist = haversineDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        city.latitude,
        city.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }

    setNearestCityInfo({
      nameAr: closestCity.nameAr,
      distanceKm: minDistance
    });
  }, [userLocation.latitude, userLocation.longitude]);

  // Handle automatic Geolocation API fetch
  const handleFetchCoordinates = () => {
    if (!navigator.geolocation) {
      setGeoError('خاصية تحديد الموقع الجغرافي (Geolocation API) غير مدعومة في متصفحك.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        setAccuracyMeters(Math.round(accuracy));

        // Find nearest city for friendly naming
        let closestCity = POPULAR_CITIES[0];
        let minDistance = 999999;

        for (const city of POPULAR_CITIES) {
          const dist = haversineDistanceKm(latitude, longitude, city.latitude, city.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city;
          }
        }

        const friendlyName =
          minDistance <= 25
            ? closestCity.nameAr
            : `بالقرب من ${closestCity.nameAr}`;

        const newLocation: UserLocation = {
          name: closestCity.name,
          nameAr: `${friendlyName} (GPS)`,
          latitude: Math.round(latitude * 10000) / 10000,
          longitude: Math.round(longitude * 10000) / 10000,
          isGps: true
        };

        onUpdateLocation(newLocation);
        setAppliedFeedback(`تم تحديث موقعك بدقة (±${Math.round(accuracy)} متر) واقتراح الأقمار المناسبة.`);
        setTimeout(() => setAppliedFeedback(null), 4000);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = 'تعذر الوصول إلى الموقع الجغرافي.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'تم رفض الإذن للوصول إلى الموقع GPS. يرجى تفعيله في إعدادات المتصفح.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'إشارة الموقع الجغرافي غير متوفرة حالياً.';
            break;
          case error.TIMEOUT:
            errorMsg = 'انتهت مهلة الحصول على إحداثيات GPS.';
            break;
        }
        setGeoError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000
      }
    );
  };

  const handleTuneToSatellite = (sug: SatelliteSuggestion) => {
    onSelectSatellite(sug.satellite);
    setAppliedFeedback(`تم ضبط الصحن نحو قمر ${sug.satellite.nameAr} بنجاح!`);
    setTimeout(() => {
      setAppliedFeedback(null);
      if (onClose) onClose();
    }, 1200);
  };

  return (
    <div
      className={`rounded-2xl border p-4 text-right space-y-4 ${
        isOutdoorSunMode
          ? 'bg-black border-2 border-yellow-400 text-yellow-100 shadow-[0_0_20px_rgba(234,179,8,0.25)]'
          : 'bg-[#0b1222] border-slate-700/80 text-slate-100 shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{t.geoModalTitle}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              {t.geoModalSubtitle}
            </span>
          </div>
        </div>

        <button
          onClick={handleFetchCoordinates}
          disabled={isLocating}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
            isOutdoorSunMode
              ? 'bg-yellow-400 text-black font-black'
              : 'bg-sky-500 hover:bg-sky-400 text-black'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? '...' : t.updateGpsBtn}</span>
        </button>
      </div>

      {/* Current Real-world Coordinates Card */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">{t.yourCurrentLocation}</span>
              <span className="font-bold text-white text-xs">{lang === 'ar' ? userLocation.nameAr : userLocation.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
            <span>Lat: <strong className="text-sky-300">{userLocation.latitude.toFixed(4)}°</strong></span>
            <span>Lon: <strong className="text-sky-300">{userLocation.longitude.toFixed(4)}°</strong></span>
            {accuracyMeters !== null && (
              <span className="text-emerald-400 text-[10px] bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/50">
                ±{accuracyMeters}m
              </span>
            )}
          </div>
        </div>

        {nearestCityInfo && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span>
              {t.nearestRefCity} <strong className="text-slate-200">{nearestCityInfo.nameAr}</strong>
            </span>
            <span>{t.distance} {nearestCityInfo.distanceKm} km</span>
          </div>
        )}

        {geoError && (
          <div className="mt-2 text-[11px] text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-900/60 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Highlighted #1 Zenith Satellite (Highest in the sky) */}
      {topZenith && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-slate-950 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>{t.zenithSatTitle}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {topZenith.angles.elevation}°
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-black text-white">{lang === 'ar' ? topZenith.satellite.nameAr : topZenith.satellite.name}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {topZenith.installerNote}
              </p>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-1">
                <span>Az: {topZenith.angles.azimuthTrue}°</span>
                <span>·</span>
                <span>Skew: {topZenith.angles.lnbSkew > 0 ? `+${topZenith.angles.lnbSkew}` : topZenith.angles.lnbSkew}°</span>
                <span>·</span>
                <span>{topZenith.angles.distanceKm.toLocaleString()} km</span>
              </div>
            </div>

            <button
              onClick={() => handleTuneToSatellite(topZenith)}
              className={`px-3 py-2.5 rounded-xl text-xs font-black shrink-0 transition-transform active:scale-95 flex items-center gap-1.5 shadow-lg ${
                selectedSat.id === topZenith.satellite.id
                  ? 'bg-emerald-500 text-black'
                  : isOutdoorSunMode
                  ? 'bg-yellow-400 text-black'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-black'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>
                {selectedSat.id === topZenith.satellite.id ? t.currentSatSelected : t.tuneDishToSat}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Top Ranked Satellite Suggestions List */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>{t.topSatsAboveHorizon}</span>
          <span className="font-mono text-[11px] text-sky-400">{topList.length}</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {topList.map((item, idx) => {
            const isSelected = selectedSat.id === item.satellite.id;
            return (
              <div
                key={item.satellite.id}
                onClick={() => handleTuneToSatellite(item)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{lang === 'ar' ? item.satellite.nameAr : item.satellite.name}</span>
                      <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                        {item.satellite.band}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{formatOrbitalPos(item.satellite.pos)}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold">Elev: {item.angles.elevation}°</span>
                      <span>·</span>
                      <span>Az: {item.angles.azimuthTrue}°</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTuneToSatellite(item);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      isSelected
                        ? 'bg-sky-500 text-black'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isSelected ? t.selectedBtn : t.selectBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {appliedFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{appliedFeedback}</span>
        </div>
      )}

      {onClose && (
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            {t.closeBtn}
          </button>
        </div>
      )}
    </div>
  );
};
