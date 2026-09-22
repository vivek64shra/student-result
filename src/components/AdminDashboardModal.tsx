import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  X, 
  Filter, 
  GraduationCap,
  Search, 
  BookOpen, 
  LogOut,
  Sparkles,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Award,
  ChevronRight,
  TrendingDown,
  Printer,
  Eye,
  EyeOff,
  Lightbulb
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, compareClassNames } from '../utils/reportCardParser';
import { fetchAiAcademicRecommendations, generateClientDiagnosticAnalysis } from '../utils/aiAdvisor';
import { AdminOnePagePrintSummary } from './AdminOnePagePrintSummary';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: ParsedStudent[];
  onSelectStudent: (student: ParsedStudent) => void;
  onLogout: () => void;
  lastUpdated?: string;
}

export type GraphViewMode = 'class-comparison' | 'division-breakdown' | 'risk-matrix' | 'subject-index';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
  onLogout,
  lastUpdated,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<'quarterly' | 'halfYearly' | 'annual'>('quarterly');
  const [activeGraphMode, setActiveGraphMode] = useState<GraphViewMode>('class-comparison');
  
  // Anti-Lag: Student details table is hidden by default
  const [showStudentRoster, setShowStudentRoster] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'ALL' | 'FAIL' | 'SUPPL' | 'FIRST'>('ALL');

  // 1-Page Print Summary Modal State
  const [showPrintSummaryModal, setShowPrintSummaryModal] = useState<boolean>(false);

  // AI Recommendation states (Class-Wise on demand)
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiAnalyzedClass, setAiAnalyzedClass] = useState<string>('');
  const [aiSource, setAiSource] = useState<'gemini-3.8-flash' | 'diagnostic-engine'>('diagnostic-engine');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [hasCopiedAi, setHasCopiedAi] = useState<boolean>(false);

  // 1. Group class list
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className || s.sheetName));
    return Array.from(set).sort(compareClassNames);
  }, [students]);

  // 2. Compute aggregate metrics per class
  const classStats = useMemo(() => {
    const statsMap: Record<
      string,
      {
        className: string;
        sheetName: string;
        total: number;
        appeared: number;
        passed: number;
        failed: number;
        suppl: number;
        firstDiv: number;
        avgPercentage: number;
      }
    > = {};

    classList.forEach((cls) => {
      statsMap[cls] = {
        className: cls,
        sheetName: '',
        total: 0,
        appeared: 0,
        passed: 0,
        failed: 0,
        suppl: 0,
        firstDiv: 0,
        avgPercentage: 0,
      };
    });

    students.forEach((s) => {
      const cls = s.className || s.sheetName;
      if (!statsMap[cls]) {
        statsMap[cls] = {
          className: cls,
          sheetName: s.sheetName,
          total: 0,
          appeared: 0,
          passed: 0,
          failed: 0,
          suppl: 0,
          firstDiv: 0,
          avgPercentage: 0,
        };
      }

      statsMap[cls].total++;
      statsMap[cls].sheetName = s.sheetName;

      const examData = s[selectedExam];
      if (examData && examData.rows && examData.rows.length > 0) {
        statsMap[cls].appeared++;
        const per = parseFloat(examData.percentage);
        const validPer = !isNaN(per) ? per : 0;
        statsMap[cls].avgPercentage += validPer;

        const resStr = String(examData.result).toUpperCase();
        const isFirst = resStr.includes('FIRST') || validPer >= 60;
        const isSuppl = resStr.includes('SUPPL');
        const isPass = resStr.includes('PASS') || isFirst || validPer >= 33;

        if (isFirst) statsMap[cls].firstDiv++;
        if (isSuppl) statsMap[cls].suppl++;

        if (isPass && !isSuppl) {
          statsMap[cls].passed++;
        } else {
          statsMap[cls].failed++;
        }
      }
    });

    // Compute averages
    Object.values(statsMap).forEach((st) => {
      if (st.appeared > 0) {
        st.avgPercentage = Number((st.avgPercentage / st.appeared).toFixed(1));
      }
    });

    return Object.values(statsMap);
  }, [students, classList, selectedExam]);

  // Overall totals
  const overallMetrics = useMemo(() => {
    let totalStudents = students.length;
    let totalAppeared = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSuppl = 0;
    let totalFirstDiv = 0;
    let sumPer = 0;

    classStats.forEach((c) => {
      totalAppeared += c.appeared;
      totalPassed += c.passed;
      totalFailed += c.failed;
      totalSuppl += c.suppl;
      totalFirstDiv += c.firstDiv;
      sumPer += c.avgPercentage * c.appeared;
    });

    const passRate = totalAppeared > 0 ? Number(((totalPassed / totalAppeared) * 100).toFixed(1)) : 0;
    const overallAvg = totalAppeared > 0 ? Number((sumPer / totalAppeared).toFixed(1)) : 0;

    return {
      totalStudents,
      totalAppeared,
      totalPassed,
      totalFailed,
      totalSuppl,
      totalFirstDiv,
      passRate,
      overallAvg,
    };
  }, [students, classStats]);

  // 3. Subject-wise detailed metrics (PURE SUBJECT PROGRESS, NO STUDENT NAMES)
  const subjectStats = useMemo(() => {
    const targetStudents = selectedClass === 'ALL'
      ? students
      : students.filter((s) => (s.className || s.sheetName) === selectedClass);

    const subMap: Record<
      string,
      {
        name: string;
        appeared: number;
        sumMarks: number;
        sumTheory: number;
        maxMarks: number;
        theoryMaxMarks: number;
        theoryMinMarks: number;
        passedCount: number;
        failedCount: number;
        highestScore: number;
      }
    > = {};

    targetStudents.forEach((s) => {
      const exam = s[selectedExam];
      if (!exam || !exam.rows) return;

      exam.rows.forEach((row) => {
        const cleanName = row.name.trim();
        if (!cleanName) return;

        if (!subMap[cleanName]) {
          subMap[cleanName] = {
            name: cleanName,
            appeared: 0,
            sumMarks: 0,
            sumTheory: 0,
            maxMarks: row.maxMarks || 100,
            theoryMaxMarks: row.theoryMaxMarks || 80,
            theoryMinMarks: row.theoryMinMarks || 27,
            passedCount: 0,
            failedCount: 0,
            highestScore: 0,
          };
        }

        const numTotal = typeof row.total === 'number' ? row.total : parseFloat(String(row.total));
        const numTheory = typeof row.theory === 'number' ? row.theory : parseFloat(String(row.theory));

        const isAppeared = !isNaN(numTotal) && numTotal >= 0 && String(row.total).toUpperCase() !== 'ABS';
        if (isAppeared) {
          subMap[cleanName].appeared++;
          subMap[cleanName].sumMarks += numTotal;

          if (!isNaN(numTheory)) {
            subMap[cleanName].sumTheory += numTheory;
          }

          const hasTheoryFail = row.isTheoryFailed || (!isNaN(numTheory) && numTheory < subMap[cleanName].theoryMinMarks);
          const hasTotalFail = numTotal < row.minMarks;

          if (hasTheoryFail || hasTotalFail || String(row.total).toUpperCase() === 'FAIL') {
            subMap[cleanName].failedCount++;
          } else {
            subMap[cleanName].passedCount++;
          }

          if (numTotal > subMap[cleanName].highestScore) {
            subMap[cleanName].highestScore = numTotal;
          }
        }
      });
    });

    return Object.values(subMap).map((sub) => {
      const avgMarks = sub.appeared > 0 ? Number((sub.sumMarks / sub.appeared).toFixed(1)) : 0;
      const avgTheory = sub.appeared > 0 ? Number((sub.sumTheory / sub.appeared).toFixed(1)) : 0;
      const avgPercentage = sub.maxMarks > 0 ? Number(((avgMarks / sub.maxMarks) * 100).toFixed(1)) : 0;
      const passRate = sub.appeared > 0 ? Number(((sub.passedCount / sub.appeared) * 100).toFixed(1)) : 0;

      return {
        ...sub,
        avgMarks,
        avgTheory,
        avgPercentage,
        passRate,
      };
    });
  }, [students, selectedClass, selectedExam]);

  // Selected Class specific summary object
  const currentClassSummary = useMemo(() => {
    if (selectedClass === 'ALL') return null;
    return classStats.find((c) => c.className === selectedClass) || null;
  }, [classStats, selectedClass]);

  // Filtered student list - ONLY evaluated when showStudentRoster is true to ensure 0 LAG!
  const classStudents = useMemo(() => {
    if (!showStudentRoster) return [];

    return students.filter((s) => {
      const matchClass = selectedClass === 'ALL' || (s.className || s.sheetName) === selectedClass;
      if (!matchClass) return false;

      const exam = s[selectedExam];
      const validPer = exam ? parseFloat(exam.percentage) || 0 : 0;
      const resStr = exam ? String(exam.result).toUpperCase() : '';
      const isPass = resStr.includes('PASS') || resStr.includes('FIRST') || validPer >= 33;
      const isSuppl = resStr.includes('SUPPL');

      if (studentStatusFilter === 'FAIL') {
        if (isPass && !isSuppl) return false;
      } else if (studentStatusFilter === 'SUPPL') {
        if (!isSuppl) return false;
      } else if (studentStatusFilter === 'FIRST') {
        if (validPer < 60) return false;
      }

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.scholarNo.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q)
      );
    });
  }, [students, selectedClass, selectedExam, studentStatusFilter, searchTerm, showStudentRoster]);

  // Reset or initialize class-wise AI advice whenever selected class changes
  useEffect(() => {
    if (!isOpen) return;

    // Fast baseline diagnostic for the selected class
    const targetClassName = selectedClass === 'ALL' ? 'सम्पूर्ण विद्यालय' : `कक्षा ${selectedClass}`;
    const classData = {
      className: targetClassName,
      examName: selectedExam === 'quarterly' ? 'त्रैमासिक परीक्षा' : selectedExam === 'halfYearly' ? 'अर्द्धवार्षिक परीक्षा' : 'वार्षिक परीक्षा',
      total: currentClassSummary ? currentClassSummary.total : overallMetrics.totalStudents,
      appeared: currentClassSummary ? currentClassSummary.appeared : overallMetrics.totalAppeared,
      passed: currentClassSummary ? currentClassSummary.passed : overallMetrics.totalPassed,
      failed: currentClassSummary ? currentClassSummary.failed : overallMetrics.totalFailed,
      passRate: currentClassSummary ? (currentClassSummary.appeared > 0 ? Number(((currentClassSummary.passed / currentClassSummary.appeared) * 100).toFixed(1)) : 0) : overallMetrics.passRate,
      avgPercentage: currentClassSummary ? currentClassSummary.avgPercentage : overallMetrics.overallAvg,
    };

    const payload = {
      classData,
      subjectStats: subjectStats.map((s) => ({
        name: s.name,
        avgMarks: s.avgMarks,
        maxMarks: s.maxMarks,
        avgPercentage: s.avgPercentage,
        minMarks: s.theoryMinMarks || 27,
        passedCount: s.passedCount,
        failedCount: s.failedCount,
        passRate: s.passRate,
      })),
    };

    setAiAnalysis(generateClientDiagnosticAnalysis(payload));
    setAiAnalyzedClass(selectedClass);
    setAiSource('diagnostic-engine');
  }, [isOpen, selectedClass, selectedExam, currentClassSummary, subjectStats, overallMetrics]);

  // On-demand Class-Wise AI Recommendation Request (NO FULL DUMP, ONLY CHOSEN CLASS)
  const handleRequestLiveAiAdvice = async (targetClsOverride?: string) => {
    const clsToAnalyze = targetClsOverride !== undefined ? targetClsOverride : selectedClass;
    setIsLoadingAi(true);

    const targetClassStats = clsToAnalyze === 'ALL'
      ? null
      : classStats.find((c) => c.className === clsToAnalyze);

    const classData = {
      className: clsToAnalyze === 'ALL' ? 'सम्पूर्ण विद्यालय' : `कक्षा ${clsToAnalyze}`,
      examName: selectedExam === 'quarterly' ? 'त्रैमासिक परीक्षा' : selectedExam === 'halfYearly' ? 'अर्द्धवार्षिक परीक्षा' : 'वार्षिक परीक्षा',
      total: targetClassStats ? targetClassStats.total : overallMetrics.totalStudents,
      appeared: targetClassStats ? targetClassStats.appeared : overallMetrics.totalAppeared,
      passed: targetClassStats ? targetClassStats.passed : overallMetrics.totalPassed,
      failed: targetClassStats ? targetClassStats.failed : overallMetrics.totalFailed,
      passRate: targetClassStats ? (targetClassStats.appeared > 0 ? Number(((targetClassStats.passed / targetClassStats.appeared) * 100).toFixed(1)) : 0) : overallMetrics.passRate,
      avgPercentage: targetClassStats ? targetClassStats.avgPercentage : overallMetrics.overallAvg,
    };

    // Filter subjects for this specific class only
    const targetStudents = clsToAnalyze === 'ALL'
      ? students
      : students.filter((s) => (s.className || s.sheetName) === clsToAnalyze);

    const subMap: Record<string, any> = {};
    targetStudents.forEach((s) => {
      const exam = s[selectedExam];
      if (!exam || !exam.rows) return;
      exam.rows.forEach((r) => {
        const name = r.name.trim();
        if (!name) return;
        if (!subMap[name]) {
          subMap[name] = {
            name,
            appeared: 0,
            sumMarks: 0,
            maxMarks: r.maxMarks || 100,
            minMarks: r.theoryMinMarks || 27,
            passedCount: 0,
            failedCount: 0,
          };
        }
        const tot = typeof r.total === 'number' ? r.total : parseFloat(String(r.total));
        if (!isNaN(tot) && tot >= 0) {
          subMap[name].appeared++;
          subMap[name].sumMarks += tot;
          if (r.isTheoryFailed || tot < r.minMarks) {
            subMap[name].failedCount++;
          } else {
            subMap[name].passedCount++;
          }
        }
      });
    });

    const specificSubjectStats = Object.values(subMap).map((s: any) => ({
      name: s.name,
      avgMarks: s.appeared > 0 ? Number((s.sumMarks / s.appeared).toFixed(1)) : 0,
      maxMarks: s.maxMarks,
      avgPercentage: s.maxMarks > 0 && s.appeared > 0 ? Number(((s.sumMarks / s.appeared / s.maxMarks) * 100).toFixed(1)) : 0,
      minMarks: s.minMarks,
      passedCount: s.passedCount,
      failedCount: s.failedCount,
      passRate: s.appeared > 0 ? Number(((s.passedCount / s.appeared) * 100).toFixed(1)) : 0,
    }));

    const payload = {
      classData,
      subjectStats: specificSubjectStats,
    };

    try {
      const res = await fetchAiAcademicRecommendations(payload);
      if (res && res.text) {
        setAiAnalysis(res.text);
        setAiSource(res.source);
        setAiAnalyzedClass(clsToAnalyze);
      }
    } catch (e) {
      console.error('Failed to fetch class-wise AI recommendation:', e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopyAiAnalysis = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis);
    setHasCopiedAi(true);
    setTimeout(() => setHasCopiedAi(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1-Page Printable Digest Modal */}
      {showPrintSummaryModal && (
        <AdminOnePagePrintSummary
          isOpen={showPrintSummaryModal}
          onClose={() => setShowPrintSummaryModal(false)}
          selectedClass={selectedClass}
          selectedExam={selectedExam}
          overallMetrics={overallMetrics}
          currentClassSummary={currentClassSummary}
          classStats={classStats}
          subjectStats={subjectStats}
          aiAnalysisText={aiAnalysis}
          lastUpdated={lastUpdated}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:hidden">
        <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden">
          
          {/* Top Navbar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 sm:p-4.5 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/60 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 text-[11px] px-2 py-0.5 rounded font-black tracking-wide">
                    ADMIN ANALYTICS & AI ADVISOR
                  </span>
                  <span className="text-xs text-indigo-200">
                    {SCHOOL_INFO.schoolName}
                  </span>
                  {lastUpdated && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-amber-200/90 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                      <Calendar className="w-3 h-3 text-amber-300" />
                      <span>अद्यतन: <b>{lastUpdated}</b></span>
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  <span>कक्षावार परिणाम, विषय प्रगति एवं AI शैक्षणिक विश्लेषण</span>
                  {selectedClass !== 'ALL' && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                      कक्षा: {selectedClass}
                    </span>
                  )}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 1-Page Print Button - Prominent & Always Accessible */}
              <button
                type="button"
                onClick={() => setShowPrintSummaryModal(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="पूरा परिणाम विश्लेषण 1 पेज में प्रिंट करें"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ 1-पेज सार प्रिंट</span>
              </button>

              {/* Exam selector */}
              <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedExam('quarterly')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedExam === 'quarterly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  त्रैमासिक
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExam('halfYearly')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedExam === 'halfYearly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  अर्द्धवार्षिक
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExam('annual')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedExam === 'annual'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  वार्षिक
                </button>
              </div>

              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                className="px-2.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            
            {/* Quick KPI Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>कुल विद्यार्थी</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {selectedClass === 'ALL' ? overallMetrics.totalStudents : currentClassSummary?.total || 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {selectedClass === 'ALL' ? '21 Classes Sheets' : `कक्षा ${selectedClass}`}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>उत्तीर्ण (Pass Rate)</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                  {selectedClass === 'ALL'
                    ? `${overallMetrics.passRate}%`
                    : currentClassSummary && currentClassSummary.appeared > 0
                    ? `${((currentClassSummary.passed / currentClassSummary.appeared) * 100).toFixed(1)}%`
                    : '0%'}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {selectedClass === 'ALL' ? `${overallMetrics.totalPassed} Passed` : `${currentClassSummary?.passed || 0} Passed`}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>अनुत्तीर्ण (Failed)</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-red-600 font-mono">
                  {selectedClass === 'ALL' ? overallMetrics.totalFailed : currentClassSummary?.failed || 0}
                </div>
                <div className="text-[10px] text-red-500 font-semibold mt-0.5">तत्काल ध्यान आवश्यक</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>औसत अंक प्रतिशत</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
                  {selectedClass === 'ALL' ? `${overallMetrics.overallAvg}%` : `${currentClassSummary?.avgPercentage || 0}%`}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Class Average</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                  <span>प्रथम श्रेणी (60%+)</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono">
                  {selectedClass === 'ALL' ? overallMetrics.totalFirstDiv : currentClassSummary?.firstDiv || 0}
                </div>
                <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Toppers (60%+)</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                  <span>पूरक (Suppl.)</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-orange-600 font-mono">
                  {selectedClass === 'ALL' ? overallMetrics.totalSuppl : currentClassSummary?.suppl || 0}
                </div>
                <div className="text-[10px] text-orange-600 font-semibold mt-0.5">1 विषय में अनुत्तीर्ण</div>
              </div>
            </div>

            {/* Class Filter Bar with Fast Class Switcher */}
            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-extrabold text-slate-800">कक्षा चुनें (Select Class):</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border-2 border-blue-400 bg-blue-50/50 text-xs sm:text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                >
                  <option value="ALL">🌟 सभी कक्षाएं देखें (All 21 Classes Overview)</option>
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      कक्षा: {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedClass !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setSelectedClass('ALL')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                    <span>सभी कक्षाओं पर वापस जाएं</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowPrintSummaryModal(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>1-पेज प्रिंट प्रिव्यू</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 1: 4 PRAKAR KE ANALYTICAL GRAPHS                                */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
              
              {/* Graph Mode Segmented Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>परिणाम विश्लेषण ग्राफ (Multi-Dimensional Analytical Graphs)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    विभिन्न प्रकार के ग्राफ से समझें किस कक्षा और किस विषय में सुधार की आवश्यकता है
                  </p>
                </div>

                {/* 4 Graph Options Buttons */}
                <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex flex-wrap gap-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveGraphMode('class-comparison')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeGraphMode === 'class-comparison'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>1. तुलनात्मक बार चार्ट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGraphMode('division-breakdown')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeGraphMode === 'division-breakdown'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                    <span>2. श्रेणी विभाजन</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGraphMode('risk-matrix')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeGraphMode === 'risk-matrix'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>3. जोखिम व सुधार हीटमैप</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveGraphMode('subject-index')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeGraphMode === 'subject-index'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>4. विषय कठिनाई सूचकांक</span>
                  </button>
                </div>
              </div>

              {/* GRAPH VIEW 1: Class Comparison Bar Chart */}
              {activeGraphMode === 'class-comparison' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">रंग संकेत:</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> 75%+ (उत्कृष्ट)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> 50-74% (संतोषजनक)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span> 35-49% (मध्यम)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span> &lt;35% (गंभीर ध्यान)</span>
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold">
                      💡 किसी भी कक्षा कार्ड पर क्लिक करने पर उसका विस्तृत विषयवार ग्राफ़ खुल जाता है
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classStats.map((st) => {
                      const passRatio = st.appeared > 0 ? (st.passed / st.appeared) * 100 : 0;
                      const isSelected = selectedClass === st.className;
                      const barColor = passRatio >= 75 ? 'bg-emerald-500' : passRatio >= 50 ? 'bg-blue-500' : passRatio >= 35 ? 'bg-amber-500' : 'bg-red-500';
                      const badgeText = passRatio >= 75 ? 'उत्कृष्ट' : passRatio >= 50 ? 'संतोषजनक' : passRatio >= 35 ? 'मध्यम' : 'गंभीर ध्यान';
                      const badgeBg = passRatio >= 75 ? 'bg-emerald-100 text-emerald-800' : passRatio >= 50 ? 'bg-blue-100 text-blue-800' : passRatio >= 35 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';

                      return (
                        <div
                          key={st.className}
                          onClick={() => setSelectedClass(isSelected ? 'ALL' : st.className)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-200'
                              : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm sm:text-base">
                                {st.className}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                                {badgeText}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {passRatio.toFixed(0)}% Pass
                            </span>
                          </div>

                          {/* Progress Bar: Pass & Fail */}
                          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex border border-slate-200 mb-2">
                            <div
                              className={`h-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${Math.min(100, Math.max(2, passRatio))}%` }}
                              title={`Pass: ${st.passed}`}
                            ></div>
                            <div
                              className="h-full bg-red-200/90 transition-all duration-500"
                              style={{ width: `${Math.min(100, 100 - passRatio)}%` }}
                              title={`Fail: ${st.failed}`}
                            ></div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center font-semibold">
                            <div>
                              <span className="text-slate-400 block text-[9.5px]">उपस्थित</span>
                              <span className="font-mono text-slate-900 font-bold">{st.appeared}</span>
                            </div>
                            <div>
                              <span className="text-emerald-600 block text-[9.5px]">पास</span>
                              <span className="font-mono text-emerald-700 font-bold">{st.passed}</span>
                            </div>
                            <div>
                              <span className="text-red-500 block text-[9.5px]">फेल</span>
                              <span className="font-mono text-red-600 font-bold">{st.failed}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                            <span>औसत अंक: <b>{st.avgPercentage}%</b></span>
                            <span className="text-blue-600 font-bold flex items-center gap-0.5 hover:underline">
                              विषय प्रगति देखें <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GRAPH VIEW 2: Result Division Breakdown */}
              {activeGraphMode === 'division-breakdown' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-indigo-600" />
                      <span>परिणाम श्रेणी वितरण (Divisions Breakdown) - {selectedClass === 'ALL' ? 'सम्पूर्ण विद्यालय' : `कक्षा ${selectedClass}`}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">
                      प्रथम श्रेणी (60%+), द्वितीय/सामान्य उत्तीर्ण, पूरक व अनुत्तीर्ण विद्यार्थियों का प्रतिशत विभाजन
                    </p>

                    {(() => {
                      const totalApp = selectedClass === 'ALL' ? overallMetrics.totalAppeared : currentClassSummary?.appeared || 0;
                      const first = selectedClass === 'ALL' ? overallMetrics.totalFirstDiv : currentClassSummary?.firstDiv || 0;
                      const passTot = selectedClass === 'ALL' ? overallMetrics.totalPassed : currentClassSummary?.passed || 0;
                      const suppl = selectedClass === 'ALL' ? overallMetrics.totalSuppl : currentClassSummary?.suppl || 0;
                      const fail = selectedClass === 'ALL' ? overallMetrics.totalFailed : currentClassSummary?.failed || 0;
                      const otherPass = Math.max(0, passTot - first);

                      const pFirst = totalApp > 0 ? ((first / totalApp) * 100).toFixed(1) : '0';
                      const pOtherPass = totalApp > 0 ? ((otherPass / totalApp) * 100).toFixed(1) : '0';
                      const pSuppl = totalApp > 0 ? ((suppl / totalApp) * 100).toFixed(1) : '0';
                      const pFail = totalApp > 0 ? ((fail / totalApp) * 100).toFixed(1) : '0';

                      return (
                        <div>
                          <div className="w-full bg-slate-200 h-7 rounded-xl overflow-hidden flex border border-slate-300 shadow-inner mb-4">
                            <div style={{ width: `${pFirst}%` }} className="bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center truncate px-1" title={`प्रथम श्रेणी: ${first} (${pFirst}%)`}>
                              {parseFloat(pFirst) > 5 ? `${pFirst}%` : ''}
                            </div>
                            <div style={{ width: `${pOtherPass}%` }} className="bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center truncate px-1" title={`द्वितीय/सामान्य पास: ${otherPass} (${pOtherPass}%)`}>
                              {parseFloat(pOtherPass) > 5 ? `${pOtherPass}%` : ''}
                            </div>
                            <div style={{ width: `${pSuppl}%` }} className="bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center truncate px-1" title={`पूरक: ${suppl} (${pSuppl}%)`}>
                              {parseFloat(pSuppl) > 5 ? `${pSuppl}%` : ''}
                            </div>
                            <div style={{ width: `${pFail}%` }} className="bg-red-500 text-white text-[10px] font-bold flex items-center justify-center truncate px-1" title={`फेल: ${fail} (${pFail}%)`}>
                              {parseFloat(pFail) > 5 ? `${pFail}%` : ''}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                              <span className="text-purple-800 text-xs font-extrabold block">⭐ प्रथम श्रेणी (60%+)</span>
                              <div className="text-2xl font-black text-purple-950 font-mono mt-1">{first} छात्र</div>
                              <span className="text-[11px] text-purple-700 font-bold">{pFirst}% of students</span>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                              <span className="text-emerald-800 text-xs font-extrabold block">✅ द्वितीय / सामान्य पास</span>
                              <div className="text-2xl font-black text-emerald-950 font-mono mt-1">{otherPass} छात्र</div>
                              <span className="text-[11px] text-emerald-700 font-bold">{pOtherPass}% of students</span>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                              <span className="text-amber-800 text-xs font-extrabold block">⚠️ पूरक (Supplementary)</span>
                              <div className="text-2xl font-black text-amber-950 font-mono mt-1">{suppl} छात्र</div>
                              <span className="text-[11px] text-amber-700 font-bold">{pSuppl}% of students</span>
                            </div>

                            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                              <span className="text-red-800 text-xs font-extrabold block">❌ अनुत्तीर्ण (Failed)</span>
                              <div className="text-2xl font-black text-red-950 font-mono mt-1">{fail} छात्र</div>
                              <span className="text-[11px] text-red-700 font-bold">{pFail}% of students</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* GRAPH VIEW 3: Performance Matrix & Risk Heatmap */}
              {activeGraphMode === 'risk-matrix' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-600 font-semibold">
                      कक्षाओं के उत्तीर्ण प्रतिशत के आधार पर प्राथमिकता वर्गीकरण:
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      कम पास प्रतिशत वाली कक्षाएं प्राथमिकता पर हैं
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Quadrant 1: Critical Attention (<35% Pass) */}
                    <div className="bg-red-50/70 border-2 border-red-300 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-red-800 font-extrabold text-xs mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>गंभीर ध्यान (&lt;35% Pass)</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {classStats.filter((c) => c.appeared > 0 && (c.passed / c.appeared) * 100 < 35).length === 0 ? (
                          <div className="text-xs text-slate-400 italic">कोई कक्षा इस श्रेणी में नहीं है</div>
                        ) : (
                          classStats.filter((c) => c.appeared > 0 && (c.passed / c.appeared) * 100 < 35).map((c) => (
                            <div
                              key={c.className}
                              onClick={() => setSelectedClass(c.className)}
                              className="p-2 bg-white rounded-lg border border-red-200 flex items-center justify-between text-xs cursor-pointer hover:bg-red-100/50"
                            >
                              <span className="font-bold text-slate-900">{c.className}</span>
                              <span className="font-mono font-bold text-red-600">{((c.passed / c.appeared) * 100).toFixed(0)}% ({c.failed} फेल)</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quadrant 2: Needs Supervision (35-49% Pass) */}
                    <div className="bg-amber-50/70 border-2 border-amber-300 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>सुधार योग्य (35-49% Pass)</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {classStats.filter((c) => c.appeared > 0 && (c.passed / c.appeared) * 100 >= 35 && (c.passed / c.appeared) * 100 < 50).map((c) => (
                          <div
                            key={c.className}
                            onClick={() => setSelectedClass(c.className)}
                            className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-100/50"
                          >
                            <span className="font-bold text-slate-900">{c.className}</span>
                            <span className="font-mono font-bold text-amber-700">{((c.passed / c.appeared) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quadrant 3: Stable (50-74% Pass) */}
                    <div className="bg-blue-50/70 border-2 border-blue-300 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-blue-800 font-extrabold text-xs mb-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>संतोषजनक (50-74% Pass)</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {classStats.filter((c) => c.appeared > 0 && (c.passed / c.appeared) * 100 >= 50 && (c.passed / c.appeared) * 100 < 75).map((c) => (
                          <div
                            key={c.className}
                            onClick={() => setSelectedClass(c.className)}
                            className="p-2 bg-white rounded-lg border border-blue-200 flex items-center justify-between text-xs cursor-pointer hover:bg-blue-100/50"
                          >
                            <span className="font-bold text-slate-900">{c.className}</span>
                            <span className="font-mono font-bold text-blue-700">{((c.passed / c.appeared) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quadrant 4: Excellent (>75% Pass) */}
                    <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs mb-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>उत्कृष्ट (&gt;75% Pass)</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {classStats.filter((c) => c.appeared > 0 && (c.passed / c.appeared) * 100 >= 75).map((c) => (
                          <div
                            key={c.className}
                            onClick={() => setSelectedClass(c.className)}
                            className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-100/50"
                          >
                            <span className="font-bold text-slate-900">{c.className}</span>
                            <span className="font-mono font-bold text-emerald-700">{((c.passed / c.appeared) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GRAPH VIEW 4: Subject Difficulty & Failure Index (PURE SUBJECT STATS, NO STUDENTS) */}
              {activeGraphMode === 'subject-index' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="text-xs text-slate-600 font-bold">
                      कठिनाई सूचकांक - किन विषयों में छात्र सबसे ज्यादा फेल हो रहे हैं:
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {selectedClass === 'ALL' ? 'सम्पूर्ण विद्यालय' : `कक्षा ${selectedClass}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[...subjectStats]
                      .sort((a, b) => b.failedCount - a.failedCount)
                      .map((sub) => {
                        const isHighRisk = sub.failedCount > 5 || sub.passRate < 50;

                        return (
                          <div
                            key={sub.name}
                            className={`p-3 rounded-xl border-2 ${
                              isHighRisk ? 'bg-red-50/60 border-red-300' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-extrabold text-slate-900 text-sm">{sub.name}</span>
                              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                sub.failedCount > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {sub.failedCount} फेल
                              </span>
                            </div>

                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
                              <div
                                className={`h-full rounded-full ${sub.passRate >= 70 ? 'bg-emerald-500' : sub.passRate >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(100, Math.max(5, sub.passRate))}%` }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-600">
                              <span>उत्तीर्ण दर: <b>{sub.passRate}%</b></span>
                              <span>औसत अंक: <b>{sub.avgMarks}/{sub.maxMarks}</b></span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>

            {/* ========================================================================= */}
            {/* SECTION 2: SUBJECT-WISE PROGRESS GRAPH (PURE SUBJECT PROGRESS, NO NAMES)  */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border-2 border-blue-400/80 shadow-md p-4 sm:p-5 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-black rounded-lg">
                      {selectedClass === 'ALL' ? 'सभी विषय' : `कक्षा: ${selectedClass}`}
                    </span>
                    <h3 className="font-black text-slate-950 text-base sm:text-lg">
                      विषयवार प्रगति विश्लेषण (Subject-Wise Progress & Failure Analysis)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    केवल विषयवार प्रगति सांख्यिकी (विद्यार्थियों के व्यक्तिगत नाम रहित - शुद्ध शैक्षणिक प्रगति)
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 border border-slate-200">
                    कुल विषय: <b>{subjectStats.length}</b>
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                    औसत उत्तीर्ण दर: <b>
                      {subjectStats.length > 0 
                        ? (subjectStats.reduce((acc, s) => acc + s.passRate, 0) / subjectStats.length).toFixed(1) 
                        : 0}%
                    </b>
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Cards (Strictly NO student names!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjectStats.map((sub) => {
                  const passColor = sub.passRate >= 75 ? 'bg-emerald-500' : sub.passRate >= 50 ? 'bg-blue-600' : 'bg-red-500';
                  const statusTag = sub.passRate >= 75 ? 'उत्कृष्ट' : sub.passRate >= 50 ? 'संतोषजनक' : 'सुधार आवश्यक';
                  const statusBg = sub.passRate >= 75 ? 'bg-emerald-100 text-emerald-800' : sub.passRate >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';

                  return (
                    <div
                      key={sub.name}
                      className="p-3.5 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/70 hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {sub.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBg}`}>
                            {statusTag}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            sub.failedCount === 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {sub.failedCount > 0 ? `${sub.failedCount} फेल` : '100% पास'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar of Subject Average Score */}
                      <div className="space-y-1 mb-2.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>विषय औसत प्राप्तांक: <b>{sub.avgMarks} / {sub.maxMarks}</b></span>
                          <span className="font-mono font-bold text-slate-900">{sub.avgPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${passColor}`}
                            style={{ width: `${Math.min(100, Math.max(3, sub.avgPercentage))}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Subject Metrics Grid (NO individual names) */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-100/90 p-2 rounded-lg border border-slate-200/80">
                        <div>
                          <span className="text-slate-500 block text-[9.5px]">कुल उपस्थित छात्र:</span>
                          <span className="font-bold text-slate-800">{sub.appeared} छात्र</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px]">विषय पास दर:</span>
                          <span className="font-bold text-emerald-700">{sub.passRate}% पास</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px]">थ्योरी उत्तीर्णांक:</span>
                          <span className="font-bold text-slate-800">{sub.theoryMinMarks} अंक ({sub.theoryMaxMarks} में से)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px]">थ्योरी औसत अंक:</span>
                          <span className="font-bold text-blue-900">{sub.avgTheory} अंक</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[10.5px]">
                          <span className="text-slate-500">उत्तीर्ण vs अनुत्तीर्ण:</span>
                          <span className="font-semibold text-slate-800">
                            <span className="text-emerald-700 font-bold">{sub.passedCount} पास</span> / <span className="text-red-600 font-bold">{sub.failedCount} फेल</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 3: CLASS-WISE ON-DEMAND AI RECOMMENDATION (ZERO LAG)              */}
            {/* ========================================================================= */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-indigo-800/80">
              <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                      <span>कक्षावार AI शैक्षणिक सलाहकार व सुधारात्मक योजना</span>
                      <span className="text-[10px] bg-indigo-500/40 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                        {aiSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash Active' : 'Intelligent Diagnostic Engine'}
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200">
                      बिना लैग के कक्षावार सटीक विश्लेषण: चुने गए वर्ग का परिणाम निदान और सुधार हेतु चरणबद्ध कदम
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyAiAnalysis}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
                  >
                    {hasCopiedAi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedAi ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestLiveAiAdvice()}
                    disabled={isLoadingAi}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>
                      {isLoadingAi 
                        ? 'AI विश्लेषण जारी...' 
                        : selectedClass === 'ALL'
                        ? 'AI से सम्पूर्ण विद्यालय विश्लेषण लें'
                        : `कक्षा ${selectedClass} का AI सुधार विश्लेषण लें`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Class-wise Selection Quick Pills for Instant AI Analysis without Lag */}
              <div className="bg-white/5 p-2 rounded-xl border border-white/10 mb-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-indigo-200 font-bold flex items-center gap-1 mr-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                  <span>त्वरित कक्षा चुनें:</span>
                </span>
                {classList.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      handleRequestLiveAiAdvice(cls);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    कक्षा {cls}
                  </button>
                ))}
              </div>

              {/* Formatted AI Insights Output */}
              <div className="bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-white/10 text-xs sm:text-sm leading-relaxed text-indigo-100 whitespace-pre-line font-normal">
                {aiAnalysis}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SECTION 4: STUDENTS LIST (COLLAPSIBLE / HIDDEN BY DEFAULT TO PREVENT LAG) */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3.5 sm:p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    विद्यार्थियों की व्यक्तिगत परिणाम सूची (Individual Students Roster)
                  </h4>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                    {selectedClass === 'ALL' ? 'सम्पूर्ण विद्यालय' : `कक्षा ${selectedClass}`}
                  </span>
                </div>

                {/* Toggle Button to Show/Hide Student Roster to completely eliminate UI Lag */}
                <button
                  type="button"
                  onClick={() => setShowStudentRoster(!showStudentRoster)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    showStudentRoster
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {showStudentRoster ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>विद्यार्थियों का डेटा छुपाएं (लैग से सुरक्षित रखें)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>विद्यार्थियों की सूची खोलें (आवश्यकता होने पर)</span>
                    </>
                  )}
                </button>
              </div>

              {!showStudentRoster ? (
                <div className="p-6 text-center bg-slate-50/50">
                  <p className="text-xs text-slate-500 font-semibold mb-2">
                    ⚡ <b>सुगम व तीव्र प्रदर्शन:</b> अधिक विद्यार्थियों का डेटा लोड होने से होने वाले लैग से बचने के लिए छात्रों की व्यक्तिगत सूची डिफ़ॉल्ट रूप से छिपी हुई है।
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowStudentRoster(true)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>कक्षा {selectedClass} के विद्यार्थियों की सूची लोड करें</span>
                  </button>
                </div>
              ) : (
                <div>
                  {/* Filter bar */}
                  <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setStudentStatusFilter('ALL')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          studentStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        सभी
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatusFilter('FAIL')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          studentStatusFilter === 'FAIL' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700'
                        }`}
                      >
                        फेल छात्र
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatusFilter('SUPPL')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          studentStatusFilter === 'SUPPL' ? 'bg-amber-600 text-white shadow-2xs' : 'text-amber-800'
                        }`}
                      >
                        पूरक
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentStatusFilter('FIRST')}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          studentStatusFilter === 'FIRST' ? 'bg-purple-600 text-white shadow-2xs' : 'text-purple-800'
                        }`}
                      >
                        प्रथम श्रेणी (60%+)
                      </button>
                    </div>

                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="नाम, रोल या स्कॉलर खोजें..."
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-300 z-10">
                        <tr>
                          <th className="py-2 px-3">कक्षा</th>
                          <th className="py-2 px-2.5">Roll No</th>
                          <th className="py-2 px-2.5">Scholar</th>
                          <th className="py-2 px-3">विद्यार्थी का नाम</th>
                          <th className="py-2 px-3">पिता का नाम</th>
                          <th className="py-2 px-3 text-center">कुल अंक</th>
                          <th className="py-2 px-3 text-center">प्रतिशत</th>
                          <th className="py-2 px-3 text-center">परिणाम</th>
                          <th className="py-2 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {classStudents.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              कोई विद्यार्थी नहीं मिला।
                            </td>
                          </tr>
                        ) : (
                          classStudents.map((s, idx) => {
                            const exam = s[selectedExam];
                            const isPass = exam && (
                              String(exam.result).toUpperCase().includes('PASS') ||
                              String(exam.result).toUpperCase().includes('FIRST')
                            );

                            return (
                              <tr
                                key={`${s.scholarNo}-${s.sheetName}-${idx}`}
                                className="hover:bg-blue-50/70 transition-colors"
                              >
                                <td className="py-2 px-3 font-semibold text-slate-700">
                                  {s.className || s.sheetName}
                                </td>
                                <td className="py-2 px-2.5 font-mono font-bold text-[#1a73e8]">
                                  {s.rollNo}
                                </td>
                                <td className="py-2 px-2.5 font-mono font-bold text-slate-900">
                                  {s.scholarNo}
                                </td>
                                <td className="py-2 px-3 font-bold text-slate-950">
                                  {s.name}
                                </td>
                                <td className="py-2 px-3 text-slate-600">
                                  {s.fatherName}
                                </td>
                                <td className="py-2 px-3 text-center font-mono text-slate-800 font-bold">
                                  {exam ? `${exam.grandTotal} / ${exam.totalMaxMarks}` : '-'}
                                </td>
                                <td className="py-2 px-3 text-center font-mono font-black text-emerald-800">
                                  {exam ? `${exam.percentage}%` : '-'}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {exam ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                        isPass
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {exam.result}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSelectStudent(s);
                                      onClose();
                                    }}
                                    className="px-2.5 py-1 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                                  >
                                    मार्कशीट देखें
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </>
  );
};
