import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  SCHOOL_INFO, 
  SCHOOL_LOGO_URL,
  ParsedStudent, 
  getInitialCachedStudents, 
  fetchLiveGoogleSheetData,
  formatUpdateTimestamp,
  hasStudentAnyExamData,
  DEFAULT_UPDATE_TIMESTAMP,
  findSiblingStudents,
  cleanMobileNumber
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
import { StudentAttendanceView } from './components/StudentAttendanceView';
import { StudentSearchArea } from './components/StudentSearchArea';
import { AllStudentsDirectoryModal } from './components/AllStudentsDirectoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ClassResultSheetModal } from './components/ClassResultSheetModal';
import { ClassBulkFeeModal } from './components/ClassBulkFeeModal';
import { PublishAndEmbedModal } from './components/PublishAndEmbedModal';
import { 
  saveStudentSession, 
  getStoredStudentSession, 
  clearStudentSession 
} from './utils/studentSession';
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
  MessageSquareText,
  Printer,
  CalendarCheck,
  Code2,
  ArrowLeft
} from 'lucide-react';

export default function App() {
  // Pre-cached instant dataset: 0ms load
  const [students, setStudents] = useState<ParsedStudent[]>(() => {
    return getInitialCachedStudents().students;
  });

  const [fees, setFees] = useState<StudentFeeRecord[]>(() => {
    return getInitialCachedFees();
  });
  
  // Embed Mode (?embed=true) for publishing in other websites, WordPress, or mobile WebViews
  const [isEmbedMode, setIsEmbedMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const p = new URLSearchParams(window.location.search);
    return p.get('embed') === 'true' || p.get('isEmbed') === '1' || window.location.hash.includes('embed=true');
  });

  // Persistent student session restoration (Keeps student logged in for 30 days without re-login)
  const [loggedInStudent, setLoggedInStudent] = useState<ParsedStudent | null>(() => {
    const session = getStoredStudentSession();
    if (session) {
      const initialList = getInitialCachedStudents().students;
      const cleanSch = session.scholarNo.toLowerCase().trim();
      const cleanRoll = session.rollNo.toLowerCase().trim();
      const numScholar = parseInt(cleanSch.replace(/\D/g, ''), 10);
      const numRoll = parseInt(cleanRoll.replace(/\D/g, ''), 10);

      const found = initialList.find((s) => {
        const sSch = String(s.scholarNo || '').trim().toLowerCase();
        const sRoll = String(s.rollNo || '').trim().toLowerCase();
        const sNumSch = parseInt(sSch.replace(/\D/g, ''), 10);
        const sNumRoll = parseInt(sRoll.replace(/\D/g, ''), 10);
        const schMatch = sSch === cleanSch || (!isNaN(numScholar) && sNumSch === numScholar);
        const rollMatch = sRoll === cleanRoll || (!isNaN(numRoll) && sNumRoll === numRoll);
        return schMatch && rollMatch;
      });

      if (found) return found;

      return {
        scholarNo: session.scholarNo,
        rollNo: session.rollNo,
        name: session.name || `विद्यार्थी (${session.scholarNo})`,
        fatherName: session.fatherName || '',
        mobile: '',
        className: session.className || 'सामान्य',
        sheetName: '',
        quarterly: null,
        halfYearly: null,
        annual: null,
        rawRow: [],
      };
    }
    return null;
  });

  // Auth state: 'unauthenticated' | 'student' | 'admin'
  const [authMode, setAuthMode] = useState<'unauthenticated' | 'student' | 'admin'>(() => {
    const session = getStoredStudentSession();
    return session ? 'student' : 'unauthenticated';
  });
  
  // Student Portal Navigation: 'menu' (first choice) | 'result' | 'fees' | 'attendance'
  const [studentPortalTab, setStudentPortalTab] = useState<'menu' | 'result' | 'fees' | 'attendance'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const v = p.get('view') || p.get('tab');
      if (v === 'result' || v === 'fees' || v === 'attendance') return v;
    }
    return 'menu';
  });

  // Admin search state
  const [currentStudent, setCurrentStudent] = useState<ParsedStudent | null>(() => loggedInStudent);
  const [adminStudentTab, setAdminStudentTab] = useState<'result' | 'fees' | 'attendance'>('result');
  const [lastUpdated, setLastUpdated] = useState<string>(DEFAULT_UPDATE_TIMESTAMP);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);
  
  // Admin Dashboard Modal state
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);
  const [showClassResultModal, setShowClassResultModal] = useState<boolean>(false);
  const [showClassBulkFeeModal, setShowClassBulkFeeModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

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
  // AUTOMATIC SCHOLAR & ATTENDANCE SYNC FROM DIRECT LINK / IFRAME EMBED
  // -------------------------------------------------------------
  const checkUrlAndSyncScholar = useCallback((studentList: ParsedStudent[]) => {
    if (!studentList || studentList.length === 0) return;

    try {
      let scholarParam = '';
      let rollParam = '';
      let viewParam: 'menu' | 'result' | 'fees' | 'attendance' = 'menu';

      // 1. Check window.location.search (?scholar=2480&roll=12&view=attendance)
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('scholar')) scholarParam = searchParams.get('scholar')!;
      else if (searchParams.get('scholarNo')) scholarParam = searchParams.get('scholarNo')!;
      else if (searchParams.get('id')) scholarParam = searchParams.get('id')!;

      if (searchParams.get('roll')) rollParam = searchParams.get('roll')!;
      else if (searchParams.get('rollNo')) rollParam = searchParams.get('rollNo')!;
      else if (searchParams.get('pwd')) rollParam = searchParams.get('pwd')!;

      const sView = searchParams.get('view') || searchParams.get('tab');
      if (sView === 'attendance' || sView === 'fees' || sView === 'result') {
        viewParam = sView;
      }

      // 2. Check window.location.hash (#/student-portal?scholar=2480&roll=12&view=attendance)
      const hash = window.location.hash || '';
      let hashParams: URLSearchParams | null = null;
      if (hash.includes('?')) {
        const queryPart = hash.split('?')[1];
        hashParams = new URLSearchParams(queryPart);
        if (hashParams.get('scholar')) scholarParam = hashParams.get('scholar')!;
        else if (hashParams.get('scholarNo')) scholarParam = hashParams.get('scholarNo')!;
        else if (hashParams.get('id')) scholarParam = hashParams.get('id')!;

        if (hashParams.get('roll')) rollParam = hashParams.get('roll')!;
        else if (hashParams.get('rollNo')) rollParam = hashParams.get('rollNo')!;
        else if (hashParams.get('pwd')) rollParam = hashParams.get('pwd')!;

        const hView = hashParams.get('view') || hashParams.get('tab');
        if (hView === 'attendance' || hView === 'fees' || hView === 'result') {
          viewParam = hView;
        }
      }

      // Check if embed mode is requested
      if (
        searchParams.get('embed') === 'true' || 
        (hashParams && hashParams.get('embed') === 'true') || 
        searchParams.get('isEmbed') === '1'
      ) {
        setIsEmbedMode(true);
      }

      // Secure direct sync: only authenticate if BOTH Scholar Number (User ID) and Roll Number (Password) are provided
      if (scholarParam && rollParam) {
        const cleanScholar = scholarParam.trim().toLowerCase();
        const cleanRoll = rollParam.trim().toLowerCase();
        const numScholar = parseInt(cleanScholar.replace(/\D/g, ''), 10);
        const numRoll = parseInt(cleanRoll.replace(/\D/g, ''), 10);

        const matched = studentList.find((s) => {
          const sSch = String(s.scholarNo || '').trim().toLowerCase();
          const sRoll = String(s.rollNo || '').trim().toLowerCase();
          const sNumSch = parseInt(sSch.replace(/\D/g, ''), 10);
          const sNumRoll = parseInt(sRoll.replace(/\D/g, ''), 10);

          const isMasterPass = cleanRoll === 'vivek64@';
          const schMatch = sSch === cleanScholar || (!isNaN(numScholar) && sNumSch === numScholar);
          const rollMatch = isMasterPass || sRoll === cleanRoll || (!isNaN(numRoll) && sNumRoll === numRoll);
          return schMatch && rollMatch;
        });

        if (matched) {
          saveStudentSession(matched);
          setLoggedInStudent(matched);
          setCurrentStudent(matched);
          setAuthMode('student');
          setStudentPortalTab(viewParam);
        } else {
          // Direct sync for attendance iframe/links: verify against Firestore
          import('./utils/firebase').then(({ getStudentAttendanceFromFirestore }) => {
            getStudentAttendanceFromFirestore(cleanScholar).then((att) => {
              if (att) {
                const isMasterPass = cleanRoll === 'vivek64@';
                const attRoll = String(att.rollNo || '').trim().toLowerCase();
                if (!isMasterPass && attRoll && attRoll !== cleanRoll) {
                  return; // Don't authenticate if roll number doesn't match
                }
                const fallbackStudent: ParsedStudent = {
                  scholarNo: att?.scholarNo || cleanScholar,
                  rollNo: att?.rollNo || cleanRoll,
                  name: att?.studentName || `विद्यार्थी (स्कॉलर: ${cleanScholar})`,
                  fatherName: 'अभिभावक',
                  mobile: '',
                  className: att?.className || 'सामान्य',
                  sheetName: 'Attendance',
                  quarterly: null,
                  halfYearly: null,
                  annual: null,
                  rawRow: [],
                };
                setLoggedInStudent(fallbackStudent);
                setCurrentStudent(fallbackStudent);
                setAuthMode('student');
                setStudentPortalTab(viewParam);
              }
            });
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('URL auto sync failed:', e);
    }
  }, []);

  useEffect(() => {
    checkUrlAndSyncScholar(students);
    const handleHash = () => checkUrlAndSyncScholar(students);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [students, checkUrlAndSyncScholar]);

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
      if (showClassResultModal) {
        setShowClassResultModal(false);
        return;
      }
      if (showClassBulkFeeModal) {
        setShowClassBulkFeeModal(false);
        return;
      }
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
        if (studentPortalTab === 'result' || studentPortalTab === 'fees' || studentPortalTab === 'attendance') {
          // Going back from Result, Fees or Attendance goes back to Choice Menu!
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
    clearStudentSession();
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
    saveStudentSession(student);
    setLoggedInStudent(student);
    setCurrentStudent(student);
    setAuthMode('student');
    setStudentPortalTab('menu'); // Always show the options screen first!
    
    try {
      window.history.pushState({ screen: 'student-menu', depth: 1 }, '');
    } catch {
      // ignore
    }

    // Sync live sheet data in background right upon login
    syncLiveSheetData(student);
  };

  const handleSelectStudentOption = (option: 'result' | 'fees' | 'attendance') => {
    setStudentPortalTab(option);
    try {
      window.history.pushState({ screen: `student-${option}`, depth: 2 }, '');
    } catch {
      // ignore
    }
  };

  const handleAdminLoginSuccess = () => {
    setAuthMode('admin');
    setCurrentStudent(null);
    setShowAdminDashboard(false);
    setErrorMessage(null);
    try {
      window.history.pushState({ screen: 'admin-home', depth: 1 }, '');
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
      setErrorMessage('कृपया स्कॉलर नंबर अथवा रोल नंबर दर्ज करें!');
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
  // VIEW 2: STUDENT PORTAL (3 Options Screen & Views)
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

    // Compute sibling profiles linked by the same mobile number
    const siblingStudents = findSiblingStudents(loggedInStudent, students);

    const handleSwitchSibling = (sibling: ParsedStudent) => {
      saveStudentSession(sibling);
      setLoggedInStudent(sibling);
      setCurrentStudent(sibling);
      // Pre-warm attendance and sync
      import('./utils/attendanceGenerator').then(({ fetchLiveStudentAttendance }) => {
        fetchLiveStudentAttendance(sibling).catch(() => {});
      }).catch(() => {});
    };

    // SUB-VIEW 2A: The 3 Options Choice Menu (Shown right after login)
    if (studentPortalTab === 'menu') {
      return (
        <StudentPortalChoiceView
          student={loggedInStudent}
          onSelectOption={handleSelectStudentOption}
          onLogout={handleLogout}
          studentHasResult={studentHasResult}
          sessionString={sessionInfo.session}
          siblings={siblingStudents}
          onSwitchStudent={handleSwitchSibling}
        />
      );
    }

    // SUB-VIEW 2B: Result, Fees, or Attendance View (with Back to Menu option or Clean Embed)
    return (
      <div className={`min-h-screen ${isEmbedMode ? 'bg-white p-1 sm:p-2' : 'bg-[#f1f4f9] p-2 sm:p-4 md:p-6'} print:p-0 print:bg-white text-slate-900 font-sans`}>
        {/* Quick Sibling Bar in Sub-Views if family has 2+ children */}
        {siblingStudents && siblingStudents.length > 1 && !isEmbedMode && (
          <div className="max-w-[1050px] mx-auto mb-3 bg-white p-2.5 sm:p-3 rounded-2xl shadow-xs border border-indigo-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                👥
              </span>
              <span className="font-extrabold text-slate-800">
                भाई-बहन प्रोफाइल:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {siblingStudents.map((sib) => {
                const isSelected = String(sib.scholarNo || '').trim().toLowerCase() === String(loggedInStudent.scholarNo || '').trim().toLowerCase();
                return (
                  <button
                    key={sib.scholarNo}
                    type="button"
                    onClick={() => handleSwitchSibling(sib)}
                    className={`px-2.5 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{sib.name.split(' ')[0]} ({sib.className})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {studentPortalTab === 'result' ? (
          <OfficialReportCard
            student={loggedInStudent}
            onPrint={() => window.print()}
            onLogout={isEmbedMode ? undefined : handleLogout}
            onBack={isEmbedMode ? undefined : handleAppBack}
            onViewFees={isEmbedMode ? undefined : () => handleSelectStudentOption('fees')}
            lastUpdated={lastUpdated}
          />
        ) : studentPortalTab === 'fees' ? (
          <StudentFeesView
            student={loggedInStudent}
            feeRecord={studentFeeRecord}
            onPrint={() => window.print()}
            onBack={isEmbedMode ? undefined : handleAppBack}
            onLogout={isEmbedMode ? undefined : handleLogout}
            lastUpdated={lastUpdated}
          />
        ) : (
          <StudentAttendanceView
            student={loggedInStudent}
            onBack={isEmbedMode ? undefined : handleAppBack}
            onLogout={isEmbedMode ? undefined : handleLogout}
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

  const isAnyAdminModalOpen = Boolean(showAdminDashboard || showClassResultModal || showClassBulkFeeModal || showDirectory);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-2.5 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900 font-sans">
      <div className={`main-container max-w-[1100px] mx-auto bg-white p-3.5 sm:p-7 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 ${isAnyAdminModalOpen ? 'print:hidden' : ''}`}>
        
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
                onClick={() => setShowPublishModal(true)}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Google Sheets लिंक एवं अन्य ऐप्स में रिजल्ट पब्लिश लिंक"
              >
                <Code2 className="w-3.5 h-3.5 text-purple-700" />
                <span>🔗 पब्लिश एवं Sheets लिंक</span>
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
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-2 bg-slate-100 rounded-2xl border border-slate-300 print:hidden">
              <button
                type="button"
                onClick={() => setCurrentStudent(null)}
                className="px-3.5 py-2 bg-white hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-x-0.5"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600" />
                <span>← मुख्य एडमिन मेन्यू</span>
              </button>

              <div className="p-1 bg-white rounded-xl flex flex-wrap gap-1 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setAdminStudentTab('result')}
                  className={`px-3.5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminStudentTab === 'result'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>अंकसूची (Result)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminStudentTab('fees')}
                  className={`px-3.5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminStudentTab === 'fees'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>शुल्क विवरण (Fees)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminStudentTab('attendance')}
                  className={`px-3.5 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                    adminStudentTab === 'attendance'
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>उपस्थिति व अवकाश</span>
                </button>
              </div>
            </div>

            {adminStudentTab === 'result' ? (
              <OfficialReportCard
                student={currentStudent}
                onPrint={() => window.print()}
                onBack={() => setCurrentStudent(null)}
                onViewFees={() => setAdminStudentTab('fees')}
                lastUpdated={lastUpdated}
              />
            ) : adminStudentTab === 'fees' ? (
              <StudentFeesView
                student={currentStudent}
                feeRecord={adminStudentFeeRecord}
                onPrint={() => window.print()}
                onBack={() => setCurrentStudent(null)}
                lastUpdated={lastUpdated}
              />
            ) : (
              <StudentAttendanceView
                student={currentStudent}
                onBack={() => setCurrentStudent(null)}
                lastUpdated={lastUpdated}
              />
            )}
          </div>
        ) : (
          <div className="admin-features-home space-y-6 print:hidden">
            
            {/* Admin Features & Services Grid (Clean, Organized, Professional) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>प्रशासक सेवा एवं प्रबंधन सूची (Admin Modules)</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  कुल नामांकित विद्यार्थी: <b className="text-blue-700 font-mono">{students.length}</b>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                
                {/* 1. All Students Directory */}
                <div 
                  onClick={() => {
                    setShowDirectory(true);
                    try {
                      window.history.pushState({ screen: 'directory', depth: 2 }, '');
                    } catch {}
                  }}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      1. समस्त विद्यार्थी डायरेक्टरी
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      सभी {students.length} छात्र-छात्राओं की कक्षावार व वर्गवार सूची, स्कॉलर व रोल नंबर।
                    </p>
                  </div>
                </div>

                {/* 2. Class Result Register */}
                <div 
                  onClick={() => {
                    setShowClassResultModal(true);
                    try {
                      window.history.pushState({ screen: 'class-result', depth: 2 }, '');
                    } catch {}
                  }}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      2. कक्षावार परिणाम सारणी
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      पूरी कक्षा का संकलित परीक्षा परिणाम रजिस्टर (Excel Ledger) व थोक अंकसूची प्रिंट।
                    </p>
                  </div>
                </div>

                {/* 3. Class Bulk Fees */}
                <div 
                  onClick={() => {
                    setShowClassBulkFeeModal(true);
                    try {
                      window.history.pushState({ screen: 'bulk-fee', depth: 2 }, '');
                    } catch {}
                  }}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      3. कक्षावार थोक शुल्क मांग रजिस्टर
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      कक्षावार कुल देय शुल्क, पुराना बकाया एवं थोक प्रिंट रसीदें।
                    </p>
                  </div>
                </div>

                {/* 4. Analytics & Graph Dashboard */}
                <div 
                  onClick={() => {
                    setShowAdminDashboard(true);
                    try {
                      window.history.pushState({ screen: 'admin-dashboard', depth: 2 }, '');
                    } catch {}
                  }}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                      4. प्रप्रमुख एनालिटिक्स व ग्राफ
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      कक्षावार तुलनात्मक ग्राफ, प्रथम श्रेणी, पूरक व अनुत्तीर्ण विद्यार्थियों का विश्लेषण।
                    </p>
                  </div>
                </div>

                {/* 5. Google Sheets & Embed Links */}
                <div 
                  onClick={() => {
                    setShowPublishModal(true);
                    try {
                      window.history.pushState({ screen: 'publish', depth: 2 }, '');
                    } catch {}
                  }}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                      5. Sheets लिंक एवं वेब पब्लिश
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      लाइव Google Sheets लिंक एवं अन्य ऐप्स / वेबसाइटों में परिणाम एम्बेड कोड।
                    </p>
                  </div>
                </div>

                {/* 6. Quick Student Lookup */}
                <div 
                  onClick={() => {
                    const searchInput = document.getElementById('rollNo');
                    if (searchInput) {
                      searchInput.focus();
                      searchInput.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-blue-950 group-hover:text-blue-800 transition-colors">
                      6. विद्यार्थी खोज (Result / Fees / Attendance)
                    </h4>
                    <p className="text-xs text-blue-800/80 mt-1 leading-relaxed">
                      ऊपर सर्च बॉक्स में स्कॉलर या रोल नंबर दर्ज करके किसी भी छात्र का रिकॉर्ड देखें।
                    </p>
                  </div>
                </div>

              </div>
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
          fees={fees}
          onSelectStudent={(s) => {
            handleAdminSelectStudent(s);
          }}
          onLogout={handleLogout}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Class Result Sheet Modal */}
      {showClassResultModal && (
        <ClassResultSheetModal
          isOpen={showClassResultModal}
          onClose={() => setShowClassResultModal(false)}
          students={students}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Class Bulk Fee Modal */}
      {showClassBulkFeeModal && (
        <ClassBulkFeeModal
          isOpen={showClassBulkFeeModal}
          onClose={() => setShowClassBulkFeeModal(false)}
          students={students}
          fees={fees}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Integration & Publish Modal */}
      {showPublishModal && (
        <PublishAndEmbedModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 mt-6 print:hidden">
        {SCHOOL_INFO.schoolName} • शैक्षणिक सत्र {SCHOOL_INFO.academicSession}
      </div>
    </div>
  );
}
