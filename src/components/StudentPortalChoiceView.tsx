import React from 'react';
import { 
  GraduationCap, 
  CreditCard, 
  Award, 
  ArrowRight, 
  Globe, 
  LogOut, 
  MessageSquareText, 
  ExternalLink,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';
import { MAIN_SCHOOL_WEBSITE_URL } from './LoginPage';

interface StudentPortalChoiceViewProps {
  student: ParsedStudent;
  onSelectOption: (option: 'result' | 'fees' | 'attendance') => void;
  onLogout: () => void;
  studentHasResult: boolean;
  sessionString: string;
}

export const StudentPortalChoiceView: React.FC<StudentPortalChoiceViewProps> = React.memo(({
  student,
  onSelectOption,
  onLogout,
  studentHasResult,
  sessionString,
}) => {
  return (
    <div className="min-h-screen bg-[#f1f4f9] p-3 sm:p-6 md:p-8 text-slate-900 font-sans flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Top Student Header Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-slate-200 mb-5 sm:mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 border-2 border-blue-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              <img
                src={SCHOOL_LOGO_URL}
                alt="School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-900 text-[11px] font-bold mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                <span>विद्यार्थी सत्र {sessionString}</span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 uppercase">
                {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                कक्षा: <b className="text-slate-900">{student.className}</b> • स्कॉलर: <b className="font-mono text-blue-700">{student.scholarNo}</b> • रोल: <b className="font-mono text-[#d93025]">{student.rollNo}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden print-hidden">
            <a
              href={MAIN_SCHOOL_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="माँ दुर्गा उ.मा. विद्यालय मुख्य पृष्ठ"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>मुख्य पृष्ठ ↗</span>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Big Choice Cards Section Header */}
        <div className="text-center mb-5 sm:mb-6">
          <span className="text-xs font-black tracking-wider uppercase bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full border border-amber-300">
            पोर्टल विकल्प चयन (Select Portal Service)
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-2">
            आप क्या देखना चाहते हैं?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
            नीचे दिए गए तीनों आधिकारिक विकल्पों में से अपनी आवश्यकतानुसार विकल्प पर क्लिक करें:
          </p>
        </div>

        {/* 3 Big Action Cards: Marksheet, Fees, and Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6">
          
          {/* Option 1: Academic Marksheet / Result */}
          <div
            onClick={() => onSelectOption('result')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectOption('result')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 p-5 rounded-3xl border-2 border-blue-200 hover:border-[#1a73e8] shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-left ring-2 ring-blue-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a73e8] border border-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  {!studentHasResult ? (
                    <span className="text-[10px] font-black px-2.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-300 rounded-full">
                      रिजल्ट प्रतीक्षारत
                    </span>
                  ) : (
                    <span className="text-xs font-black px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full">
                      विकल्प 1
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#1a73e8] transition-colors mb-1.5 flex items-center gap-2">
                <span>1. परीक्षा परिणाम (Result)</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {studentHasResult
                  ? 'अंकसूची, विषयवार सैद्धांतिक व प्रोजेक्ट अंक, कुल प्राप्तांक, प्रतिशत एवं रिपोर्ट कार्ड देखें व A4 JPG / प्रिंट करें।'
                  : 'परीक्षा परिणाम अभी पब्लिश नहीं हुआ है। स्थिति जांचने के लिए क्लिक करें।'}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4 text-[10.5px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">कक्षावार अंकसूची</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">ग्रेड व डिवीजन</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">JPG / प्रिंट</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#1a73e8]">
              <span>{studentHasResult ? 'अंकसूची देखें' : 'स्थिति जांचें'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Option 2: Fees Statement */}
          <div
            onClick={() => onSelectOption('fees')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectOption('fees')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 p-5 rounded-3xl border-2 border-emerald-300 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-left ring-2 ring-emerald-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full">
                    सक्रिय / उपलब्ध
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 bg-emerald-800 text-white rounded-full">
                    विकल्प 2
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5 flex items-center gap-2">
                <span>2. छात्र शुल्क विवरण (Fees)</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                सत्र {sessionString} का नवीनीकरण शुल्क, शिक्षण शुल्क किश्तें, वाहन शुल्क एवं <strong>गत वर्ष के पुराने बकाया</strong> का विवरण देखें व JPG WhatsApp पर शेयर करें।
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4 text-[10.5px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                  गत वर्ष बकाया
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded-md">सत्र {sessionString}</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">रसीद JPG / प्रिंट</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-700">
              <span>शुल्क विवरण देखें</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Option 3: Student Attendance (NEW - Requested by User) */}
          <div
            onClick={() => onSelectOption('attendance')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectOption('attendance')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/50 p-5 rounded-3xl border-2 border-indigo-200 hover:border-indigo-600 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-left ring-2 ring-indigo-500/20 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-indigo-100 text-indigo-950 border border-indigo-300 rounded-full">
                    अनुपस्थिति विवरण
                  </span>
                  <span className="text-xs font-black px-2.5 py-0.5 bg-indigo-800 text-white rounded-full">
                    विकल्प 3
                  </span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-700 transition-colors mb-1.5 flex items-center gap-2">
                <span>3. अनुपस्थिति विवरण (Absent Log)</span>
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                सत्र के दौरान विद्यार्थी किस-किस दिन अनुपस्थित (Absent) रहा है, उसकी वास्तविक तिथियों का दिनांकवार विवरण देखें व रसीद A4 JPG / प्रिंट करें।
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4 text-[10.5px] font-bold text-slate-600">
                <span className="px-2 py-0.5 bg-red-100 text-red-900 rounded-md">अनुपस्थित तिथियाँ</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded-md">दिनांकवार रिकॉर्ड</span>
                <span className="px-2 py-0.5 bg-slate-100 rounded-md">JPG / प्रिंट</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-indigo-700">
              <span>अनुपस्थिति रिकॉर्ड देखें</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* School Query / Feedback Card */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-50 via-amber-50/50 to-emerald-50 rounded-2xl border border-slate-200 text-xs text-slate-700 mb-4 print:hidden print-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <MessageSquareText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  किसी भी समस्या या फीडबैक के लिए (For Any Query / Feedback)
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-slate-600 mt-0.5">
                  अंकसूची, उपस्थिति अथवा शुल्क में किसी भी त्रुटि सुधार या जानकारी हेतु फीडबैक भेजें:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={MAIN_SCHOOL_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <span>फीडबैक / सहायता दर्ज करें ↗</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* School Office Help Note */}
        <div className="text-center p-2.5 sm:p-3 bg-white/70 rounded-2xl border border-slate-200 text-xs text-slate-600 print:hidden print-hidden">
          <span>डाइस कोड: <b>{SCHOOL_INFO.diceCode}</b> | संस्था कोड: <b>{SCHOOL_INFO.institutionCode}</b> • किसी भी सहायता हेतु विद्यालय कार्यालय में संपर्क करें।</span>
        </div>

      </div>

      <footer className="text-center text-xs text-slate-500 py-3 mt-4 print:hidden print-hidden">
        <p className="flex flex-wrap items-center justify-center gap-1.5">
          <span>{SCHOOL_INFO.schoolName} • सत्र {sessionString}</span>
          <span>•</span>
          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            mdhsss.netlify.app ↗
          </a>
        </p>
      </footer>
    </div>
  );
});
