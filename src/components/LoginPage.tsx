import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  User, 
  FileText, 
  Hash, 
  AlertCircle,
  Lock,
  Loader2,
  ExternalLink,
  MessageSquareText,
  Globe,
  HelpCircle
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';
import { StudentFeeRecord, findStudentFeeRecord } from '../utils/feesParser';

export const MAIN_SCHOOL_WEBSITE_URL = 'https://mdhsss.netlify.app/';

interface LoginPageProps {
  students: ParsedStudent[];
  fees?: StudentFeeRecord[];
  onAdminLoginSuccess: () => void;
  onStudentLoginSuccess: (student: ParsedStudent) => Promise<void> | void;
  onSyncLiveData?: () => Promise<{ students: ParsedStudent[]; fees: StudentFeeRecord[] } | null>;
  lastUpdated?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  students,
  fees,
  onAdminLoginSuccess,
  onStudentLoginSuccess,
  onSyncLiveData,
  lastUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  
  // Student Form State
  const [scholarNumber, setScholarNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Strict matching helper: Requires BOTH Scholar Number and Roll Number to match
  const findMatch = (
    studentList: ParsedStudent[],
    schInput: string,
    rollInput: string
  ): ParsedStudent | undefined => {
    const cleanScholar = schInput.trim().toLowerCase().replace(/\s+/g, '');
    const cleanRoll = rollInput.trim().toLowerCase().replace(/\s+/g, '');

    // Strictly requires both inputs
    if (!cleanScholar || !cleanRoll) return undefined;

    const numScholar = parseInt(cleanScholar, 10);
    const numRoll = parseInt(cleanRoll, 10);

    for (const s of studentList) {
      const sSch = String(s.scholarNo || '').trim().toLowerCase().replace(/\s+/g, '');
      const sRoll = String(s.rollNo || '').trim().toLowerCase().replace(/\s+/g, '');

      // Strict rule: If student record in data has NO roll number, login is NOT permitted
      if (!sRoll || sRoll === '-' || sRoll === 'null' || sRoll === 'undefined') {
        continue;
      }

      const sNumSch = parseInt(sSch, 10);
      const sNumRoll = parseInt(sRoll, 10);

      const scholarMatches = (sSch === cleanScholar) || (!isNaN(numScholar) && sNumSch === numScholar);
      const rollMatches = (sRoll === cleanRoll) || (!isNaN(numRoll) && sNumRoll === numRoll);

      // BOTH Scholar Number and Roll Number MUST match
      if (scholarMatches && rollMatches) {
        return s;
      }
    }

    return undefined;
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const trimmedScholar = scholarNumber.trim();
    const trimmedRoll = rollNumber.trim();

    // Strict validation: Both are mandatory
    if (!trimmedScholar || !trimmedRoll) {
      setStudentError('लॉगिन के लिए स्कॉलर नंबर एवं रोल नंबर दोनों दर्ज करना अनिवार्य है।');
      return;
    }

    setIsLoggingIn(true);
    setSyncStatus('');

    try {
      // 1. Check in currently loaded student list
      let matched = findMatch(students, trimmedScholar, trimmedRoll);

      // 2. If not found in memory, immediately fetch live Google Sheets data and retry
      if (!matched && onSyncLiveData) {
        setSyncStatus('नवीनतम रिकॉर्ड प्राप्त किया जा रहा है...');
        try {
          const freshData = await onSyncLiveData();
          if (freshData?.students) {
            matched = findMatch(freshData.students, trimmedScholar, trimmedRoll);
          }
        } catch (fetchErr) {
          console.warn('Instant fetch on login failed:', fetchErr);
        }
      }

      if (matched) {
        await onStudentLoginSuccess(matched);
      } else {
        setStudentError('अमान्य स्कॉलर नंबर अथवा रोल नंबर! कृपया सही स्कॉलर नंबर एवं रोल नंबर दर्ज करें। यदि डेटा में रोल नंबर उपलब्ध नहीं है तो लॉगिन संभव नहीं है।');
      }
    } finally {
      setIsLoggingIn(false);
      setSyncStatus('');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const u = adminUsername.trim();
    const p = adminPassword.trim();

    if (u === 'Vivek@' && p === 'Vivek64@') {
      onAdminLoginSuccess();
    } else {
      setAdminError('अमान्य क्रेडेंशियल्स! सही User ID एवं Password दर्ज करें।');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c162c] via-[#122347] to-[#0a1224] flex flex-col justify-between p-3 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Top Header with Quick Links */}
      <header className="relative z-10 text-center max-w-3xl mx-auto pt-2 pb-3 sm:pb-5 w-full">
        {/* Main Website & Feedback Direct Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2 print:hidden print-hidden">
          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="माँ दुर्गा उ.मा. विद्यालय मुख्य वेबसाइट खोलें"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shadow-xs group"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform" />
            <span>विद्यालय मुख्य पृष्ठ (Main Website)</span>
            <ExternalLink className="w-3 h-3 text-slate-300" />
          </a>

          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="किसी भी समस्या या फीडबैक के लिए यहाँ क्लिक करें"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-extrabold border border-amber-400/40 backdrop-blur-md transition-all shadow-xs"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
            <span>फीडबैक / Any Query</span>
            <ExternalLink className="w-3 h-3 text-amber-300" />
          </a>
        </div>

        <div className="inline-flex items-center justify-center p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-3">
          <img
            src={SCHOOL_LOGO_URL}
            alt="School Logo"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full bg-white p-1"
          />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-md">
          {SCHOOL_INFO.schoolName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          {SCHOOL_INFO.location}
        </p>

        {/* Institution Info Badges */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-semibold text-slate-300">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
            डाइस कोड: <b className="font-mono text-amber-300">{SCHOOL_INFO.diceCode}</b>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15">
            संस्था कोड: <b className="font-mono text-amber-300">{SCHOOL_INFO.institutionCode}</b>
          </span>
          {lastUpdated && (
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-slate-300">
              अद्यतन: <b className="text-emerald-300 font-mono">{lastUpdated}</b>
            </span>
          )}
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Dual Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`py-3 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-[#1a73e8] shadow-md border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>विद्यार्थी लॉगिन</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError('');
              }}
              className={`py-3 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-[#1258b5] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>प्रशासक / प्रमुख</span>
            </button>
          </div>

          <div className="p-5 sm:p-7">
            {activeTab === 'student' ? (
              /* Student Login Form */
              <div>
                <div className="text-center mb-5">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    विद्यार्थी डिजिटल पोर्टल
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-800">
                    <span>🎓 परीक्षा परिणाम (Result)</span>
                    <span>•</span>
                    <span>💳 शुल्क विवरण (Fees)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    स्कॉलर नंबर एवं रोल नंबर दोनों दर्ज कर लॉगिन करें
                  </p>
                </div>

                {studentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{studentError}</span>
                  </div>
                )}

                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      स्कॉलर नंबर (Scholar Number) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={scholarNumber}
                        onChange={(e) => setScholarNumber(e.target.value)}
                        placeholder="स्कॉलर नंबर दर्ज करें"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      रोल नंबर (Roll Number) *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        placeholder="रोल नंबर दर्ज करें"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                        disabled={isLoggingIn}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#1a73e8] to-[#1258b5] hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{syncStatus || 'डेटा सिंक एवं लॉगिन हो रहा है...'}</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-5 h-5" />
                          <span>लॉगिन करें (Login)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Helpful Instruction Box */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500 font-medium">
                    लॉगिन हेतु स्कॉलर नंबर एवं रोल नंबर दोनों आवश्यक हैं। दोनों विवरण सही होने पर ही लॉगिन होगा।
                  </p>
                </div>
              </div>
            ) : (
              /* Admin Login Form */
              <div>
                <div className="text-center mb-5">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    प्रशासक / प्रप्रमुख पोर्टल
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    संस्था प्रमुख / एडमिन क्रेडेंशियल्स दर्ज करें
                  </p>
                </div>

                {adminError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      यूजर आईडी (User ID)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="यूजर आईडी दर्ज करें"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      पासवर्ड (Password)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="पासवर्ड दर्ज करें"
                        className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Lock className="w-4 h-4" />
                      <span>प्रशासक लॉगिन करें</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* User-Friendly Help & Feedback Section (For Any Query) */}
        <div className="mt-4 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-lg text-slate-200 print:hidden print-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/30">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>किसी भी समस्या या फीडबैक के लिए</span>
                <span className="text-[11px] font-normal text-amber-300">(For Any Query / Feedback)</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                लॉगिन, परिणाम या शुल्क में किसी भी समस्या अथवा सुझाव के लिए सीधे मुख्य वेबसाइट के फीडबैक विकल्प से संपर्क करें:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <a
                  href={MAIN_SCHOOL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-slate-950" />
                  <span>फीडबैक भेजें / समस्या दर्ज करें ↗</span>
                </a>
                <a
                  href={MAIN_SCHOOL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>मुख्य पृष्ठ (Main Website) ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 py-3 print:hidden print-hidden">
        <p className="flex flex-wrap items-center justify-center gap-1.5">
          <span>© {SCHOOL_INFO.schoolName}</span>
          <span>•</span>
          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline inline-flex items-center gap-0.5"
          >
            <span>mdhsss.netlify.app ↗</span>
          </a>
        </p>
      </footer>
    </div>
  );
};
