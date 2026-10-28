import React, { useState, useEffect } from 'react';
import {
  Radio,
  Compass,
  ListFilter,
  Wifi,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Smartphone,
  Info,
  Navigation,
  Sparkles,
  Download,
  Globe
} from 'lucide-react';
import { Satellite, Transponder, SignalMetrics, UserLocation, ReceiverConfig } from './types/satellite';
import { INITIAL_SATELLITES, POPULAR_CITIES } from './data/satellites';
import { TRANSLATIONS, Language, Translations } from './i18n/translations';
import { SignalMeter } from './components/SignalMeter';
import { DishPointer } from './components/DishPointer';
import { SatSelector } from './components/SatSelector';
import { ReceiverConnectModal } from './components/ReceiverConnectModal';
import { GeoSatelliteSuggester } from './components/GeoSatelliteSuggester';
import { ApkExportModal } from './components/ApkExportModal';
import { audioBeeper } from './utils/audioBeeper';
import { suggestNearestSatellites, haversineDistanceKm } from './utils/satelliteMath';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'meter' | 'sats' | 'pointer' | 'receiver'>('meter');

  // Satellites database state with local storage persistence and versioning for KingOfSat data
  const [satellites, setSatellites] = useState<Satellite[]>(() => {
    try {
      const saved = localStorage.getItem('satfinder_satellites_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_SATELLITES.length) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_SATELLITES;
  });

  // Current active Satellite (default: Nilesat 7.0°W, widely used in MENA)
  const [selectedSat, setSelectedSat] = useState<Satellite>(() => {
    return INITIAL_SATELLITES.find(s => s.pos === -7.0) || INITIAL_SATELLITES[0];
  });

  // Current active Transponder (default: Nilesat 11636 V 27500)
  const [selectedTp, setSelectedTp] = useState<Transponder>(() => {
    const nile = INITIAL_SATELLITES.find(s => s.pos === -7.0);
    return nile ? nile.transponders[0] : INITIAL_SATELLITES[0].transponders[0];
  });

  // User location state (default: Algiers)
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem('satfinder_location');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return POPULAR_CITIES[0]; // Algiers
  });

  // Signal telemetry metrics
  const [metrics, setMetrics] = useState<SignalMetrics>({
    snrDb: 13.8,
    qualityPercent: 88,
    strengthPercent: 84,
    strengthDbm: -42,
    ber: '< 1.0E-07',
    isLocked: true,
    modulation: 'DVB-S2 8PSK',
    frequencyMhz: 11636,
    symbolRate: 27500,
    polarization: 'V'
  });

  // Receiver connection configuration
  const [receiverConfig, setReceiverConfig] = useState<ReceiverConfig>(() => {
    try {
      const saved = localStorage.getItem('satfinder_receiver');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      ip: '192.168.1.15',
      port: 20000,
      protocol: 'ali2661',
      isConnected: true,
      model: 'Cristor Toro 700 4K (Ali M2661)',
      tuner: 1,
      isSimulating: true,
      lastPingMs: 14
    };
  });

  // Outdoor high-contrast sun mode
  const [isOutdoorSunMode, setIsOutdoorSunMode] = useState<boolean>(() => {
    return localStorage.getItem('satfinder_sun_mode') === 'true';
  });

  // Audio beeper master toggle in header
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [showReceiverModal, setShowReceiverModal] = useState<boolean>(false);
  const [showGeoModal, setShowGeoModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Multi-language selection state (ar, fr, en)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('satfinder_language') as Language;
      if (savedLang && ['ar', 'fr', 'en'].includes(savedLang)) {
        return savedLang;
      }
    } catch {
      // Fallback
    }
    return 'ar';
  });

  const t = TRANSLATIONS[language];

  // Synchronize document direction (RTL for Arabic, LTR for French & English), lang, and title
  useEffect(() => {
    try {
      localStorage.setItem('satfinder_language', language);
    } catch {
      // Ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.title = `${t.appName} - ${t.appSubtitle}`;
    }
  }, [language, t.appName, t.appSubtitle]);

  // Automatic real-world coordinates fetch on initial mount via Geolocation API
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Find nearest city
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
            minDistance <= 25 ? closestCity.nameAr : `بالقرب من ${closestCity.nameAr}`;

          setUserLocation({
            name: closestCity.name,
            nameAr: `${friendlyName} (GPS)`,
            latitude: Math.round(latitude * 10000) / 10000,
            longitude: Math.round(longitude * 10000) / 10000,
            isGps: true
          });
        },
        () => {
          // If permission not granted or prompt dismissed, retain user-selected or saved city
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('satfinder_satellites_v2', JSON.stringify(satellites));
    } catch {
      // Ignore storage errors
    }
  }, [satellites]);

  useEffect(() => {
    try {
      localStorage.setItem('satfinder_location', JSON.stringify(userLocation));
    } catch {
      // Ignore
    }
  }, [userLocation]);

  useEffect(() => {
    try {
      localStorage.setItem('satfinder_receiver', JSON.stringify(receiverConfig));
    } catch {
      // Ignore
    }
  }, [receiverConfig]);

  useEffect(() => {
    localStorage.setItem('satfinder_sun_mode', isOutdoorSunMode ? 'true' : 'false');
  }, [isOutdoorSunMode]);

  // Handle Transponder selection
  const handleSelectTransponder = (tp: Transponder) => {
    setSelectedTp(tp);
    // Recalculate signal metrics on TP change
    setMetrics(prev => ({
      ...prev,
      frequencyMhz: tp.frequency,
      symbolRate: tp.symbolRate,
      polarization: tp.polarity,
      modulation: tp.modulation
    }));
  };

  // Handle Add Transponder
  const handleAddTransponder = (satId: string, newTp: Transponder) => {
    setSatellites(prev =>
      prev.map(s => {
        if (s.id === satId) {
          return {
            ...s,
            transponders: [newTp, ...s.transponders]
          };
        }
        return s;
      })
    );
  };

  // Handle Add Satellite
  const handleAddSatellite = (newSat: Satellite) => {
    setSatellites(prev => [newSat, ...prev]);
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = (satId: string) => {
    setSatellites(prev =>
      prev.map(s => (s.id === satId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  // Toggle audio beeper from header
  const handleToggleAudio = () => {
    const nextState = audioBeeper.toggle();
    setIsAudioActive(nextState);
  };

  // Update signal metrics
  const handleUpdateMetrics = (newMetrics: Partial<SignalMetrics>) => {
    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  // Suggest nearest satellites based on real-world coordinates
  const nearestSuggestions = suggestNearestSatellites(
    userLocation.latitude,
    userLocation.longitude,
    satellites
  );
  const nearestZenith = nearestSuggestions.length > 0 ? nearestSuggestions[0] : null;

  return (
    <div
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
        isOutdoorSunMode
          ? 'bg-black text-[#f8fafc]'
          : 'bg-[#080d18] text-slate-100'
      }`}
    >
      {/* Top Bar Contract: 3-Zone Header with Language Selector in Primary Interface */}
      <header
        className={`sticky top-0 z-40 px-3 sm:px-4 py-2.5 border-b backdrop-blur-md transition-colors ${
          isOutdoorSunMode
            ? 'bg-black/95 border-yellow-400/60'
            : 'bg-[#0b1222]/90 border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Single Text Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
              isOutdoorSunMode ? 'bg-yellow-400 text-black' : 'bg-sky-500 text-black shadow-md shadow-sky-500/30'
            }`}>
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap">
                {t.appName}
              </h1>
              <span className="text-[10px] text-sky-400 font-mono block -mt-1">
                {t.appSubtitle}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links for Tablet / Desktop */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('meter')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'meter'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.tabMeter}
            </button>
            <button
              onClick={() => setActiveTab('sats')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'sats'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.tabSats} ({satellites.length})
            </button>
            <button
              onClick={() => setActiveTab('pointer')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'pointer'
                  ? 'bg-sky-500 text-black font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.tabPointer}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Language Selector, APK, GPS, Sun Mode, Audio, Receiver IP) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
            {/* Primary Interface Language Selector */}
            <div
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isOutdoorSunMode
                  ? 'bg-black border-yellow-400 text-yellow-300'
                  : 'bg-slate-800/90 border-slate-700/90 text-slate-100 hover:border-sky-500/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="اختيار اللغة / Select Language"
                className="bg-transparent text-xs font-bold text-slate-100 outline-none cursor-pointer border-none py-0.5 pe-1 font-sans"
              >
                <option value="ar" className="bg-slate-900 text-white font-sans">🇩🇿 العربية (AR)</option>
                <option value="fr" className="bg-slate-900 text-white font-sans">🇫🇷 Français (FR)</option>
                <option value="en" className="bg-slate-900 text-white font-sans">🇬🇧 English (EN)</option>
              </select>
            </div>

            {/* Download / Install APK Button */}
            <button
              onClick={() => setShowApkModal(true)}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] shadow-sm ${
                isOutdoorSunMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40'
              }`}
              title="APK / PWA"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline text-[11px]">{t.apkBtn}</span>
            </button>

            {/* GPS Geolocation & Nearest Satellite Suggester Button */}
            <button
              onClick={() => setShowGeoModal(true)}
              className={`px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] shadow-sm ${
                isOutdoorSunMode
                  ? 'bg-emerald-400 text-black font-black'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}
              title="GPS Suggester"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline text-[11px]">{t.gpsNearestBtn}</span>
            </button>

            {/* Audio Beeper Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[36px] min-w-[36px] justify-center ${
                isAudioActive
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
              title="Audio Beeper"
            >
              {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span className="hidden md:inline text-[11px]">{isAudioActive ? t.beepActive : t.beepBtn}</span>
            </button>

            {/* Outdoor Sun Mode Toggle */}
            <button
              onClick={() => setIsOutdoorSunMode(!isOutdoorSunMode)}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 min-h-[36px] min-w-[36px] justify-center ${
                isOutdoorSunMode
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
              }`}
              title="Outdoor High-Contrast Mode"
            >
              {isOutdoorSunMode ? <Sun className="w-4 h-4 text-black fill-current" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="hidden md:inline text-[11px]">{isOutdoorSunMode ? t.sunModeActive : t.sunModeBtn}</span>
            </button>

            {/* Receiver IP Status Button */}
            <button
              onClick={() => setShowReceiverModal(true)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                receiverConfig.isConnected
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Wifi className={`w-3.5 h-3.5 ${receiverConfig.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="font-mono text-[11px]">{receiverConfig.ip}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 pb-24 md:pb-8">
        {/* Active Satellite & Transponder Sticky Kicker Banner */}
        <div className={`mb-3 p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
          isOutdoorSunMode ? 'bg-black border-yellow-400/40 text-yellow-200' : 'bg-slate-900/80 border-slate-800/90 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">{t.selectedSatLabel}</span>
            <span className="font-bold text-sky-400 text-sm">
              {language === 'ar' ? selectedSat.nameAr : selectedSat.name}
            </span>
            <span className="text-slate-500">·</span>
            <span className="font-mono text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {selectedTp.frequency} {selectedTp.polarity} {selectedTp.symbolRate}
            </span>

            {nearestZenith && (
              <button
                onClick={() => setShowGeoModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all"
                title="GPS Zenith Satellite"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {t.nearestZenithLabel} {language === 'ar' ? nearestZenith.satellite.nameAr : nearestZenith.satellite.name} ({nearestZenith.angles.elevation}°)
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">
              {t.locationLabel} {language === 'ar' ? userLocation.nameAr : userLocation.name}
            </span>
            <button
              onClick={() => setShowGeoModal(true)}
              className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              <span>GPS ❯</span>
            </button>
            <span className="text-slate-500">·</span>
            <button
              onClick={() => setActiveTab('sats')}
              className="text-sky-400 hover:underline font-bold"
            >
              {t.changeSatLabel}
            </button>
          </div>
        </div>

        {/* Desktop Multi-column Layout or Mobile Tab View */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4">
          {/* Left Column: Satellite & TP Browser (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-3.5 rounded-2xl border ${isOutdoorSunMode ? 'bg-black border-yellow-400/40' : 'bg-slate-900/60 border-slate-800'}`}>
              <h2 className="text-sm font-bold text-white mb-2.5 flex items-center justify-between">
                <span>{t.satDatabaseTitle} (80°E ➔ 70°W)</span>
                <span className="text-xs text-sky-400 font-mono">{satellites.length}</span>
              </h2>
              <SatSelector
                satellites={satellites}
                selectedSat={selectedSat}
                selectedTp={selectedTp}
                onSelectSat={setSelectedSat}
                onSelectTp={handleSelectTransponder}
                onAddTransponder={handleAddTransponder}
                onAddSatellite={handleAddSatellite}
                onToggleFavorite={handleToggleFavorite}
                isOutdoorSunMode={isOutdoorSunMode}
                userLocation={userLocation}
                onOpenSuggester={() => setShowGeoModal(true)}
                t={t}
                lang={language}
              />
            </div>
          </div>

          {/* Center Column: Signal Meter (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SignalMeter
              satellite={selectedSat}
              transponder={selectedTp}
              metrics={metrics}
              onUpdateMetrics={handleUpdateMetrics}
              isOutdoorSunMode={isOutdoorSunMode}
              t={t}
              lang={language}
            />
          </div>

          {/* Right Column: Dish Pointer & Angles (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <DishPointer
              satellite={selectedSat}
              userLocation={userLocation}
              onLocationChange={setUserLocation}
              isOutdoorSunMode={isOutdoorSunMode}
              satellites={satellites}
              onSelectSatellite={(sat) => {
                setSelectedSat(sat);
                if (sat.transponders.length > 0) {
                  handleSelectTransponder(sat.transponders[0]);
                }
              }}
              onOpenSuggester={() => setShowGeoModal(true)}
              t={t}
              lang={language}
            />
          </div>
        </div>

        {/* Mobile / Tablet View (Switched by Tabs) */}
        <div className="block lg:hidden">
          {activeTab === 'meter' && (
            <SignalMeter
              satellite={selectedSat}
              transponder={selectedTp}
              metrics={metrics}
              onUpdateMetrics={handleUpdateMetrics}
              isOutdoorSunMode={isOutdoorSunMode}
              t={t}
              lang={language}
            />
          )}

          {activeTab === 'sats' && (
            <SatSelector
              satellites={satellites}
              selectedSat={selectedSat}
              selectedTp={selectedTp}
              onSelectSat={(sat) => {
                setSelectedSat(sat);
                if (sat.transponders.length > 0) {
                  handleSelectTransponder(sat.transponders[0]);
                }
                setActiveTab('meter');
              }}
              onSelectTp={(tp) => {
                handleSelectTransponder(tp);
                setActiveTab('meter');
              }}
              onAddTransponder={handleAddTransponder}
              onAddSatellite={handleAddSatellite}
              onToggleFavorite={handleToggleFavorite}
              isOutdoorSunMode={isOutdoorSunMode}
              userLocation={userLocation}
              onOpenSuggester={() => setShowGeoModal(true)}
              t={t}
              lang={language}
            />
          )}

          {activeTab === 'pointer' && (
            <DishPointer
              satellite={selectedSat}
              userLocation={userLocation}
              onLocationChange={setUserLocation}
              isOutdoorSunMode={isOutdoorSunMode}
              satellites={satellites}
              onSelectSatellite={(sat) => {
                setSelectedSat(sat);
                if (sat.transponders.length > 0) {
                  handleSelectTransponder(sat.transponders[0]);
                }
                setActiveTab('meter');
              }}
              onOpenSuggester={() => setShowGeoModal(true)}
              t={t}
              lang={language}
            />
          )}

          {activeTab === 'receiver' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <h2 className="text-base font-bold text-white mb-2">{t.receiverModalTitle}</h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {language === 'ar'
                    ? 'تأكد من اتصال هاتفك المحمول وجهاز Cristor Toro 700 بنفس شبكة الواي فاي المنزلية. يمكنك إرسال الترددات مباشرة أو تفعيل وضع المحاكاة.'
                    : language === 'fr'
                    ? 'Assurez-vous que votre téléphone et votre récepteur Cristor Toro 700 sont connectés au même réseau Wi-Fi local. Vous pouvez envoyer des TPs directement ou tester le mode simulation.'
                    : 'Ensure your smartphone and Cristor Toro 700 receiver are on the same Wi-Fi network. You can dispatch transponders directly or test in simulator mode.'}
                </p>
                <button
                  onClick={() => setShowReceiverModal(true)}
                  className="w-full py-3 bg-sky-500 text-black font-bold rounded-xl text-sm"
                >
                  {t.receiverModalTitle}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Touch Spec) */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md ${
          isOutdoorSunMode
            ? 'bg-black/95 border-yellow-400/60'
            : 'bg-[#080d18]/95 border-slate-800'
        }`}
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
          {/* Tab 1: Signal Meter */}
          <button
            onClick={() => setActiveTab('meter')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'meter'
                ? isOutdoorSunMode ? 'text-yellow-400' : 'text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabMeter}</span>
          </button>

          {/* Tab 2: Satellites */}
          <button
            onClick={() => setActiveTab('sats')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'sats'
                ? isOutdoorSunMode ? 'text-yellow-400' : 'text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabSats}</span>
          </button>

          {/* Tab 3: Dish Angles & Compass */}
          <button
            onClick={() => setActiveTab('pointer')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              activeTab === 'pointer'
                ? isOutdoorSunMode ? 'text-yellow-400' : 'text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabPointer}</span>
          </button>

          {/* Tab 4: Receiver Settings */}
          <button
            onClick={() => setShowReceiverModal(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
              receiverConfig.isConnected
                ? 'text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{t.tabReceiver}</span>
          </button>
        </div>
      </nav>

      {/* Receiver Connection Modal */}
      {showReceiverModal && (
        <ReceiverConnectModal
          config={receiverConfig}
          onUpdateConfig={(newCfg) => setReceiverConfig(prev => ({ ...prev, ...newCfg }))}
          onClose={() => setShowReceiverModal(false)}
          isOutdoorSunMode={isOutdoorSunMode}
          t={t}
          lang={language}
        />
      )}

      {/* Geolocation & Nearest Satellite Suggester Modal */}
      {showGeoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg">
            <GeoSatelliteSuggester
              satellites={satellites}
              selectedSat={selectedSat}
              userLocation={userLocation}
              onSelectSatellite={(sat) => {
                setSelectedSat(sat);
                if (sat.transponders.length > 0) {
                  handleSelectTransponder(sat.transponders[0]);
                }
              }}
              onUpdateLocation={setUserLocation}
              isOutdoorSunMode={isOutdoorSunMode}
              onClose={() => setShowGeoModal(false)}
              t={t}
              lang={language}
            />
          </div>
        </div>
      )}

      {/* APK & App Installation Modal */}
      {showApkModal && (
        <ApkExportModal
          onClose={() => setShowApkModal(false)}
          isOutdoorSunMode={isOutdoorSunMode}
          t={t}
          lang={language}
        />
      )}
    </div>
  );
}
