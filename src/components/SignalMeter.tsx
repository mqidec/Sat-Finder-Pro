import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, CheckCircle, AlertTriangle, Activity, Sliders, Waves } from 'lucide-react';
import { Satellite, Transponder, SignalMetrics } from '../types/satellite';
import { audioBeeper } from '../utils/audioBeeper';
import { ConstellationDiagram } from './ConstellationDiagram';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';

interface Props {
  satellite: Satellite;
  transponder: Transponder;
  metrics: SignalMetrics;
  onUpdateMetrics: (newMetrics: Partial<SignalMetrics>) => void;
  isOutdoorSunMode: boolean;
  t?: Translations;
  lang?: Language;
}

export const SignalMeter: React.FC<Props> = ({
  satellite,
  transponder,
  metrics,
  onUpdateMetrics,
  isOutdoorSunMode,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const [isAudioBeeping, setIsAudioBeeping] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [showConstellation, setShowConstellation] = useState<boolean>(true);
  const [isAutoDrift, setIsAutoDrift] = useState<boolean>(false);

  // Sync audio with signal changes
  useEffect(() => {
    audioBeeper.updateSignal(metrics.snrDb, metrics.isLocked);
  }, [metrics.snrDb, metrics.isLocked]);

  const toggleAudio = () => {
    const nextState = audioBeeper.toggle();
    setIsAudioBeeping(nextState);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioBeeper.setVolume(newVol);
  };

  // Helper to calculate realistic Quality & Lock from SNR
  const calculateDerivedMetrics = (snr: number) => {
    const snrVal = Math.max(0, Math.min(18.0, snr));
    // DVB-S2 lock threshold typically around 6.5 - 7.5 dB depending on FEC/modulation
    const isLocked = snrVal >= 7.2;
    // Quality % maps smoothly from 0% at 5dB to 100% at 15.5dB
    let qual = 0;
    if (snrVal > 4.0) {
      qual = Math.min(100, Math.max(0, Math.round(((snrVal - 4.5) / 10.5) * 100)));
    }
    // Strength % (typically exists even with background noise)
    const strength = Math.min(99, Math.round(40 + (snrVal / 16.0) * 55));
    const strengthDbm = Math.round(-85 + (strength / 100) * 50);

    // Realistic BER
    let ber = '--';
    if (!isLocked) {
      ber = snrVal > 4 ? `4.2E-02` : `9.8E-01`;
    } else {
      if (snrVal >= 13.0) ber = `< 1.0E-07`;
      else if (snrVal >= 10.5) ber = `2.4E-06`;
      else ber = `7.8E-04`;
    }

    return {
      snrDb: Math.round(snrVal * 10) / 10,
      qualityPercent: qual,
      strengthPercent: strength,
      strengthDbm,
      ber,
      isLocked
    };
  };

  const handleSliderChange = (val: number) => {
    const derived = calculateDerivedMetrics(val);
    onUpdateMetrics(derived);
  };

  // Auto antenna alignment drift simulation (wind / hand wobble)
  useEffect(() => {
    if (!isAutoDrift) return;

    const interval = window.setInterval(() => {
      // Small random fluctuation ±0.2 dB
      const delta = (Math.random() - 0.48) * 0.4;
      const nextSnr = Math.max(0, Math.min(16.5, metrics.snrDb + delta));
      const derived = calculateDerivedMetrics(nextSnr);
      onUpdateMetrics(derived);
    }, 450);

    return () => window.clearInterval(interval);
  }, [isAutoDrift, metrics.snrDb]);

  // Color selection based on SNR
  const getSnrColorClass = () => {
    if (isOutdoorSunMode) {
      return metrics.isLocked ? 'text-[#00ff66]' : 'text-[#ffdd00]';
    }
    if (metrics.snrDb >= 12.5) return 'text-cyan-400';
    if (metrics.snrDb >= 9.0) return 'text-emerald-400';
    if (metrics.snrDb >= 6.5) return 'text-amber-400';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-3">
      {/* Transponder Info Banner */}
      <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
        isOutdoorSunMode ? 'bg-black border-yellow-400/50' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold">
              <Radio className="w-3.5 h-3.5" />
              <span>{t.currentTp}</span>
              <span className="text-white font-mono text-sm">
                {transponder.frequency} {transponder.polarity} {transponder.symbolRate}
              </span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              transponder.isFta ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-slate-800 text-slate-400'
            }`}>
              {transponder.isFta ? t.ftaBadge : t.payBadge}
            </span>
            {transponder.beam && (
              <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {t.beamLabel} {transponder.beam}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-slate-300 font-medium">{transponder.description || 'DVB-S2'}</span>
            <span className="mx-1">·</span>
            <span>{transponder.modulation}</span>
            {transponder.fec && <span> · FEC {transponder.fec}</span>}
          </div>
          {transponder.channels && transponder.channels.length > 0 && (
            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-sm">
              {t.mainChannels} {transponder.channels.join(' · ')}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {satellite.kingOfSatUrl && (
            <a
              href={satellite.kingOfSatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <span>KingOfSat</span>
              <span>↗</span>
            </a>
          )}
          <div className="text-start">
            <span className="text-[10px] text-slate-500 block">{t.lnbLof}</span>
            <span className="text-slate-300 font-bold">{satellite.lnbDefault}</span>
          </div>
        </div>
      </div>

      {/* Main Signal Instrument Screen */}
      <div className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
        isOutdoorSunMode 
          ? 'bg-black border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
          : 'bg-[#050914] border-2 border-slate-800/90 shadow-2xl'
      }`}>
        {/* Top Header Labels */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 tracking-wider">
          <span className="font-mono">{t.snrTitle}</span>
          <span className="font-mono">{t.tunerTitle}</span>
        </div>

        {/* Big Giant SNR Value Display */}
        <div className="py-2">
          <div
            className={`text-6xl sm:text-7xl font-black font-mono tracking-tight transition-colors duration-150 ${getSnrColorClass()}`}
            style={{
              textShadow: metrics.isLocked
                ? (isOutdoorSunMode ? '0 0 25px rgba(0, 255, 102, 0.6)' : '0 0 25px rgba(34, 197, 94, 0.4)')
                : 'none'
            }}
          >
            {metrics.snrDb.toFixed(1)}
            <span className="text-2xl sm:text-3xl font-bold ml-1 text-slate-400">dB</span>
          </div>

          {/* Real Lock Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide mt-1 transition-all">
            {metrics.isLocked ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 px-3 py-0.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.locked} ({transponder.modulation})</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 bg-rose-950/60 border border-rose-500/50 px-3 py-0.5 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t.unlocked}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dual Gauges: Quality % and Signal Strength % */}
        <div className="grid grid-cols-2 gap-2 my-3">
          {/* Quality Card */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">{t.quality}</span>
            <div className={`text-2xl font-black font-mono my-0.5 ${metrics.qualityPercent > 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics.qualityPercent}%
            </div>
            {/* Visual Quality Progress Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${metrics.qualityPercent}%`,
                  background: metrics.qualityPercent > 70
                    ? 'linear-gradient(90deg, #eab308, #22c55e)'
                    : metrics.qualityPercent > 40
                    ? '#eab308'
                    : '#ef4444'
                }}
              />
            </div>
          </div>

          {/* Strength / BER Card */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">{t.strength}</span>
            <div className="text-xl font-black font-mono my-0.5 text-sky-400">
              {metrics.strengthPercent}% <span className="text-xs text-slate-400">({metrics.strengthDbm} dBm)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {t.ber} <span className="text-white font-bold">{metrics.ber}</span>
            </div>
          </div>
        </div>

        {/* Acoustic Beeper Quick Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={toggleAudio}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isAudioBeeping
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : isOutdoorSunMode
                ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isAudioBeeping ? (
              <>
                <Volume2 className="w-4 h-4 text-black animate-pulse" />
                <span>{t.audioBeepStop}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>{t.audioBeepStart}</span>
              </>
            )}
          </button>

          {isAudioBeeping && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">{t.volume}</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 accent-amber-400 cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={() => setShowConstellation(!showConstellation)}
            className="px-2.5 py-2 rounded-xl text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>{showConstellation ? t.hideIq : t.iqDiagram}</span>
          </button>
        </div>

        {/* Constellation Diagram */}
        {showConstellation && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col items-center">
            <ConstellationDiagram
              snrDb={metrics.snrDb}
              isLocked={metrics.isLocked}
              modulation={transponder.modulation}
              compact={false}
            />
          </div>
        )}

        {/* Signal Manual Tuning Slider & Quick Presets */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-start">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-sky-400" />
              <span>{t.signalSimulator}</span>
            </span>
            <span className="font-mono text-sky-400 font-bold">{metrics.snrDb.toFixed(1)} dB</span>
          </div>

          <input
            type="range"
            min="0"
            max="16.5"
            step="0.1"
            value={metrics.snrDb}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          {/* Quick Signal Presets */}
          <div className="flex items-center justify-between gap-1.5 mt-2 flex-wrap">
            <button
              onClick={() => handleSliderChange(0)}
              className="flex-1 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-rose-400"
            >
              {t.presetZero}
            </button>
            <button
              onClick={() => handleSliderChange(5.2)}
              className="flex-1 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-amber-400"
            >
              {t.presetWeak}
            </button>
            <button
              onClick={() => handleSliderChange(8.8)}
              className="flex-1 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-yellow-300"
            >
              {t.presetLock}
            </button>
            <button
              onClick={() => handleSliderChange(13.5)}
              className="flex-1 py-1 text-[10px] bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-emerald-400"
            >
              {t.presetOptimal}
            </button>
            <button
              onClick={() => setIsAutoDrift(!isAutoDrift)}
              className={`px-2 py-1 text-[10px] rounded border flex items-center gap-1 ${
                isAutoDrift
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Waves className="w-3 h-3" />
              <span>{isAutoDrift ? t.windSimActive : t.windSim}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
