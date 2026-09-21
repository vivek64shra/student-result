import React, { useState, useEffect } from 'react';
import { 
  SCHOOL_INFO, 
  SCHOOL_LOGO_URL,
  ParsedStudent, 
  getInitialCachedStudents, 
  fetchLiveGoogleSheetData 
} from './utils/reportCardParser';
import { LoginPage } from './components/LoginPage';
import { OfficialReportCard } from './components/OfficialReportCard';
import { StudentSearchArea } from './components/StudentSearchArea';
import { AllStudentsDirectoryModal } from './components/AllStudentsDirectoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { GraduationCap, AlertCircle, Users, BarChart3, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<ParsedStudent[]>(() => {
    return getInitialCachedStudents().students;
  });
  
  // Auth state: 'unauthenticated' | 'student' | 'admin'
  const [authMode, setAuthMode] = useState<'unauthenticated' | 'student' | 'admin'>('unauthenticated');
  const [loggedInStudent, setLoggedInStudent] = useState<ParsedStudent | null>(null);
  
  // Admin search state
  const [currentStudent, setCurrentStudent] = useState<ParsedStudent | null>(null);
  const [loadStatus, setLoadStatus] = useState<string>('Google Sheets se Data Load ho raha hai...');
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(true);
  const [isLiveSuccess, setIsLiveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);
  
  // Admin Dashboard Modal state
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // Sync with live Google Sheets
  const syncLiveSheetData = async () => {
    setIsLiveLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchLiveGoogleSheetData();
      if (result.students && result.students.length > 0) {
        setStudents(result.students);
        setIsLiveSuccess(true);
        setLoadStatus(`सफलतापूर्वक ${result.students.length} विद्यार्थियों का रिकॉर्ड सिंक हुआ`);
      } else {
        setIsLiveSuccess(true);
        setLoadStatus('डेटा तैयार है');
      }
    } catch (err: any) {
      console.warn('Google Sheets live fetch warning, using cached data:', err.message);
      setIsLiveLoading(false);
      setIsLiveSuccess(true);
      setLoadStatus(`लोकल डेटा तैयार है (${students.length} रिकॉर्ड्स)`);
    } finally {
      setIsLiveLoading(false);
    }
  };

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
  };

  const handleStudentLoginSuccess = (student: ParsedStudent) => {
    setLoggedInStudent(student);
    setCurrentStudent(student);
    setAuthMode('student');
  };

  const handleAdminLoginSuccess = () => {
    setAuthMode('admin');
    setShowAdminDashboard(true);
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
        const marksheetElem = document.getElementById('marksheet');
        if (marksheetElem) {
          marksheetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      setErrorMessage('रिकॉर्ड नहीं मिला! कृपया सही स्कॉलर नंबर अथवा रोल नंबर दर्ज करें।');
    }
  };

  // ==========================================
  // VIEW 1: LOGIN PAGE FIRST (If Unauthenticated)
  // ==========================================
  if (authMode === 'unauthenticated') {
    return (
      <LoginPage
        students={students}
        onAdminLoginSuccess={handleAdminLoginSuccess}
        onStudentLoginSuccess={handleStudentLoginSuccess}
        statusText={loadStatus}
        isLiveLoading={isLiveLoading}
      />
    );
  }

  // ==========================================
  // VIEW 2: STUDENT PORTAL (Single Student View)
  // ==========================================
  if (authMode === 'student' && loggedInStudent) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] p-2 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900">
        <div className="max-w-[1100px] mx-auto mb-4 print:hidden">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a73e8]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">विद्यार्थी सत्र (Student Portal)</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-900">
                  {loggedInStudent.name} • कक्षा {loggedInStudent.className}
                </div>
              </div>
            </div>

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

        {/* Student's Official Report Card */}
        <OfficialReportCard
          student={loggedInStudent}
          onPrint={() => window.print()}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN & PRAMUKH PORTAL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f0f2f5] p-2 sm:p-4 md:p-6 print:p-0 print:bg-white text-slate-900">
      <div className="main-container max-w-[1100px] mx-auto bg-white p-4 sm:p-7 rounded-2xl shadow-xl border border-slate-200/90 print:shadow-none print:border-none print:p-0">
        
        {/* Official School Header with Admin Status */}
        <div className="school-header text-center border-b-4 border-[#1a73e8] pb-5 mb-6 print:hidden relative">
          
          {/* Top Admin Quick Bar */}
          <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रशासक सत्र (Admin: Vivek@)</span>
              </span>
              <span className="hidden sm:inline text-slate-500 font-medium">
                • {SCHOOL_INFO.schoolName}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 p-1 rounded-full bg-white border-2 border-amber-500/80 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={SCHOOL_LOGO_URL}
                alt="Maa Durga School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="school-name text-xl sm:text-2xl md:text-3xl font-extrabold text-[#d93025] leading-snug drop-shadow-xs">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                सत्र: {SCHOOL_INFO.academicSession} | मान्यता प्राप्त शिक्षा संस्थान
              </p>
            </div>
          </div>

          <div className="school-codes text-xs sm:text-sm md:text-base font-bold text-slate-800 flex flex-wrap items-center justify-center gap-4 sm:gap-12 bg-slate-50 py-2 px-5 rounded-lg border border-slate-200 max-w-xl mx-auto">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-normal">डाइसकोड:</span>
              <span className="font-mono text-slate-900">{SCHOOL_INFO.diceCode}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-normal">संस्था कोड:</span>
              <span className="font-mono text-slate-900">{SCHOOL_INFO.institutionCode}</span>
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
          statusText={loadStatus}
          isLiveLoading={isLiveLoading}
          isLiveSuccess={isLiveSuccess}
          onRefreshLive={syncLiveSheetData}
          allStudents={students}
          onOpenDirectory={() => setShowDirectory(true)}
          onOpenAdminLogin={() => setShowAdminDashboard(true)}
          isAdminLoggedIn={true}
        />

        {/* Error notification if search fails */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between animate-fadeIn print:hidden">
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

        {/* Marksheet Display */}
        {currentStudent ? (
          <OfficialReportCard
            student={currentStudent}
            onPrint={() => window.print()}
          />
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 sm:p-14 text-center bg-slate-50/60 print:hidden">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1a73e8] mx-auto flex items-center justify-center mb-3 shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
              स्कॉलर नंबर अथवा रोल नंबर दर्ज करें
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              ऊपर दिए गए सर्च बॉक्स में किसी भी कक्षा (LKG से 12वीं तक) के विद्यार्थी का स्कॉलर नंबर अथवा रोल नंबर डालकर <b>RESULT DEKHEIN</b> पर क्लिक करें।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDirectory(true)}
                className="px-6 py-2.5 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>सभी {students.length} विद्यार्थी डायरेक्टरी देखें</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAdminDashboard(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
        />
      )}

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 mt-6 print:hidden">
        {SCHOOL_INFO.schoolName} • शैक्षणिक सत्र {SCHOOL_INFO.academicSession}
      </div>
    </div>
  );
}

