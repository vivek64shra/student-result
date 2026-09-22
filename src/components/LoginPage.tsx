import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  User, 
  FileText, 
  Hash, 
  AlertCircle,
  Building2,
  Lock,
  Loader2
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';

interface LoginPageProps {
  students: ParsedStudent[];
  onAdminLoginSuccess: () => void;
  onStudentLoginSuccess: (student: ParsedStudent) => Promise<void> | void;
  lastUpdated?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  students,
  onAdminLoginSuccess,
  onStudentLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  
  // Student Form State
  const [scholarNumber, setScholarNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentError, setStudentError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Form State
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const trimmedScholar = scholarNumber.trim().toLowerCase();
    const trimmedRoll = rollNumber.trim().toLowerCase();

    if (!trimmedScholar) {
      setStudentError('कृपया स्कॉलर नंबर दर्ज करें।');
      return;
    }
    if (!trimmedRoll) {
      setStudentError('कृपया रोल नंबर दर्ज करें।');
      return;
    }

    // Match against loaded students list
    const matched = students.find((s) => {
      const sScholar = String(s.scholarNo || '').trim().toLowerCase();
      const sRoll = String(s.rollNo || '').trim().toLowerCase();
      return sScholar === trimmedScholar && sRoll === trimmedRoll;
    });

    if (matched) {
      setIsLoggingIn(true);
      try {
        await onStudentLoginSuccess(matched);
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      setStudentError('अमान्य स्कॉलर नंबर अथवा रोल नंबर! कृपया स्कूल रिकॉर्ड अनुसार सही जानकारी दर्ज करें।');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const u = adminUsername.trim();
    const p = adminPassword.trim();

    if (u === 'Vivek@' && p === 'Vivek@') {
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

      {/* Header Container */}
      <header className="relative z-10 text-center max-w-3xl mx-auto pt-2 pb-3 sm:pb-5">
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
                    लॉगिन करने के लिए स्कॉलर नंबर एवं रोल नंबर दर्ज करें
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
                      स्कॉलर नंबर (Scholar No.)
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
                      रोल नंबर (Roll No.)
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
                          <span>डेटा सिंक एवं लॉगिन हो रहा है...</span>
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
                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-500">
                    स्कॉलर नंबर एवं रोल नंबर आपके विद्यालय प्रवेश पत्र अथवा पिछली रसीद पर उपलब्ध है।
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
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 py-3">
        <p>© {SCHOOL_INFO.schoolName} • सर्वाधिकार सुरक्षित</p>
      </footer>
    </div>
  );
};
