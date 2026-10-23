import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Code2, 
  Globe, 
  Smartphone, 
  CheckCircle2, 
  Layers, 
  Play,
  KeyRound
} from 'lucide-react';
import { GOOGLE_SHEETS_PUBHTML_URL, GOOGLE_SHEETS_EXPORT_URL, SCHOOL_INFO } from '../utils/reportCardParser';
import { FEES_GOOGLE_SHEETS_CSV_URL } from '../utils/feesParser';

interface PublishAndEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishAndEmbedModal: React.FC<PublishAndEmbedModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testScholar, setTestScholar] = useState<string>('2480');
  const [testRoll, setTestRoll] = useState<string>('12');
  const [activeTab, setActiveTab] = useState<'sheets' | 'embed' | 'api'>('sheets');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-i7imuplqubjkqg45czyeva-792653887974.asia-southeast1.run.app';

  const embedUrl = `${currentOrigin}/?scholar=${encodeURIComponent(testScholar)}&roll=${encodeURIComponent(testRoll)}&view=result&embed=true`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="850" frameborder="0" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" allowfullscreen></iframe>`;
  const apiEndpointUrl = `${currentOrigin}/api/public/result/${encodeURIComponent(testScholar)}?roll=${encodeURIComponent(testRoll)}`;
  const apiAllStudentsUrl = `${currentOrigin}/api/public/students?className=10A`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:hidden">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-indigo-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider mb-1">
                इंटीग्रेशन एवं पब्लिश सेंटर
              </div>
              <h2 className="text-base sm:text-xl font-black text-white">
                Google Sheets लिंक एवं अन्य ऐप्स में रिजल्ट पब्लिशिंग
              </h2>
              <p className="text-xs text-indigo-200">
                {SCHOOL_INFO.schoolName} • सत्र 2026-27
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-3 bg-slate-100 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Google Sheets सिंक लिंक</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'embed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. वेबसाइट/वर्डप्रेस Iframe एम्बेड</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'api'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>3. मोबाइल ऐप / REST API (JSON)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* TAB 1: GOOGLE SHEETS LINKS */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>मुख्य Google Sheets जिससे परिणाम और डेटा सिंक होता है:</span>
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  नीचे दिए गए लिंक से आप सीधे मुख्य रिजल्ट शीट को ब्राउज़र में देख सकते हैं अथवा अपने कम्प्यूटर में डाउनलोड कर सकते हैं।
                </p>
              </div>

              {/* Sheet Link 1: Result PubHTML */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-blue-100 text-blue-900 uppercase">
                      मुख्य परीक्षा परिणाम शीट (Online View)
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                      Google Sheets Published Web View (HTML Link)
                    </h4>
                  </div>
                  <a
                    href={GOOGLE_SHEETS_PUBHTML_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>शीट खोलें ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{GOOGLE_SHEETS_PUBHTML_URL}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(GOOGLE_SHEETS_PUBHTML_URL, 'pubhtml')}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shrink-0 cursor-pointer"
                    title="लिंक कॉपी करें"
                  >
                    {copiedKey === 'pubhtml' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sheet Link 2: XLSX Export */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-emerald-100 text-emerald-900 uppercase">
                      डायरेक्ट एक्सेल डाउनलोड / लाइव एक्सपोर्ट (XLSX)
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                      Direct Excel Live Sync Export URL
                    </h4>
                  </div>
                  <a
                    href={GOOGLE_SHEETS_EXPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>डाउनलोड ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{GOOGLE_SHEETS_EXPORT_URL}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(GOOGLE_SHEETS_EXPORT_URL, 'xlsx')}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shrink-0 cursor-pointer"
                    title="लिंक कॉपी करें"
                  >
                    {copiedKey === 'xlsx' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sheet Link 3: Fees CSV */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-amber-100 text-amber-900 uppercase">
                      विद्यार्थी शुल्क शीट (Fees CSV Link)
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                      Student Fees Google Sheets Live CSV
                    </h4>
                  </div>
                  <a
                    href={FEES_GOOGLE_SHEETS_CSV_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>CSV खोलें ↗</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{FEES_GOOGLE_SHEETS_CSV_URL}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(FEES_GOOGLE_SHEETS_CSV_URL, 'fees')}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 shrink-0 cursor-pointer"
                    title="लिंक कॉपी करें"
                  >
                    {copiedKey === 'fees' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSITE / WORDPRESS / IFRAME EMBED */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                <h3 className="text-sm font-black text-blue-950 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-700" />
                  <span>किसी दूसरी वेबसाइट या वर्डप्रेस में रिजल्ट एम्बेड (Embed) करने का तरीका:</span>
                </h3>
                <p className="text-xs text-blue-800 mt-1">
                  इस लिंक या Iframe कोड को आप अपनी मुख्य स्कूल वेबसाइट, ब्लॉग, वर्डप्रेस पेज या किसी अन्य वेब ऐप में सीधे पेस्ट कर सकते हैं।
                </p>
              </div>

              {/* Test Parameters */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      स्कॉलर नंबर (Scholar No):
                    </label>
                    <input
                      type="text"
                      value={testScholar}
                      onChange={(e) => setTestScholar(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      रोल नंबर (Roll No / Password):
                    </label>
                    <input
                      type="text"
                      value={testRoll}
                      onChange={(e) => setTestRoll(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="pt-5">
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>लाइव टेस्ट करें ↗</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Embed URL */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    डायरेक्ट रिजल्ट लिंक (Direct Result URL with Embed Mode)
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(embedUrl, 'embedUrl')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'embedUrl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'embedUrl' ? 'कॉपी हो गया' : 'लिंक कॉपी करें'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs break-all select-all">
                  {embedUrl}
                </div>
              </div>

              {/* Ready-to-use HTML iframe Code */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    वेबसाइट में चिपकाने हेतु HTML &lt;iframe&gt; कोड:
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(iframeSnippet, 'iframeSnippet')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedKey === 'iframeSnippet' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'iframeSnippet' ? 'कोड कॉपी हो गया!' : 'Iframe कोड कॉपी करें'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto select-all">
                  {iframeSnippet}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: REST API FOR EXTERNAL APPS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl">
                <h3 className="text-sm font-black text-purple-950 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  <span>एंड्रॉयड, आईओएस ऐप या दूसरे सॉफ्टवेयर के लिए REST API (JSON):</span>
                </h3>
                <p className="text-xs text-purple-800 mt-1">
                  यदि आप Flutter, React Native, Java/Kotlin या किसी अन्य बैकएंड ऐप में रिजल्ट फेच करना चाहते हैं, तो यह सीधा JSON डेटा लौटाता है।
                </p>
              </div>

              {/* Endpoint 1: Single Student */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-purple-100 text-purple-900 uppercase">
                      GET API ENDPOINT
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      एकल विद्यार्थी परिणाम डेटा API
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={apiEndpointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                    >
                      JSON देखें ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiEndpointUrl, 'apiEndpointUrl')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'apiEndpointUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>कॉपी</span>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 text-purple-300 rounded-xl font-mono text-xs break-all select-all">
                  {apiEndpointUrl}
                </div>
              </div>

              {/* Endpoint 2: Students List */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-purple-100 text-purple-900 uppercase">
                      GET API ENDPOINT
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      कक्षावार अथवा खोज सूची API (Students Roster)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={apiAllStudentsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                    >
                      JSON देखें ↗
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiAllStudentsUrl, 'apiAllStudentsUrl')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedKey === 'apiAllStudentsUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>कॉपी</span>
                    </button>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 text-purple-300 rounded-xl font-mono text-xs break-all select-all">
                  {apiAllStudentsUrl}
                </div>
              </div>

              {/* Sample Code */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2">
                <span className="text-[11px] font-mono text-slate-400">JavaScript / React Fetch Example:</span>
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-black/40 rounded-xl">
{`fetch('${currentOrigin}/api/public/result/2480?roll=12')
  .then(res => res.json())
  .then(data => {
    console.log('विद्यार्थी नाम:', data.student.name);
    console.log('कक्षा:', data.student.className);
    console.log('त्रैमासिक परिणाम:', data.student.quarterly);
  });`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            * सुरक्षा नियम: बाह्य कॉल्स के लिए CORS पहले से सक्रिय (Active) है।
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
