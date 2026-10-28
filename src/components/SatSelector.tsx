import React, { useState } from 'react';
import { Search, Plus, Star, Radio, Globe, Check, ExternalLink, Sparkles, Filter, Copy, CheckCircle2, Navigation, TrendingUp } from 'lucide-react';
import { Satellite, Transponder, SatBand, Polarization, Modulation, UserLocation } from '../types/satellite';
import { formatOrbitalPos, calculateDishAngles } from '../utils/satelliteMath';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';

interface Props {
  satellites: Satellite[];
  selectedSat: Satellite;
  selectedTp: Transponder;
  onSelectSat: (sat: Satellite) => void;
  onSelectTp: (tp: Transponder) => void;
  onAddTransponder: (satId: string, tp: Transponder) => void;
  onAddSatellite: (newSat: Satellite) => void;
  onToggleFavorite: (satId: string) => void;
  isOutdoorSunMode: boolean;
  userLocation?: UserLocation;
  onOpenSuggester?: () => void;
  t?: Translations;
  lang?: Language;
}

export const SatSelector: React.FC<Props> = ({
  satellites,
  selectedSat,
  selectedTp,
  onSelectSat,
  onSelectTp,
  onAddTransponder,
  onAddSatellite,
  onToggleFavorite,
  isOutdoorSunMode,
  userLocation,
  onOpenSuggester,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bandFilter, setBandFilter] = useState<'ALL' | SatBand | 'FTA' | 'FAV' | 'NEAR'>('ALL');
  const [arcFilter, setArcFilter] = useState<'ALL' | 'EAST' | 'CENTRAL' | 'WEST'>('ALL');
  const [showAddTpModal, setShowAddTpModal] = useState(false);
  const [showAddSatModal, setShowAddSatModal] = useState(false);
  const [showKingOfSatHelper, setShowKingOfSatHelper] = useState(false);

  // Smart KingOfSat Paste input
  const [kingOfSatPasteText, setKingOfSatPasteText] = useState('');
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // New TP form state
  const [newFreq, setNewFreq] = useState('11636');
  const [newPolarity, setNewPolarity] = useState<Polarization>('V');
  const [newSymbolRate, setNewSymbolRate] = useState('27500');
  const [newFec, setNewFec] = useState('5/6');
  const [newModulation, setNewModulation] = useState<Modulation>('DVB-S2 8PSK');
  const [newBeam, setNewBeam] = useState('MENA');
  const [newIsFta, setNewIsFta] = useState(true);
  const [newTpDesc, setNewTpDesc] = useState('');

  // New Sat form state
  const [newSatName, setNewSatName] = useState('');
  const [newSatPos, setNewSatPos] = useState('');
  const [newSatBand, setNewSatBand] = useState<SatBand>('KU');
  const [newSatLnb, setNewSatLnb] = useState('9750/10600');

  // Filter satellites
  const filteredSatellites = satellites.filter(sat => {
    // Band / FTA / Proximity filter
    if (bandFilter === 'FAV' && !sat.isFavorite) return false;
    if (bandFilter === 'KU' && sat.band !== 'KU') return false;
    if (bandFilter === 'C' && sat.band !== 'C') return false;
    if (bandFilter === 'FTA' && !sat.transponders.some(tp => tp.isFta)) return false;
    if (bandFilter === 'NEAR' && userLocation) {
      const angles = calculateDishAngles(userLocation.latitude, userLocation.longitude, sat.pos);
      if (!angles.isLineOfSight || angles.elevation < 12) return false;
    }

    // Arc filter
    if (arcFilter === 'EAST' && sat.pos < 23.5) return false;
    if (arcFilter === 'CENTRAL' && (sat.pos > 23.5 || sat.pos < -7.0)) return false;
    if (arcFilter === 'WEST' && sat.pos > -7.0) return false;

    // Search query
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    const formatted = formatOrbitalPos(sat.pos).toLowerCase();
    return (
      sat.name.toLowerCase().includes(q) ||
      sat.nameAr.toLowerCase().includes(q) ||
      sat.pos.toString().includes(q) ||
      formatted.includes(q) ||
      sat.transponders.some(tp =>
        tp.frequency.toString().includes(q) ||
        (tp.channels && tp.channels.some(c => c.toLowerCase().includes(q))) ||
        (tp.description && tp.description.toLowerCase().includes(q))
      )
    );
  });

  // If NEAR filter is active, sort by highest elevation from user location
  if (bandFilter === 'NEAR' && userLocation) {
    filteredSatellites.sort((a, b) => {
      const elA = calculateDishAngles(userLocation.latitude, userLocation.longitude, a.pos).elevation;
      const elB = calculateDishAngles(userLocation.latitude, userLocation.longitude, b.pos).elevation;
      return elB - elA;
    });
  }

  // Smart regex parser for KingOfSat raw lines
  const parseKingOfSatLine = () => {
    if (!kingOfSatPasteText.trim()) return;

    // Example patterns from KingOfSat:
    // "11636.00 V 27500 5/6 DVB-S QPSK - Nilesat 201 Wide"
    // "11766 H 27500"
    // "12240 H 30000 2/3 DVB-S2 8PSK"
    const text = kingOfSatPasteText.trim();
    const freqMatch = text.match(/(\d{4,5}(?:\.\d+)?)/);
    const polMatch = text.match(/\b([VHRL])\b/i);
    const srMatch = text.match(/\b(\d{4,5})\b(?!\.\d)/g);
    const fecMatch = text.match(/\b([1-9]\/[1-9])\b/);
    const modMatch = text.match(/(DVB-S2X|DVB-S2|DVB-S)/i);

    if (freqMatch) {
      const parsedFreq = Math.round(parseFloat(freqMatch[1]));
      setNewFreq(parsedFreq.toString());
    }

    if (polMatch) {
      setNewPolarity(polMatch[1].toUpperCase() as Polarization);
    }

    // SR is usually the second 4-5 digit number
    if (srMatch && srMatch.length >= 2) {
      setNewSymbolRate(srMatch[1]);
    } else if (srMatch && srMatch.length === 1 && parseInt(srMatch[0]) !== parseInt(newFreq)) {
      setNewSymbolRate(srMatch[0]);
    }

    if (fecMatch) {
      setNewFec(fecMatch[1]);
    }

    if (modMatch) {
      if (text.includes('8PSK')) setNewModulation('DVB-S2 8PSK');
      else if (text.includes('DVB-S2')) setNewModulation('DVB-S2 QPSK');
      else setNewModulation('DVB-S QPSK');
    }

    setParseSuccessMsg('تم استخراج بيانات التردد من نص KingOfSat بنجاح!');
    setTimeout(() => setParseSuccessMsg(null), 3000);
  };

  const handleCreateTp = (e: React.FormEvent) => {
    e.preventDefault();
    const freq = parseInt(newFreq, 10);
    const sr = parseInt(newSymbolRate, 10);
    if (isNaN(freq) || isNaN(sr)) return;

    const newTp: Transponder = {
      id: `custom-tp-${Date.now()}`,
      frequency: freq,
      polarity: newPolarity,
      symbolRate: sr,
      fec: newFec,
      modulation: newModulation,
      beam: newBeam,
      isFta: newIsFta,
      description: newTpDesc.trim() || 'تردد مخصص من KingOfSat',
      isCustom: true
    };

    onAddTransponder(selectedSat.id, newTp);
    onSelectTp(newTp);
    setShowAddTpModal(false);
    setNewTpDesc('');
    setKingOfSatPasteText('');
  };

  const handleCreateSat = (e: React.FormEvent) => {
    e.preventDefault();
    const pos = parseFloat(newSatPos);
    if (!newSatName.trim() || isNaN(pos)) return;

    const formattedPos = formatOrbitalPos(pos);
    const newSat: Satellite = {
      id: `custom-sat-${Date.now()}`,
      name: `${newSatName.trim()} (${formattedPos})`,
      nameAr: `${newSatName.trim()} (${formattedPos})`,
      pos,
      band: newSatBand,
      orbitalSlot: formattedPos,
      lnbDefault: newSatLnb,
      region: 'Custom Satellite',
      kingOfSatUrl: `https://fr.kingofsat.net/satellites.php`,
      transponders: [
        {
          id: `tp-init-${Date.now()}`,
          frequency: newSatBand === 'C' ? 3850 : 11500,
          polarity: 'V',
          symbolRate: 27500,
          fec: '3/4',
          modulation: 'DVB-S2 8PSK',
          beam: 'Wide',
          isFta: true,
          description: 'التردد المرجعي الرئيسي (KingOfSat)'
        }
      ],
      isCustom: true
    };

    onAddSatellite(newSat);
    onSelectSat(newSat);
    onSelectTp(newSat.transponders[0]);
    setShowAddSatModal(false);
    setNewSatName('');
    setNewSatPos('');
  };

  return (
    <div className="space-y-3">
      {/* Search & Band Filters */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full py-2.5 px-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 placeholder-slate-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        {/* Primary Filter Row: Band & FTA */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setBandFilter('ALL')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              bandFilter === 'ALL'
                ? 'bg-sky-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAll} ({satellites.length})
          </button>
          <button
            onClick={() => setBandFilter('KU')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              bandFilter === 'KU'
                ? 'bg-sky-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterKu}
          </button>
          <button
            onClick={() => setBandFilter('C')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              bandFilter === 'C'
                ? 'bg-amber-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterC}
          </button>
          <button
            onClick={() => setBandFilter('FTA')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              bandFilter === 'FTA'
                ? 'bg-emerald-500 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterFta}
          </button>
          <button
            onClick={() => setBandFilter('NEAR')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
              bandFilter === 'NEAR'
                ? 'bg-emerald-400 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="GPS Nearest"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.filterNear}</span>
          </button>
          <button
            onClick={() => setBandFilter('FAV')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
              bandFilter === 'FAV'
                ? 'bg-yellow-400 text-black shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Secondary Filter Row: Orbital Arc Section */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 overflow-x-auto pb-0.5">
          <span className="text-slate-500 shrink-0">{t.arcAll}:</span>
          <button
            onClick={() => setArcFilter('ALL')}
            className={`px-2 py-0.5 rounded transition-all shrink-0 ${
              arcFilter === 'ALL' ? 'bg-slate-800 text-sky-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            {t.arcAll}
          </button>
          <button
            onClick={() => setArcFilter('EAST')}
            className={`px-2 py-0.5 rounded transition-all shrink-0 ${
              arcFilter === 'EAST' ? 'bg-slate-800 text-sky-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            {t.arcEast}
          </button>
          <button
            onClick={() => setArcFilter('CENTRAL')}
            className={`px-2 py-0.5 rounded transition-all shrink-0 ${
              arcFilter === 'CENTRAL' ? 'bg-slate-800 text-sky-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            {t.arcCentral}
          </button>
          <button
            onClick={() => setArcFilter('WEST')}
            className={`px-2 py-0.5 rounded transition-all shrink-0 ${
              arcFilter === 'WEST' ? 'bg-slate-800 text-sky-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            {t.arcWest}
          </button>
        </div>
      </div>

      {/* Satellite Scrollable Cards */}
      <div className="space-y-1.5 max-h-[36vh] overflow-y-auto pr-1">
        {filteredSatellites.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
            {t.noSatsFound}
          </div>
        ) : (
          filteredSatellites.map((sat) => {
            const isSelected = sat.id === selectedSat.id;
            return (
              <div
                key={sat.id}
                onClick={() => {
                  onSelectSat(sat);
                  if (sat.transponders.length > 0) {
                    onSelectTp(sat.transponders[0]);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[48px] ${
                  isSelected
                    ? isOutdoorSunMode
                      ? 'bg-black border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]'
                      : 'bg-sky-950/40 border-sky-500/80 shadow-md'
                    : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(sat.id);
                    }}
                    className="text-slate-500 hover:text-yellow-400 p-1"
                    title="Favorite"
                  >
                    <Star className={`w-4 h-4 ${sat.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-sky-300' : 'text-slate-200'}`}>
                        {lang === 'ar' ? sat.nameAr : sat.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        sat.band === 'KU'
                          ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                          : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                      }`}>
                        {sat.band}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>المدار: {formatOrbitalPos(sat.pos)}</span>
                      <span>·</span>
                      <span>{sat.transponders.length} ترددات مرجعية</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sat.kingOfSatUrl && (
                    <a
                      href={sat.kingOfSatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="فتح صفحة الترددات الكاملة على KingOfSat"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-sky-500 text-black flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Satellite Transponder Strip & KingOfSat Info */}
      <div className={`p-3 rounded-xl border ${isOutdoorSunMode ? 'bg-black border-yellow-400/40' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold">
            <Radio className="w-3.5 h-3.5" />
            <span>ترددات قمر {selectedSat.nameAr} (KingOfSat):</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedSat.kingOfSatUrl && (
              <a
                href={selectedSat.kingOfSatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-lg"
              >
                <span>دليل KingOfSat</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setShowAddTpModal(true)}
              className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-lg"
            >
              <Plus className="w-3 h-3" />
              <span>إضافة تردد TP</span>
            </button>
            <button
              onClick={() => setShowAddSatModal(true)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg"
            >
              <Plus className="w-3 h-3" />
              <span>قمر مخصص</span>
            </button>
          </div>
        </div>

        {/* Transponders Grid with KingOfSat Channels Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {selectedSat.transponders.map((tp) => {
            const isTpSelected = tp.id === selectedTp.id;
            return (
              <button
                key={tp.id}
                onClick={() => onSelectTp(tp)}
                className={`p-2.5 rounded-lg text-right text-xs transition-all border flex items-start justify-between min-h-[50px] ${
                  isTpSelected
                    ? isOutdoorSunMode
                      ? 'bg-yellow-400 text-black font-black border-yellow-300'
                      : 'bg-sky-500/20 text-sky-200 border-sky-500/80 font-bold shadow-sm'
                    : 'bg-slate-950/70 hover:bg-slate-800/60 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold">
                      {tp.frequency} {tp.polarity} {tp.symbolRate}
                    </span>
                    <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      tp.isFta ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tp.isFta ? 'FTA مفتوح' : 'مشفر'}
                    </span>
                  </div>

                  <div className={`text-[10px] truncate mt-0.5 ${isTpSelected ? 'opacity-90' : 'text-slate-400'}`}>
                    {tp.description} {tp.fec ? `· FEC ${tp.fec}` : ''}
                  </div>

                  {tp.channels && tp.channels.length > 0 && (
                    <div className="text-[9px] text-slate-500 truncate mt-0.5 font-sans">
                      قنوات: {tp.channels.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>

                {isTpSelected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500 text-black font-bold shrink-0 mt-0.5">
                    التردد النشط
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Transponder Modal (with KingOfSat smart paste parser!) */}
      {showAddTpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-md text-right max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>إضافة تردد لقمر {selectedSat.nameAr}</span>
            </h3>

            {/* KingOfSat Smart Paste Box */}
            <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-sky-900/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-sky-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>لصق سطر التردد مباشرة من موقع KingOfSat:</span>
                </span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="مثال: 11636.00 V 27500 5/6 DVB-S QPSK"
                  value={kingOfSatPasteText}
                  onChange={(e) => setKingOfSatPasteText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={parseKingOfSatLine}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                >
                  استخراج
                </button>
              </div>
              {parseSuccessMsg && (
                <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{parseSuccessMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateTp} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">التردد بالـ MHz (مثال: 11636):</label>
                  <input
                    type="number"
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">الاستقطاب (Polarity):</label>
                  <select
                    value={newPolarity}
                    onChange={(e) => setNewPolarity(e.target.value as Polarization)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="V">عمودي (V)</option>
                    <option value="H">أفقي (H)</option>
                    <option value="R">دائري أيمن (R)</option>
                    <option value="L">دائري أيسر (L)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">معدل الترميز (Symbol Rate):</label>
                  <input
                    type="number"
                    value={newSymbolRate}
                    onChange={(e) => setNewSymbolRate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">تصحيح الخطأ (FEC):</label>
                  <select
                    value={newFec}
                    onChange={(e) => setNewFec(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="Auto">تلقائي (Auto)</option>
                    <option value="1/2">1/2</option>
                    <option value="2/3">2/3</option>
                    <option value="3/4">3/4</option>
                    <option value="5/6">5/6</option>
                    <option value="7/8">7/8</option>
                    <option value="8/9">8/9</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">نظام التعديل (Modulation):</label>
                  <select
                    value={newModulation}
                    onChange={(e) => setNewModulation(e.target.value as Modulation)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="DVB-S QPSK">DVB-S QPSK</option>
                    <option value="DVB-S2 8PSK">DVB-S2 8PSK</option>
                    <option value="DVB-S2 QPSK">DVB-S2 QPSK</option>
                    <option value="DVB-S2X">DVB-S2X</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">نوع البث:</label>
                  <select
                    value={newIsFta ? 'fta' : 'pay'}
                    onChange={(e) => setNewIsFta(e.target.value === 'fta')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="fta">مفتوح مجاناً (FTA)</option>
                    <option value="pay">مشفر (Pay TV)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">اسم الباقة أو الملاحظة:</label>
                <input
                  type="text"
                  placeholder="مثال: باقة الجزيرة الإخبارية HD"
                  value={newTpDesc}
                  onChange={(e) => setNewTpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-black font-bold rounded-lg hover:bg-sky-400"
                >
                  حفظ التردد
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTpModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Satellite Modal */}
      {showAddSatModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-sm text-right">
            <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>إضافة قمر صناعي مخصص</span>
            </h3>

            <form onSubmit={handleCreateSat} className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم القمر:</label>
                <input
                  type="text"
                  placeholder="مثال: Arabsat 6A"
                  value={newSatName}
                  onChange={(e) => setNewSatName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الدرجة المدارية (+ للشرق، - للغرب):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="مثال: 30.5 أو -7.0"
                  value={newSatPos}
                  onChange={(e) => setNewSatPos(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">النطاق الترددي:</label>
                  <select
                    value={newSatBand}
                    onChange={(e) => setNewSatBand(e.target.value as SatBand)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  >
                    <option value="KU">Ku-Band</option>
                    <option value="C">C-Band</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">تردد اللاقط LNB:</label>
                  <select
                    value={newSatLnb}
                    onChange={(e) => setNewSatLnb(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="9750/10600">Universal (9750/10600)</option>
                    <option value="5150">C-Band (5150)</option>
                    <option value="10750">Single (10750)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-500 text-black font-bold rounded-lg hover:bg-sky-400"
                >
                  إضافة القمر
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSatModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
