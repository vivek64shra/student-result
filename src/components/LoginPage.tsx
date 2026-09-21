import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Hash, FileText, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';

interface LoginPageProps {
  students: ParsedStudent[];
  onAdminLoginSuccess: () => void;
  onStudentLoginSuccess: (student: ParsedStudent) => void;
  statusText?: string;
  isLiveLoading?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  students,
  onAdminLoginSuccess,
  onStudentLoginSuccess,
  statusText,
  isLiveLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  // Student Login State - strictly Scholar No and Roll No
  const [scholarNumber, setScholarNumber] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentError, setStudentError] = useState('');

  // Admin Login State - strictly empty initially with no hints
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
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

    // Match against loaded students list: both scholar number and roll number must match!
    const matched = students.find((s) => {
      const sScholar = String(s.scholarNo || '').trim().toLowerCase();
      const sRoll = String(s.rollNo || '').trim().toLowerCase();
      return sScholar === trimmedScholar && sRoll === trimmedRoll;
    });

    if (matched) {
      onStudentLoginSuccess(matched);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0d2146] to-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Header Container */}
      <header className="relative z-10 text-center max-w-3xl mx-auto pt-2 pb-6">
        <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-4">
          <img
            src={SCHOOL_LOGO_URL}
            alt="School Logo"
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full bg-white p-1"
          />
        </div>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide uppercase drop-shadow-md">
          {SCHOOL_INFO.schoolName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          डाइसकोड: {SCHOOL_INFO.diceCode} • संस्था कोड: {SCHOOL_INFO.institutionCode} • सत्र: {SCHOOL_INFO.academicSession}
        </p>

        {statusText && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-slate-200">
            {isLiveLoading ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{statusText}</span>
          </div>
        )}
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden backdrop-blur-sm">
          {/* Dual Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
              }}
              className={`py-3 px-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-[#1a73e8] shadow-md border border-slate-200/80'
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

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'student' ? (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    विद्यार्थी परीक्षा परिणाम लॉगिन
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    अपना स्कॉलर नंबर एवं रोल नंबर दर्ज करें
                  </p>
                </div>

                {studentError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{studentError}</span>
                  </div>
                )}

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1a73e8] to-[#1258b5] hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>परिणाम व अंकसूची देखें</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    प्रशासक / संस्था प्रमुख लॉगिन
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    समस्त कक्षाओं का समग्र विश्लेषण एवं ग्राफ़िकल डैशबोर्ड
                  </p>
                </div>

                {adminError && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin User ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="Admin User ID दर्ज करें"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Password दर्ज करें"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                      <span>प्रशासक लॉगिन करें</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="bg-slate-50/90 px-6 py-3.5 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
            सुरक्षित एवं गोपनीय परीक्षा परिणाम पोर्टल • {SCHOOL_INFO.schoolName}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 py-4">
        © {new Date().getFullYear()} {SCHOOL_INFO.schoolName} • सर्वाधिकार सुरक्षित
      </footer>
    </div>
  );
};
