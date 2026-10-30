import React, { useState } from 'react';
import { BookOpen, CheckCircle, ShieldCheck, Terminal, Smartphone, HelpCircle, Layers, Radio, X } from 'lucide-react';
import { Language, Translations, TRANSLATIONS } from '../i18n/translations';
import { runSatelliteMathTests } from '../utils/satelliteMath.test';

interface Props {
  onClose: () => void;
  isOutdoorSunMode: boolean;
  lang?: Language;
  t?: Translations;
}

export const DocumentationModal: React.FC<Props> = ({
  onClose,
  isOutdoorSunMode,
  lang = 'ar',
  t = TRANSLATIONS.ar
}) => {
  const [activeTab, setActiveTab] = useState<'fieldGuide' | 'protocols' | 'mathTests' | 'apk'>('fieldGuide');
  const [testResults, setTestResults] = useState<{ passed: number; failed: number; results: string[] } | null>(null);

  const handleRunTests = () => {
    const res = runSatelliteMathTests();
    setTestResults(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-2xl border p-4 sm:p-6 text-right space-y-4 my-auto ${
        isOutdoorSunMode ? 'bg-black border-yellow-400' : 'bg-slate-900 border-slate-700'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">
              {lang === 'ar' ? 'دليل الاستخدام وتوثيق بروتوكولات الرسيفر' : 'Documentation & Protocol Reference'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('fieldGuide')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'fieldGuide'
                ? 'bg-sky-500 text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'ar' ? '🛠️ الدليل الميداني للضبط' : 'Field Dish Guide'}
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'protocols'
                ? 'bg-sky-500 text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'ar' ? '📡 بروتوكولات Ali 2661' : 'Ali 2661 Protocols'}
          </button>
          <button
            onClick={() => setActiveTab('mathTests')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'mathTests'
                ? 'bg-sky-500 text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'ar' ? '📐 اختبارات الحسابات الفضائية' : 'Math Tests'}
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === 'apk'
                ? 'bg-sky-500 text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang === 'ar' ? '📱 تغليف Android APK' : 'Android APK'}
          </button>
        </div>

        {/* Content Section 1: Field Dish Guide */}
        {activeTab === 'fieldGuide' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-300 text-sm">
                {lang === 'ar' ? 'خطوات التوجيه الاحترافي للصحن:' : 'Professional Dish Alignment Steps:'}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>
                  <strong className="text-white">{lang === 'ar' ? '1. ضبط زاوية ميل اللاقط (LNB Skew):' : '1. Adjust LNB Skew:'}</strong>{' '}
                  {lang === 'ar'
                    ? 'قبل تحريك الصحن، قف أمام الصحن وأدر اللاقط بالزاوية الموضحة (+ لليمين، - لليسار). هذا يضمن عزل الاستقطاب العمودي عن الأفقي.'
                    : 'Tilt LNB to calculated degree before moving dish.'}
                </li>
                <li>
                  <strong className="text-white">{lang === 'ar' ? '2. ضبط زاوية الارتفاع الرأسي (Elevation):' : '2. Set Elevation:'}</strong>{' '}
                  {lang === 'ar'
                    ? 'اضبط مؤشر الدرجات المدرج على حامل الصحن الخلفي على زاوية الارتفاع المحددة (مثال: 45° لنايل سات بالجزائر).'
                    : 'Set vertical angle using backbracket degree ruler.'}
                </li>
                <li>
                  <strong className="text-white">{lang === 'ar' ? '3. التحريك الأفقي البطيء (Azimuth):' : '3. Slow Horizontal Sweep:'}</strong>{' '}
                  {lang === 'ar'
                    ? 'فعل النغمة الصوتية (Beeper). حرك الصحن ببطء شديد يميناً ويساراً حتى تسمع تسارع النغمة الصوتية وارتفاع SNR.'
                    : 'Use acoustic beeper to slowly find strongest SNR beam.'}
                </li>
                <li>
                  <strong className="text-white">{lang === 'ar' ? '4. الشد المتوازن والتثبيت:' : '4. Symmetric Bolt Tightening:'}</strong>{' '}
                  {lang === 'ar'
                    ? 'راقب مخطط ثبات الإشارة (Signal Stability Log). شد البراغي الأربعة بالتناوب المتقاطع حتى لا تنحرف البؤرة أثناء الشد.'
                    : 'Tighten bolts in cross pattern while monitoring stability chart.'}
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Content Section 2: Protocols */}
        {activeTab === 'protocols' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-300 text-sm">
                {lang === 'ar' ? 'بنية الاتصال بأجهزة Cristor Toro 700 / معالج Ali M2661:' : 'Cristor Toro / Ali M2661 Architecture:'}
              </h4>
              <p>
                {lang === 'ar'
                  ? 'يعتمد جهاز Cristor Toro 700 4K على معالج Ali M2661 المزوّد بتيونر DVB-S2X وواجهة شبكة Ethernet / Wi-Fi.'
                  : 'Cristor Toro 700 uses Ali M2661 chipset with DVB-S2X tuner.'}
              </p>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div>• TCP Demod Port: 20000 / 8080</div>
                <div>• UDP Discovery: 255.255.255.255:20000</div>
                <div>• Control Protocol: DiSEqC 1.0/1.2 & USALS motor telemetry</div>
              </div>
              <p className="text-amber-300 text-[11px]">
                {lang === 'ar'
                  ? '⚠️ ملاحظة تقنية هامة: متصفحات الويب تطبق قيود أمان تمنع فتح مآخذ Raw TCP مباشرة من صفحات HTTPS دون خادم وسيط (CORS / WebSocket Bridge). لذلك يوفر التطبيق وضع المحاكاة الميداني الدقيق (Virtual Simulator) لضبط الصحن بدون الحاجة لربط الكابلات على السطح.'
                  : 'Browsers enforce CORS/Mixed-Content constraints. Use simulation mode or local companion bridge for live tuning.'}
              </p>
            </div>
          </div>
        )}

        {/* Content Section 3: Math Tests */}
        {activeTab === 'mathTests' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm">
                    {lang === 'ar' ? 'التحقق الرياضي من خوارزميات الحسابات الفضائية' : 'Orbital Math Test Suite'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'ar'
                      ? 'مطابقة حسابات السمت والارتفاع والانحراف المغناطيسي مع المراجع الدولية (ITU-R).'
                      : 'Verifies Azimuth, Elevation, Skew and Declination against ITU benchmarks.'}
                  </p>
                </div>
                <button
                  onClick={handleRunTests}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors"
                >
                  {lang === 'ar' ? 'تشغيل الاختبارات الآن' : 'Run Tests'}
                </button>
              </div>

              {testResults && (
                <div className="space-y-2 pt-2 border-t border-slate-800 font-mono">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400 font-bold">Passed: {testResults.passed}</span>
                    <span className="text-rose-400 font-bold">Failed: {testResults.failed}</span>
                  </div>
                  <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    {testResults.results.map((r, i) => (
                      <div key={i} className={r.startsWith('✅') ? 'text-emerald-300' : 'text-rose-400'}>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Section 4: Android APK Packaging */}
        {activeTab === 'apk' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-300 text-sm">
                {lang === 'ar' ? 'خيارات تثبيت وتغليف أندرويد:' : 'Android Deployment Options:'}
              </h4>
              <p>
                {lang === 'ar'
                  ? '1. التثبيت الفوري كـ WebAPK: عبر فتح التطبيق في Google Chrome على الهاتف والضغط على (تثبيت التطبيق).'
                  : '1. Instant WebAPK installation via Chrome (Install App).'}
              </p>
              <p>
                {lang === 'ar'
                  ? '2. بناء ملف APK مستقل عبر Capacitor: تنزيل المشروع واستخدام Android Studio لتصدير ملف app-release.apk.'
                  : '2. Local APK compile using Capacitor & Android Studio.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
