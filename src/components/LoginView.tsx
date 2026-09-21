import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  Calendar,
  Award
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userId.trim() || !password.trim()) {
      setErrorMessage('Please enter both User ID and Password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Required dummy login: User ID 1212 and Password 1212
      if (userId.trim() === '1212' && password.trim() === '1212') {
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid credentials! Please use User ID: 1212 and Password: 1212');
      }
    }, 450);
  };

  const handleQuickDemoFill = () => {
    setUserId('1212');
    setPassword('1212');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner / Announcement Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-900/50 py-2.5 px-4 text-xs text-center text-indigo-200 flex items-center justify-center gap-2">
        <span className="bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/30 text-[11px] uppercase tracking-wide">
          Notice
        </span>
        <span>End-Term Examinations 2026 datesheet published. Students must download Digital Admit Cards before 10th Oct.</span>
      </div>

      {/* Main Login Body */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero & Portal Information (5 cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-medium text-slate-300">
              <School className="w-4 h-4 text-indigo-400" />
              <span>Apex University ERP & Academic Portal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Student Central <br />
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Academic Portal
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
                Access your real-time attendance logs, subject timetables, assignment submissions, official semester grade cards, digital ID, and university circulars.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="font-semibold text-white text-sm">Attendance Radar</div>
                <div className="text-xs text-slate-400 mt-0.5">Subject-wise 75% rule bunker calculator</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <div className="font-semibold text-white text-sm">Grades & Marksheet</div>
                <div className="text-xs text-slate-400 mt-0.5">Official SGPA/CGPA transcript & admit card</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-2">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="font-semibold text-white text-sm">Live Class Timetable</div>
                <div className="text-xs text-slate-400 mt-0.5">Interactive schedule with room numbers</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-semibold text-white text-sm">Digital Student ID</div>
                <div className="text-xs text-slate-400 mt-0.5">Interactive smart ID card with QR verification</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                NAAC A++ Accredited
              </span>
              <span>•</span>
              <span>NIRF Ranked Top 20</span>
              <span>•</span>
              <span>ISO 9001:2015 Certified</span>
            </div>
          </div>

          {/* Right Login Card (6 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 relative">
              
              {/* University Header */}
              <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-700/60">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-black text-xl">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white tracking-tight">Apex University</h2>
                  <p className="text-xs text-slate-400">Student Self-Service Portal Login</p>
                </div>
              </div>

              {/* Demo Credentials Callout Box */}
              <div className="mb-6 p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Required Demo Login:
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickDemoFill}
                    className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    1-Click Auto Fill
                  </button>
                </div>
                <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg font-mono text-[11px] text-slate-300">
                  <span>User ID: <strong className="text-amber-300">1212</strong></span>
                  <span>Password: <strong className="text-amber-300">1212</strong></span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student User ID / Roll Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="Enter 1212"
                      autoComplete="username"
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Portal Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter 1212"
                      autoComplete="current-password"
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-slate-500">v4.8.2 Secure</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating Student...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Student Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Support & Security Notice */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit SSL Encrypted ERP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>IT Helpdesk</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-xs text-center text-slate-500 bg-slate-950/60">
        <p>© 2026 Apex University. All rights reserved. Managed by University ICT & Systems Directorate.</p>
      </footer>

      {/* Help / Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Student Portal Access Assistance</h3>
                <p className="text-xs text-slate-400">Quick credentials & IT support</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-800/60">
                <div className="font-semibold text-indigo-300 mb-1">Dummy Login Credentials:</div>
                <div className="text-slate-300">User ID: <strong className="font-mono text-white">1212</strong></div>
                <div className="text-slate-300">Password: <strong className="font-mono text-white">1212</strong></div>
              </div>

              <p>
                In the university production portal, your default user ID is your University Roll Number (e.g. 22BCSE1212), and your initial password was sent to your registered college email.
              </p>
              <p>
                For official password resets, contact the <strong>ICT Cell, Room 104, Admin Block</strong> or email <strong>helpdesk@apexuniversity.edu.in</strong> with your student ID photo.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  handleQuickDemoFill();
                  setShowForgotModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Auto-fill 1212 & Close
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
