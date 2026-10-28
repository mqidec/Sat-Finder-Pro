import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Copy,
  Layers,
  Code,
  Sparkles,
  Info,
  X,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { TRANSLATIONS, Language, Translations } from '../i18n/translations';

interface Props {
  onClose: () => void;
  isOutdoorSunMode: boolean;
  t?: Translations;
  lang?: Language;
}

export const ApkExportModal: React.FC<Props> = ({
  onClose,
  isOutdoorSunMode,
  t = TRANSLATIONS.ar,
  lang = 'ar'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'pwabuilder' | 'capacitor'>('instant');

  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  const handleInstallClick = async () => {
    await install();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-2xl border p-4 sm:p-5 text-right space-y-4 max-h-[90vh] overflow-y-auto ${
          isOutdoorSunMode
            ? 'bg-black border-2 border-yellow-400 text-yellow-100 shadow-[0_0_20px_rgba(234,179,8,0.25)]'
            : 'bg-[#0b1222] border-slate-700/80 text-slate-100 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>الحصول على تطبيق الهاتف (ملف APK)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Android APK & PWA
                </span>
              </h2>
              <span className="text-xs text-slate-400 block -mt-0.5">
                تثبيت مباشر على هاتف الأندرويد أو استخراج حزمة .apk جاهزة
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. تثبيت فوري (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwabuilder'
                ? 'bg-sky-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. استخراج ملف APK</span>
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'capacitor'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>3. Android Studio</span>
          </button>
        </div>

        {/* Tab 1: Instant PWA Install on Android */}
        {activeTab === 'instant' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>أسهل وأسرع طريقة: التثبيت المباشر على الهاتف</span>
              </h3>
              <p className="text-slate-300 text-xs">
                التطبيق مجهز بتقنية <strong>Progressive Web App (PWA)</strong>، مما يعني أنه يعمل كتطبيق أندرويد حقيقي: أيقونة مستقلة على شاشة هاتفك، يعمل بملء الشاشة، ويدعم العمل <strong>أوفلاين بدون إنترنت</strong> على الأسطح!
              </p>
            </div>

            {/* In-App Install Button */}
            {isInstalled ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/50 text-center text-emerald-400 font-bold">
                ✓ التطبيق مثبت بالفعل على هذا الجهاز ويعمل كـ تطبيق أندرويد مستقل!
              </div>
            ) : isInstallable ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>تثبيت التطبيق على هاتف الأندرويد الآن</span>
              </button>
            ) : isIOS ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                <span className="font-bold text-white block mb-1">للتثبيت على iPhone / iPad:</span>
                1. اضغط على زر المشاركة <strong>Share (مربع بسهم لأعلى)</strong> في متصفح Safari.<br />
                2. اختر <strong>"إضافة إلى الشاشة الرئيسية (Add to Home Screen)"</strong>.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-white block">خطوات التثبيت من متصفح الهاتف (Chrome):</span>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>افتح هذا الرابط على متصفح <strong>Google Chrome</strong> على هاتفك.</li>
                  <li>اضغط على قائمة الثلاث نقاط <strong>(⋮)</strong> في أعلى الزاوية.</li>
                  <li>اختر <strong>"تثبيت التطبيق (Install app)"</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية"</strong>.</li>
                  <li>سيظهر التطبيق فوراً في درج تطبيقات هاتفك كأي تطبيق APK مثبت.</li>
                </ol>
              </div>
            )}

            {/* Quick URL Copy Box */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-slate-400 text-[11px] truncate">رابط التطبيق لفتحه من هاتفك:</span>
              <button
                onClick={handleCopyUrl}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  copiedUrl
                    ? 'bg-emerald-500 text-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Generate APK via PWABuilder */}
        {activeTab === 'pwabuilder' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5 mb-1">
                <Download className="w-4 h-4 text-sky-400" />
                <span>تحويل التطبيق إلى ملف .apk حقيقي عبر PWABuilder (مجاني 100%)</span>
              </h3>
              <p className="text-slate-300 text-xs">
                <strong>PWABuilder</strong> هي أداة رسمية مدعومة من Microsoft تقوم بتحويل تطبيقات الويب إلى ملف <strong>.apk</strong> موقع وقابل للتثبيت المباشر على أي هاتف أندرويد أو رفعه لمتجر Google Play.
              </p>
            </div>

            <div className="space-y-2 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
              <div className="font-bold text-white text-xs mb-1">طريقة استخراج ملف الـ APK:</div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <div>
                  انسخ رابط هذا التطبيق الحالي:
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentAppUrl}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-sky-300"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-2.5 py-1 bg-sky-500 text-black font-bold rounded text-[10px]"
                    >
                      {copiedUrl ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <div>
                  افتح موقع <strong>PWABuilder</strong>:
                  <div className="mt-1">
                    <a
                      href="https://www.pwabuilder.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 underline font-bold"
                    >
                      <span>https://www.pwabuilder.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <div>
                  الصق الرابط واضغط <strong>Start</strong> ثم اضغط على <strong>Package for Android</strong>.
                  <div className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                    💡 <span className="text-sky-300 font-bold">إذا ظهر تنبيه "Manifest description is missing":</span>
                    <br />
                    اضغط على زر <strong>Re-test</strong> لإعادة الفحص، أو اكتب الوصف التالي في خانة Description:
                    <div className="mt-1 font-mono text-[9px] text-emerald-300 bg-slate-950 p-1.5 rounded select-all">
                      Cristor Toro Pro - Satellite dish pointer and dB signal meter
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <div>
                  اضغط <strong>Generate APK / Download Package</strong> وستحصل فوراً على ملف <strong>.apk</strong> جاهز للإرسال والتثبيت على أي هاتف!
                </div>
              </div>
            </div>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
            >
              <span>فتح موقع PWABuilder الآن لاستخراج ملف APK</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Tab 3: Native Build via Capacitor */}
        {activeTab === 'capacitor' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5 mb-1">
                <Code className="w-4 h-4 text-amber-400" />
                <span>البناء البرمجي عبر Capacitor & Android Studio</span>
              </h3>
              <p className="text-slate-300 text-xs">
                إذا كنت ترغب في بناء ملف APK أو AAB محلياً على حاسوبك باستخدام Android Studio وإضافة مكتبات جافا/كوتلن، يمكنك استخدام <strong>Capacitor</strong>:
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] space-y-2">
              <span className="text-slate-400 block font-mono"># 1. تثبيت Capacitor في المشروع:</span>
              <code className="block bg-slate-900 p-2 rounded text-amber-300 font-mono text-[10px]">
                npm install @capacitor/core @capacitor/cli @capacitor/android
              </code>

              <span className="text-slate-400 block font-mono"># 2. بناء مجلد dist وإضافة بيئة الأندرويد:</span>
              <code className="block bg-slate-900 p-2 rounded text-amber-300 font-mono text-[10px]">
                npm run build<br />
                npx cap add android<br />
                npx cap copy android
              </code>

              <span className="text-slate-400 block font-mono"># 3. فتح المشروع في Android Studio لتوليد الـ APK:</span>
              <code className="block bg-slate-900 p-2 rounded text-amber-300 font-mono text-[10px]">
                npx cap open android
              </code>
              <p className="text-slate-400 text-[10px] mt-1">
                في Android Studio: اذهب إلى <strong>Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)</strong> وسيتم توليد ملف APK مباشرة.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>التطبيق متوافق مع Android 7.0 حتى أحدث إصدارات Android 15.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
