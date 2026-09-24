import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { StudentPortalChoiceView } from './components/StudentPortalChoiceView';
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
  Globe,
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
  
  // Student Portal Navigation: 'menu' (first choice) | 'result' | 'fees'
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
      console.warn('Live sync completed/handled:', err?.message || err);
      return null;
    }
  };

  // Pre-fetch live data in background immediately upon mount so students can login instantly
  useEffect(() => {
    syncLiveSheetData();
  }, []);

  // -------------------------------------------------------------
  // BROWSER & MOBILE BACK BUTTON HANDLER (Fix website closing on back)
  // -------------------------------------------------------------
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    // Initialize base history state on root load
    if (!window.history.state) {
      window.history.replaceState({ screen: 'login', depth: 0 }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      const target = state?.screen;

      // 1. Modals priority: if any modal is open, back button simply dismisses modal
      if (showDirectory) {
        setShowDirectory(false);
        return;
      }
      if (showAdminDashboard) {
        setShowAdminDashboard(false);
        return;
      }
      if (showAdminLogin) {
        setShowAdminLogin(false);
        return;
      }

      // 2. Student Portal Navigation:
      if (authMode === 'student') {
        if (studentPortalTab === 'result' || studentPortalTab === 'fees') {
          // Going back from Result or Fees goes back to 2-Options Menu!
          setStudentPortalTab('menu');
          return;
        }
        if (studentPortalTab === 'menu') {
          // Going back from Menu returns to Login page cleanly
          setAuthMode('unauthenticated');
          setLoggedInStudent(null);
          setCurrentStudent(null);
          return;
        }
      }

      // 3. Admin Portal Navigation:
      if (authMode === 'admin') {
        if (currentStudent) {
          // Back from student report/fees returns to search
          setCurrentStudent(null);
          return;
        }
        if (target === 'login' || !target) {
          setAuthMode('unauthenticated');
          return;
        }
      }

      // 4. Default state reset
      if (target === 'login') {
        setAuthMode('unauthenticated');
        setLoggedInStudent(null);
        setCurrentStudent(null);
        setStudentPortalTab('menu');
      } else if (target === 'student-menu') {
        setStudentPortalTab('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [authMode, studentPortalTab, currentStudent, showDirectory, showAdminDashboard, showAdminLogin]);

  // Navigate to previous screen smoothly
  const handleAppBack = useCallback(() => {
    if (window.history.state && window.history.state.depth > 0) {
      window.history.back();
    } else {
      // Fallback
      if (authMode === 'student') {
        if (studentPortalTab !== 'menu') {
          setStudentPortalTab('menu');
        } else {
          setAuthMode('unauthenticated');
          setLoggedInStudent(null);
        }
      } else if (authMode === 'admin') {
        if (currentStudent) {
          setCurrentStudent(null);
        } else {
          setAuthMode('unauthenticated');
        }
      }
    }
  }, [authMode, studentPortalTab, currentStudent]);

  const handleLogout = useCallback(() => {
    setAuthMode('unauthenticated');
    setLoggedInStudent(null);
    setCurrentStudent(null);
    setShowAdminDashboard(false);
    setShowDirectory(false);
    setShowAdminLogin(false);
    setStudentPortalTab('menu');
    try {
      window.history.pushState({ screen: 'login', depth: 0 }, '');
    } catch {
      // ignore
    }
  }, []);

  const handleStudentLoginSuccess = async (student: ParsedStudent) => {
    setLoggedInStudent(student);
    setCurrentStudent(student);
    setAuthMode('student');
    setStudentPortalTab('menu'); // Always show the 2 options screen first!
    
    try {
      window.history.pushState({ screen: 'student-menu', depth: 1 }, '');
    } catch {
      // ignore
    }

    // Sync live sheet data in background right upon login
    syncLiveSheetData(student);
  };

  const handleSelectStudentOption = (option: 'result' | 'fees') => {
    setStudentPortalTab(option);
    try {
      window.history.pushState({ screen: `student-${option}`, depth: 2 }, '');
    } catch {
      // ignore
    }
  };

  const handleAdminLoginSuccess = () => {
    setAuthMode('admin');
    setShowAdminDashboard(true);
    try {
      window.history.pushState({ screen: 'admin-search', depth: 1 }, '');
    } catch {
      // ignore
    }
    // Sync live sheet data upon admin login
    syncLiveSheetData();
  };

  const handleAdminSelectStudent = (student: ParsedStudent) => {
    setCurrentStudent(student);
    setErrorMessage(null);
    try {
      window.history.pushState({ screen: 'admin-student-view', depth: 2 }, '');
    } catch {
      // ignore
    }
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
      handleAdminSelectStudent(matched);
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
        <StudentPortalChoiceView
          student={loggedInStudent}
          onSelectOption={handleSelectStudentOption}
          onLogout={handleLogout}
          studentHasResult={studentHasResult}
          sessionString={sessionInfo.session}
        />
      );
    }

    // SUB-VIEW 2B: Result or Fees View (with Back to Menu option)
    return (
      <div className="min-h-screen bg-[#f1f4f9] p-2 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900 font-sans">
        {studentPortalTab === 'result' ? (
          <OfficialReportCard
            student={loggedInStudent}
            onPrint={() => window.print()}
            onLogout={handleLogout}
            onBack={handleAppBack}
            onViewFees={() => handleSelectStudentOption('fees')}
            lastUpdated={lastUpdated}
          />
        ) : (
          <StudentFeesView
            student={loggedInStudent}
            feeRecord={studentFeeRecord}
            onPrint={() => window.print()}
            onBack={handleAppBack}
            onLogout={handleLogout}
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
                onClick={() => {
                  setShowAdminDashboard(true);
                  try {
                    window.history.pushState({ screen: 'admin-dashboard', depth: 2 }, '');
                  } catch {
                    // ignore
                  }
                }}
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
              <span className="text-slate-500 font-normal">डाइस कोड:</span>
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
          onSelectStudent={handleAdminSelectStudent}
          lastUpdated={lastUpdated}
          onRefresh={syncLiveSheetData}
          allStudents={students}
          onOpenDirectory={() => {
            setShowDirectory(true);
            try {
              window.history.pushState({ screen: 'directory', depth: 2 }, '');
            } catch {
              // ignore
            }
          }}
          onOpenAdminLogin={() => {
            setShowAdminDashboard(true);
            try {
              window.history.pushState({ screen: 'admin-dashboard', depth: 2 }, '');
            } catch {
              // ignore
            }
          }}
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
              onClick={() => {
                setShowDirectory(true);
                try {
                  window.history.pushState({ screen: 'directory', depth: 2 }, '');
                } catch {
                  // ignore
                }
              }}
              className="text-xs font-bold underline cursor-pointer hover:text-red-900"
            >
              सभी विद्यार्थी सूची देखें
            </button>
          </div>
        )}

        {/* When student selected, provide Toggle for Admin: Result vs Fees */}
        {currentStudent ? (
          <div>
            <div className="flex items-center justify-end gap-2 mb-3 print:hidden">
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
                onBack={handleAppBack}
                onViewFees={() => setAdminStudentTab('fees')}
                lastUpdated={lastUpdated}
              />
            ) : (
              <StudentFeesView
                student={currentStudent}
                feeRecord={adminStudentFeeRecord}
                onPrint={() => window.print()}
                onBack={handleAppBack}
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
                onClick={() => {
                  setShowDirectory(true);
                  try {
                    window.history.pushState({ screen: 'directory', depth: 2 }, '');
                  } catch {
                    // ignore
                  }
                }}
                className="px-5 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>सभी {students.length} विद्यार्थी डायरेक्टरी</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAdminDashboard(true);
                  try {
                    window.history.pushState({ screen: 'admin-dashboard', depth: 2 }, '');
                  } catch {
                    // ignore
                  }
                }}
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
            handleAdminSelectStudent(s);
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
            handleAdminSelectStudent(s);
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
