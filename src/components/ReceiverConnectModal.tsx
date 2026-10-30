import React, { useState } from 'react';
import { Wifi, Server, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, HelpCircle, ShieldAlert } from 'lucide-react';
import { ReceiverConfig } from '../types/satellite';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';
import { Ali2661Adapter, isValidIPv4, isValidPort } from '../services/receiver/Ali2661Adapter';
import { SimulationAdapter } from '../services/receiver/SimulationAdapter';
import { DvbFinderAdapter } from '../services/receiver/DvbFinderAdapter';
import { signalReader } from '../services/telemetry/SignalReader';

interface Props {
  config: ReceiverConfig;
  onUpdateConfig: (newConfig: Partial<ReceiverConfig>) => void;
  onClose: () => void;
  isOutdoorSunMode: boolean;
  t?: Translations;
  lang?: Language;
}

export const ReceiverConnectModal: React.FC<Props> = ({
  config,
  onUpdateConfig,
  onClose,
  isOutdoorSunMode,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const [ip, setIp] = useState(config.ip);
  const [port, setPort] = useState(config.port.toString());
  const [protocol, setProtocol] = useState(config.protocol);
  const [tuner, setTuner] = useState(config.tuner);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
    hint?: string;
    latency?: number;
  } | null>(null);
  const [motorStatus, setMotorStatus] = useState<string | null>(null);

  // Validation
  const isIpValid = isValidIPv4(ip);
  const isPortValid = isValidPort(parseInt(port, 10));

  const handleTestConnection = async () => {
    // 1. Validation check
    if (protocol !== 'simulation') {
      if (!isIpValid) {
        setTestResult({
          success: false,
          msg: lang === 'ar' ? 'عنوان IP غير صحيح (يجب أن يكون بصيغة مثل 192.168.1.15)' : 'Invalid IPv4 address format (e.g. 192.168.1.15)'
        });
        return;
      }
      if (!isPortValid) {
        setTestResult({
          success: false,
          msg: lang === 'ar' ? 'رقم المنفذ غير صحيح (يجب أن يكون بين 1 و 65535)' : 'Invalid port (must be 1-65535)'
        });
        return;
      }
    }

    setIsTesting(true);
    setTestResult(null);

    const targetPort = parseInt(port, 10) || 20000;
    const testConfig: ReceiverConfig = {
      ip: ip.trim(),
      port: targetPort,
      protocol,
      isConnected: false,
      model: 'Cristor Toro 700 4K (Ali M2661)',
      tuner,
      isSimulating: protocol === 'simulation',
      lastPingMs: null
    };

    // Use unified SignalReader engine
    const result = await signalReader.setConfiguration(testConfig);
    setIsTesting(false);

    if (result.success) {
      setTestResult({
        success: true,
        msg: lang === 'ar' ? result.messageAr : result.message,
        latency: result.latencyMs
      });
      onUpdateConfig({
        ip: testConfig.ip,
        port: targetPort,
        protocol,
        isConnected: true,
        isSimulating: protocol === 'simulation',
        lastPingMs: result.latencyMs ?? 10
      });
    } else {
      // Honest failure: Never fake success on exception
      setTestResult({
        success: false,
        msg: lang === 'ar' ? result.messageAr : result.message,
        hint: lang === 'ar' ? result.diagnosticHintAr : result.diagnosticHint
      });
      onUpdateConfig({
        ip: testConfig.ip,
        port: targetPort,
        protocol,
        isConnected: false,
        isSimulating: false,
        lastPingMs: null
      });
    }
  };

  const handleSwitchToSimulation = async () => {
    setProtocol('simulation');
    setIsTesting(true);
    const simConfig: ReceiverConfig = {
      ip: ip.trim() || '192.168.1.15',
      port: parseInt(port, 10) || 20000,
      protocol: 'simulation',
      isConnected: true,
      model: 'Cristor Toro 700 4K (Simulator)',
      tuner,
      isSimulating: true,
      lastPingMs: 6
    };
    await signalReader.setConfiguration(simConfig);
    setIsTesting(false);
    setTestResult({
      success: true,
      msg: lang === 'ar' ? 'تم تفعيل وضع المحاكاة بنجاح' : 'Simulation mode enabled',
      latency: 6
    });
    onUpdateConfig(simConfig);
  };

  const handleMotorNudge = async (direction: 'east' | 'west') => {
    const dirText = direction === 'east' 
      ? (lang === 'ar' ? 'نحو الشرق' : 'Vers l\'Est') 
      : (lang === 'ar' ? 'نحو الغرب' : 'Vers l\'Ouest');
    setMotorStatus(lang === 'ar' ? `جاري إرسال أمر DiSEqC ${dirText}...` : `Sending DiSEqC command ${dirText}...`);

    try {
      await signalReader.getAdapter().sendMotorCommand({
        action: 'step',
        direction,
        steps: 1
      });
    } catch {
      // Handled
    }

    setTimeout(() => {
      setMotorStatus(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl border p-4 sm:p-5 text-right space-y-4 my-auto ${
        isOutdoorSunMode ? 'bg-black border-yellow-400' : 'bg-slate-900 border-slate-700'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">{t.receiverModalTitle}</h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            Ali 2661 Demod
          </span>
        </div>

        {/* Honest Connection Status Banner */}
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
          config.isConnected
            ? config.isSimulating
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-slate-950/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">{t.connStatus}</span>
            <div className="flex items-center gap-1.5 font-bold font-mono">
              <span className={`w-2 h-2 rounded-full ${
                config.isConnected
                  ? config.isSimulating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                  : 'bg-rose-500'
              }`} />
              <span>
                {config.isConnected
                  ? config.isSimulating
                    ? (lang === 'ar' ? 'وضع المحاكاة نشط (تيونر افتراضي)' : 'Simulation Active')
                    : (lang === 'ar' ? 'متصل بجهاز حقيقي' : 'Hardware Connected')
                  : (lang === 'ar' ? 'غير متصل' : 'Disconnected')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
            <span>{t.receiverSupported}</span>
            <span className="font-mono text-sky-300">Cristor Toro 700 / Ali 2661</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              {t.ipAddress}
            </label>
            <div className="relative">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.15"
                className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white font-mono text-sm focus:outline-none transition-colors ${
                  !isIpValid && protocol !== 'simulation'
                    ? 'border-rose-500/80 focus:border-rose-400'
                    : 'border-slate-700 focus:border-sky-500'
                }`}
              />
              <Wifi className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            {!isIpValid && protocol !== 'simulation' && (
              <span className="text-[10px] text-rose-400 mt-1 block">
                {lang === 'ar' ? 'تنسيق IPv4 غير صالح (أرقام بين 0 و 255 تفصلها نقاط)' : 'Invalid IPv4 (e.g. 192.168.1.15)'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.port}</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="20000"
                className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white font-mono text-sm ${
                  !isPortValid && protocol !== 'simulation' ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">{t.tuner}</label>
              <select
                value={tuner}
                onChange={(e) => setTuner(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
              >
                <option value={1}>{t.tunerPrimary} (Tuner 1 - Main)</option>
                <option value={2}>{t.tunerSecondary} (Tuner 2 - Loop)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">{t.protocol}</label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as ReceiverConfig['protocol'])}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
            >
              <option value="simulation">
                {lang === 'ar' ? '⭐ وضع المحاكاة الافتراضية (بدون الحاجة لشبكة)' : '⭐ Virtual Simulation Mode (Offline)'}
              </option>
              <option value="ali2661">
                {lang === 'ar' ? 'جهاز Cristor Toro 700 / معالج Ali 2661 (شبكة محلية)' : 'Cristor Toro 700 / Ali 2661 LAN'}
              </option>
              <option value="dvbfinder">
                {lang === 'ar' ? 'بروتوكول DVB-Finder (بث محلي UDP / TCP)' : 'DVB-Finder Protocol'}
              </option>
            </select>
          </div>
        </div>

        {/* DiSEqC 1.2 Motor Controls */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-slate-400 font-medium">
              {t.diseqcControl}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">USALS / DiSEqC 1.2</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleMotorNudge('east')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-mono text-xs transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>{t.moveEast}</span>
            </button>
            <button
              onClick={() => handleMotorNudge('west')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-200 flex items-center justify-center gap-1 font-mono text-xs transition-colors"
            >
              <span>{t.moveWest}</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          {motorStatus && (
            <div className="mt-2 text-center text-amber-400 font-bold text-[11px] animate-pulse">
              {motorStatus}
            </div>
          )}
        </div>

        {/* Honest Test Result / Diagnostic Feedback */}
        {testResult && (
          <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold block">{testResult.msg}</span>
                {testResult.latency !== undefined && (
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    Latency: {testResult.latency} ms
                  </span>
                )}
                {testResult.hint && (
                  <span className="text-[11px] text-amber-300/90 block mt-1 leading-relaxed">
                    💡 {testResult.hint}
                  </span>
                )}
              </div>
            </div>

            {/* Quick action to switch to simulation if hardware fails */}
            {!testResult.success && protocol !== 'simulation' && (
              <button
                onClick={handleSwitchToSimulation}
                className="mt-2 w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/40 transition-colors"
              >
                {lang === 'ar' ? 'التبديل إلى وضع المحاكاة الآن' : 'Switch to Simulation Mode'}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isOutdoorSunMode
                ? 'bg-yellow-400 text-black font-black'
                : 'bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? t.connectingTest : t.connectAndTest}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
