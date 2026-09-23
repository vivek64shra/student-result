import React, { useState, useEffect } from 'react';
import { 
  SCHOOL_INFO, 
  SCHOOL_LOGO_URL,
  ParsedStudent, 
  getInitialCachedStudents, 
  fetchLiveGoogleSheetData,
  formatUpdateTimestamp,
  hasStudentAnyExamData,
  DEFAULT_UPDATE_TIMESTAMP
} from './utils/reportCardParser';
import {
  StudentFeeRecord,
  getInitialCachedFees,
  fetchLiveFeesData,
  findStudentFeeRecord,
  getAcademicSessionInfo
} from './utils/feesParser';
import { LoginPage, MAIN_SCHOOL_WEBSITE_URL } from './components/LoginPage';
import { OfficialReportCard } from './components/OfficialReportCard';
import { StudentFeesView } from './components/StudentFeesView';
import { StudentSearchArea } from './components/StudentSearchArea';
import { AllStudentsDirectoryModal } from './components/AllStudentsDirectoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { 
  GraduationCap, 
  AlertCircle, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  Calendar,
  CreditCard,
  Award,
  ArrowRight,
  Sparkles,
  ReceiptText,
  FileCheck2,
  PhoneCall,
  Globe,
  ExternalLink,
  MessageSquareText
} from 'lucide-react';

export default function App() {
  // Pre-cached instant dataset: 0ms load
  const [students, setStudents] = useState<ParsedStudent[]>(() => {
    return getInitialCachedStudents().students;
  });

  const [fees, setFees] = useState<StudentFeeRecord[]>(() => {
    return getInitialCachedFees();
  });
  
  // Auth state: 'unauthenticated' | 'student' | 'admin'
  const [authMode, setAuthMode] = useState<'unauthenticated' | 'student' | 'admin'>('unauthenticated');
  const [loggedInStudent, setLoggedInStudent] = useState<ParsedStudent | null>(null);
  
  // Student Portal Navigation: 'menu' (first) | 'result' | 'fees'
  const [studentPortalTab, setStudentPortalTab] = useState<'menu' | 'result' | 'fees'>('menu');

  // Admin search state
  const [currentStudent, setCurrentStudent] = useState<ParsedStudent | null>(null);
  const [adminStudentTab, setAdminStudentTab] = useState<'result' | 'fees'>('result');
  const [lastUpdated, setLastUpdated] = useState<string>(DEFAULT_UPDATE_TIMESTAMP);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);
  
  // Admin Dashboard Modal state
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // Synchronize Google Sheets and Fees data
  const syncLiveSheetData = async (
    targetStudent?: ParsedStudent
  ): Promise<{ students: ParsedStudent[]; fees: StudentFeeRecord[] } | null> => {
    try {
      const [resultData, feeData] = await Promise.allSettled([
        fetchLiveGoogleSheetData(),
        fetchLiveFeesData()
      ]);

      let freshStudents = students;
      let freshFees = fees;

      if (resultData.status === 'fulfilled' && resultData.value?.students?.length > 0) {
        freshStudents = resultData.value.students;
        setStudents(freshStudents);
        setLastUpdated(formatUpdateTimestamp(new Date()));

        const studentToMatch = targetStudent || loggedInStudent;
        if (studentToMatch) {
          const refreshed = freshStudents.find(
            (s) => s.scholarNo === studentToMatch.scholarNo || s.rollNo === studentToMatch.rollNo
          );
          if (refreshed) {
            setLoggedInStudent(refreshed);
            setCurrentStudent(refreshed);
          }
        }
      }

      if (feeData.status === 'fulfilled' && feeData.value?.length > 0) {
        freshFees = feeData.value;
        setFees(freshFees);
      }

      return { students: freshStudents, fees: freshFees };
    } catch (err: any) {
      console.warn('Live sync completed/handled:', err.message);
      return null;
    }
  };

  // Pre-fetch live data in background immediately upon mount so students can login instantly
  useEffect(() => {
    syncLiveSheetData();
  }, []);

  const handleLogout = () => {
    setAuthMode('unauthenticated');
    setLoggedInStudent(null);
    setCurrentStudent(null);
    setShowAdminDashboard(false);
    setShowDirectory(false);
    setShowAdminLogin(false);
    setStudentPortalTab('menu');
  };

  const handleStudentLoginSuccess = async (student: ParsedStudent) => {
    setLoggedInStudent(student);
    setCurrentStudent(student);
    setAuthMode('student');
    setStudentPortalTab('menu'); // Always show the 2 options screen first!

    // Sync live sheet data in background right upon login
    syncLiveSheetData(student);
  };

  const handleAdminLoginSuccess = () => {
    setAuthMode('admin');
    setShowAdminDashboard(true);
    // Sync live sheet data upon admin login
    syncLiveSheetData();
  };

  // Search logic for Admin
  const handleSearch = (queryId: string) => {
    setErrorMessage(null);
    const cleanId = queryId.trim().toLowerCase();

    if (!cleanId) {
      alert('कृपया स्कॉलर नंबर अथवा रोल नंबर दर्ज करें!');
      return;
    }

    const matched = students.find((s) => {
      const sScholar = s.scholarNo.toLowerCase().trim();
      const sRoll = s.rollNo.toLowerCase().trim();
      const sName = s.name.toLowerCase().trim();
      return (
        sScholar === cleanId ||
        sRoll === cleanId ||
        (cleanId.length >= 4 && sName.includes(cleanId))
      );
    });

    if (matched) {
      setCurrentStudent(matched);
      setTimeout(() => {
        const marksheetElem = document.getElementById('marksheet') || document.getElementById('fee-receipt');
        if (marksheetElem) {
          marksheetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      setErrorMessage('रिकॉर्ड नहीं मिला! कृपया सही स्कॉलर नंबर अथवा रोल नंबर दर्ज करें।');
    }
  };

  // ==========================================
  // VIEW 1: CLEAN HOME / LOGIN PAGE
  // ==========================================
  if (authMode === 'unauthenticated') {
    return (
      <LoginPage
        students={students}
        fees={fees}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onStudentLoginSuccess={handleStudentLoginSuccess}
        onSyncLiveData={syncLiveSheetData}
        lastUpdated={lastUpdated}
      />
    );
  }

  // ==========================================
  // VIEW 2: STUDENT PORTAL (2 Options Screen & Views)
  // ==========================================
  if (authMode === 'student' && loggedInStudent) {
    const studentFeeRecord = findStudentFeeRecord(
      fees,
      loggedInStudent.scholarNo,
      loggedInStudent.rollNo,
      loggedInStudent.name
    );
    const sessionInfo = getAcademicSessionInfo();
    const studentHasResult = hasStudentAnyExamData(loggedInStudent);

    // SUB-VIEW 2A: The 2 Options Choice Menu (Shown right after login)
    if (studentPortalTab === 'menu') {
      return (
        <div className="min-h-screen bg-[#f1f4f9] p-3 sm:p-6 md:p-8 text-slate-900 font-sans flex flex-col justify-between">
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Top Student Header Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 border-2 border-blue-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={SCHOOL_LOGO_URL}
                    alt="Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-900 text-[11px] font-bold mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>विद्यार्थी सत्र {sessionInfo.session}</span>
                  </div>
                  <h1 className="text-base sm:text-xl font-black text-slate-900 uppercase">
                    {loggedInStudent.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                    कक्षा: <b className="text-slate-900">{loggedInStudent.className}</b> • स्कॉलर: <b className="font-mono text-blue-700">{loggedInStudent.scholarNo}</b> • रोल: <b className="font-mono text-[#d93025]">{loggedInStudent.rollNo}</b>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden print-hidden">
                <a
                  href={MAIN_SCHOOL_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="माँ दुर्गा उ.मा. विद्यालय मुख्य पृष्ठ खोलें"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>मुख्य पृष्ठ ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>लॉगआउट (Logout)</span>
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="text-center mb-6">
              <h2 className="text-lg sm:text-2xl font-black text-slate-900">
                कृपया आप जो देखना चाहते हैं, उस विकल्प पर क्लिक करें:
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                परिणाम अथवा शुल्क विवरण देखने हेतु नीचे दिए गए दो मुख्य विकल्पों में से चुनें
              </p>
            </div>

            {/* The 2 Core Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
              
              {/* Option 1: Result / Marksheet */}
              <div
                onClick={() => setStudentPortalTab('result')}
                role="button"
                tabIndex={0}
                className={`group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50 p-6 sm:p-7 rounded-3xl border-2 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-left ${
                  studentHasResult
                    ? 'border-slate-200 hover:border-[#1a73e8]'
                    : 'border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform ${
                    studentHasResult
                      ? 'bg-blue-50 text-[#1a73e8] border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <Award className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!studentHasResult ? (
                      <span className="text-[11px] font-black px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                        रिजल्ट प्रतीक्षारत
                      </span>
                    ) : (
                      <span className="text-xs font-black px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
                        विकल्प 1
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#1a73e8] transition-colors mb-2 flex items-center gap-2">
                  <span>1. परीक्षा परिणाम (Result)</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {studentHasResult
                    ? 'वार्षिक परीक्षा अंकसूची, विषयवार सैद्धांतिक व प्रोजेक्ट अंक, कुल प्राप्तांक, प्रतिशत एवं आधिकारिक रिपोर्ट कार्ड देखें व प्रिंट करें।'
                    : 'परीक्षा परिणाम अभी पब्लिश (जारी) नहीं हुआ है। परिणाम विवरण देखने के लिए क्लिक करें अथवा नीचे विकल्प 2 से शुल्क देखें।'}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5 text-[11px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">कक्षावार अंकसूची</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">ग्रेड व डिवीजन</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">आधिकारिक सील</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#1a73e8]">
                  <span>{studentHasResult ? 'अंकसूची देखें (View Report Card)' : 'स्थिति देखें (Check Status)'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

              {/* Option 2: Fees Statement */}
              <div
                onClick={() => setStudentPortalTab('fees')}
                role="button"
                tabIndex={0}
                className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/50 p-6 sm:p-7 rounded-3xl border-2 border-emerald-300 hover:border-emerald-600 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 text-left ring-2 ring-emerald-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black px-2.5 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-full">
                      सक्रिय / उपलब्ध
                    </span>
                    <span className="text-xs font-black px-3 py-1 bg-emerald-800 text-white rounded-full">
                      विकल्प 2
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 flex items-center gap-2">
                  <span>2. छात्र शुल्क विवरण (Fees)</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  सत्र {sessionInfo.session} का वार्षिक नवीनीकरण शुल्क, शिक्षण शुल्क किश्तें, वाहन शुल्क एवं <strong>गत वर्ष के पुराने बकाया</strong> का सम्पूर्ण विवरण देखें व रसीद प्रिंट करें।
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5 text-[11px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                    गत वर्ष का बकाया
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 rounded-md">वार्षिक नवीनीकरण शुल्क</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">शिक्षण किश्तें (I-V)</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">वाहन शुल्क</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-extrabold text-emerald-700">
                  <span>शुल्क विवरण देखें (View Fees Statement)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>

            </div>

            {/* School Query / Feedback Card */}
            <div className="p-4 bg-gradient-to-r from-blue-50 via-amber-50/50 to-emerald-50 rounded-2xl border border-slate-200 text-xs text-slate-700 mb-5 print:hidden print-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      किसी भी समस्या या फीडबैक के लिए (For Any Query / Feedback)
                    </div>
                    <p className="text-[11.5px] text-slate-600 mt-0.5">
                      अंकसूची, परिणाम अथवा शुल्क में किसी भी त्रुटि सुधार या जानकारी हेतु फीडबैक भेजें:
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
                    <span>फीडबैक भेजें ↗</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={MAIN_SCHOOL_WEBSITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-300 rounded-xl shadow-2xs transition-all inline-flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>मुख्य पृष्ठ ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* School Office Help Note */}
            <div className="text-center p-3 bg-white/70 rounded-2xl border border-slate-200 text-xs text-slate-600 print:hidden print-hidden">
              <span>किसी भी सहायता अथवा जानकारी हेतु विद्यालय कार्यालय में संपर्क करें।</span>
            </div>

          </div>

          <footer className="text-center text-xs text-slate-500 py-3 mt-4 print:hidden print-hidden">
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              <span>{SCHOOL_INFO.schoolName} • सत्र {sessionInfo.session}</span>
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
    }

    // SUB-VIEW 2B: Result or Fees View (with Back to Menu option)
    return (
      <div className="min-h-screen bg-[#f1f4f9] p-2.5 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900 font-sans">
        {studentPortalTab === 'result' ? (
          <OfficialReportCard
            student={loggedInStudent}
            onPrint={() => window.print()}
            onLogout={handleLogout}
            onBack={() => setStudentPortalTab('menu')}
            onViewFees={() => setStudentPortalTab('fees')}
            lastUpdated={lastUpdated}
          />
        ) : (
          <StudentFeesView
            student={loggedInStudent}
            feeRecord={studentFeeRecord}
            onPrint={() => window.print()}
            onBack={() => setStudentPortalTab('menu')}
            lastUpdated={lastUpdated}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN & PRAMUKH PORTAL
  // ==========================================
  const adminStudentFeeRecord = currentStudent
    ? findStudentFeeRecord(fees, currentStudent.scholarNo, currentStudent.rollNo, currentStudent.name)
    : null;

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-2.5 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900 font-sans">
      <div className="main-container max-w-[1100px] mx-auto bg-white p-3.5 sm:p-7 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Official School Header with Admin Status */}
        <div className="school-header text-center border-b-2 sm:border-b-4 border-[#1a73e8] pb-4 mb-5 print:hidden relative">
          
          {/* Top Admin Quick Bar */}
          <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रशासक सत्र (Admin)</span>
              </span>
              <span className="hidden sm:inline text-slate-500 font-medium">
                • {SCHOOL_INFO.schoolName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={MAIN_SCHOOL_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="मुख्य वेबसाइट"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>मुख्य वेबसाइट ↗</span>
              </a>

              <a
                href={MAIN_SCHOOL_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="फीडबैक / Any Query"
              >
                <MessageSquareText className="w-3.5 h-3.5 text-amber-700" />
                <span>फीडबैक पोर्टल ↗</span>
              </a>

              <button
                type="button"
                onClick={() => setShowAdminDashboard(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>प्रप्रमुख डैशबोर्ड (Graph View)</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>लॉगआउट</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-3">
            <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 p-1 rounded-full bg-white border-2 border-amber-500/80 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={SCHOOL_LOGO_URL}
                alt="Maa Durga School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#d93025] leading-snug drop-shadow-xs">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                सत्र: {SCHOOL_INFO.academicSession} | मान्यता प्राप्त शिक्षा संस्थान
              </p>
            </div>
          </div>

          <div className="school-codes text-xs sm:text-sm font-bold text-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-8 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-200 max-w-xl mx-auto">
            <span className="flex items-center gap-1">
              <span className="text-slate-500 font-normal">डाइसकोड:</span>
              <span className="font-mono text-slate-900">{SCHOOL_INFO.diceCode}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500 font-normal">संस्था कोड:</span>
              <span className="font-mono text-slate-900">{SCHOOL_INFO.institutionCode}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>अद्यतन: <b className="text-slate-900">{lastUpdated}</b></span>
            </span>
          </div>
        </div>

        {/* Search Area */}
        <StudentSearchArea
          onSearch={handleSearch}
          onSelectStudent={(s) => {
            setCurrentStudent(s);
            setErrorMessage(null);
          }}
          lastUpdated={lastUpdated}
          onRefresh={syncLiveSheetData}
          allStudents={students}
          onOpenDirectory={() => setShowDirectory(true)}
          onOpenAdminLogin={() => setShowAdminDashboard(true)}
          isAdminLoggedIn={true}
        />

        {/* Error notification if search fails */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center justify-between animate-fadeIn print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectory(true)}
              className="text-xs font-bold underline cursor-pointer hover:text-red-900"
            >
              सभी विद्यार्थी सूची देखें
            </button>
          </div>
        )}

        {/* When student selected, provide Toggle for Admin: Result vs Fees */}
        {currentStudent ? (
          <div>
            <div className="flex items-center justify-center gap-2 my-4 print:hidden">
              <div className="p-1 bg-slate-200 rounded-xl flex gap-1 border border-slate-300">
                <button
                  type="button"
                  onClick={() => setAdminStudentTab('result')}
                  className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminStudentTab === 'result'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>अंकसूची (Result)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminStudentTab('fees')}
                  className={`px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminStudentTab === 'fees'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>शुल्क विवरण (Fees)</span>
                </button>
              </div>
            </div>

            {adminStudentTab === 'result' ? (
              <OfficialReportCard
                student={currentStudent}
                onPrint={() => window.print()}
                onViewFees={() => setAdminStudentTab('fees')}
                lastUpdated={lastUpdated}
              />
            ) : (
              <StudentFeesView
                student={currentStudent}
                feeRecord={adminStudentFeeRecord}
                onPrint={() => window.print()}
                lastUpdated={lastUpdated}
              />
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-14 text-center bg-slate-50/60 print:hidden">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 text-[#1a73e8] mx-auto flex items-center justify-center mb-3 shadow-inner">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
              स्कॉलर नंबर अथवा रोल नंबर दर्ज करें
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              ऊपर दिए गए सर्च बॉक्स में किसी भी कक्षा (LKG से 12वीं तक) के विद्यार्थी का स्कॉलर नंबर अथवा रोल नंबर डालकर <b>परिणाम एवं शुल्क देखें</b>।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDirectory(true)}
                className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>सभी {students.length} विद्यार्थी डायरेक्टरी</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdminDashboard(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-amber-300" />
                <span>प्रप्रमुख डैशबोर्ड (Graph View)</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* All Students Directory Modal */}
      {showDirectory && (
        <AllStudentsDirectoryModal
          students={students}
          onSelectStudent={(s) => {
            setCurrentStudent(s);
            setErrorMessage(null);
          }}
          onClose={() => setShowDirectory(false)}
        />
      )}

      {/* Admin Login Modal (Secondary fallback) */}
      {showAdminLogin && (
        <AdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={() => {
            setShowAdminLogin(false);
            setShowAdminDashboard(true);
          }}
        />
      )}

      {/* Admin / Pramukh Dashboard Modal with Visual Graphs */}
      {showAdminDashboard && (
        <AdminDashboardModal
          isOpen={showAdminDashboard}
          onClose={() => setShowAdminDashboard(false)}
          students={students}
          onSelectStudent={(s) => {
            setCurrentStudent(s);
            setErrorMessage(null);
          }}
          onLogout={handleLogout}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 mt-6 print:hidden">
        {SCHOOL_INFO.schoolName} • शैक्षणिक सत्र {SCHOOL_INFO.academicSession}
      </div>
    </div>
  );
}
