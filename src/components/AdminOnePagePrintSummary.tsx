import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  Calendar,
  School
} from 'lucide-react';
import { SCHOOL_INFO } from '../utils/reportCardParser';

export interface SubjectStatItem {
  name: string;
  appeared: number;
  avgMarks: number;
  avgTheory: number;
  avgPercentage: number;
  maxMarks: number;
  theoryMaxMarks: number;
  theoryMinMarks: number;
  passedCount: number;
  failedCount: number;
  passRate: number;
  highestScore: number;
}

export interface ClassStatItem {
  className: string;
  total: number;
  appeared: number;
  passed: number;
  failed: number;
  suppl: number;
  firstDiv: number;
  avgPercentage: number;
}

interface AdminOnePagePrintSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  selectedExam: 'quarterly' | 'halfYearly' | 'annual';
  overallMetrics: {
    totalStudents: number;
    totalAppeared: number;
    totalPassed: number;
    totalFailed: number;
    totalSuppl: number;
    totalFirstDiv: number;
    passRate: number;
    overallAvg: number;
  };
  currentClassSummary: ClassStatItem | null;
  classStats: ClassStatItem[];
  subjectStats: SubjectStatItem[];
  aiAnalysisText?: string;
  lastUpdated?: string;
}

export const AdminOnePagePrintSummary: React.FC<AdminOnePagePrintSummaryProps> = ({
  isOpen,
  onClose,
  selectedClass,
  selectedExam,
  overallMetrics,
  currentClassSummary,
  classStats,
  subjectStats,
  aiAnalysisText,
  lastUpdated,
}) => {
  if (!isOpen) return null;

  const examLabel =
    selectedExam === 'quarterly'
      ? 'त्रैमासिक परीक्षा 2024-25'
      : selectedExam === 'halfYearly'
      ? 'अर्द्धवार्षिक परीक्षा 2024-25'
      : 'वार्षिक परीक्षा 2024-25';

  const isAll = selectedClass === 'ALL';

  const activeTotal = isAll ? overallMetrics.totalStudents : currentClassSummary?.total || 0;
  const activeAppeared = isAll ? overallMetrics.totalAppeared : currentClassSummary?.appeared || 0;
  const activePassed = isAll ? overallMetrics.totalPassed : currentClassSummary?.passed || 0;
  const activeFailed = isAll ? overallMetrics.totalFailed : currentClassSummary?.failed || 0;
  const activeSuppl = isAll ? overallMetrics.totalSuppl : currentClassSummary?.suppl || 0;
  const activeFirstDiv = isAll ? overallMetrics.totalFirstDiv : currentClassSummary?.firstDiv || 0;
  const activePassRate = isAll
    ? overallMetrics.passRate
    : activeAppeared > 0
    ? Number(((activePassed / activeAppeared) * 100).toFixed(1))
    : 0;
  const activeAvg = isAll ? overallMetrics.overallAvg : currentClassSummary?.avgPercentage || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      {/* Container - on screen it is a modal preview; in print it takes over the full sheet */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden my-auto print:m-0 print:p-0 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Screen-only top action bar */}
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded font-black tracking-wide">
              1-PAGE PRINT PREVIEW
            </span>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
              एक पेज संपूर्ण परिणाम सार पत्रक (Executive Academic Digest)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट / PDF सेव करें</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STRICT 1-PAGE PRINTABLE DOCUMENT CONTENT                                  */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-2 print:overflow-visible text-slate-900 bg-white admin-print-sheet">
          
          {/* 1. Official Header */}
          <div className="text-center border-b-2 border-slate-900 pb-2 mb-2.5">
            <div className="flex items-center justify-center gap-2">
              <School className="w-5 h-5 text-slate-800 print:w-4 print:h-4" />
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 print:text-base">
                {SCHOOL_INFO.schoolName}
              </h1>
            </div>
            <p className="text-[11px] font-bold text-slate-700 mt-0.5 print:text-[9.5px]">
              {SCHOOL_INFO.location} | डाइस कोड: {SCHOOL_INFO.diceCode} | शाला कोड: {SCHOOL_INFO.institutionCode} | सत्र: {SCHOOL_INFO.academicSession}
            </p>
            <div className="inline-block mt-1 px-3 py-0.5 bg-slate-900 text-white font-black text-xs rounded-sm tracking-wide print:text-[10px] print:bg-black">
              परीक्षा परिणाम एवं शैक्षणिक प्रगति सार पत्रक (ACADEMIC PERFORMANCE DIGEST)
            </div>
          </div>

          {/* 2. Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] bg-slate-100 p-2 rounded border border-slate-300 mb-2.5 print:text-[9px] print:p-1.5 print:bg-slate-50 print:border-slate-400">
            <div>
              <span className="text-slate-500 font-semibold block print:text-slate-600">परीक्षा सत्र:</span>
              <span className="font-bold text-slate-900">{examLabel}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block print:text-slate-600">विश्लेषित इकाई:</span>
              <span className="font-black text-blue-900 print:text-black">
                {isAll ? 'सम्पूर्ण विद्यालय (All 21 Classes)' : `कक्षा: ${selectedClass}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block print:text-slate-600">अद्यतन / रिपोर्ट दिनांक:</span>
              <span className="font-bold text-slate-900">{lastUpdated || new Date().toLocaleDateString('hi-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block print:text-slate-600">मूल्यांकन स्तर:</span>
              <span className="font-bold text-emerald-800 print:text-black">
                {activePassRate >= 75 ? 'उत्कृष्ट (>75%)' : activePassRate >= 50 ? 'संतोषजनक' : 'सुधारात्मक निगरानी'}
              </span>
            </div>
          </div>

          {/* 3. Executive KPI Tiles (Compact 7-Metric Grid) */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center mb-3">
            <div className="p-1.5 bg-slate-50 border border-slate-300 rounded print:p-1">
              <span className="text-[9.5px] text-slate-500 font-bold block print:text-[8px]">कुल दर्ज</span>
              <span className="text-sm font-black font-mono text-slate-900 print:text-xs">{activeTotal}</span>
            </div>
            <div className="p-1.5 bg-slate-50 border border-slate-300 rounded print:p-1">
              <span className="text-[9.5px] text-slate-500 font-bold block print:text-[8px]">उपस्थित</span>
              <span className="text-sm font-black font-mono text-slate-900 print:text-xs">{activeAppeared}</span>
            </div>
            <div className="p-1.5 bg-emerald-50 border border-emerald-300 rounded print:p-1 print:bg-white print:border-slate-400">
              <span className="text-[9.5px] text-emerald-800 font-bold block print:text-[8px] print:text-black">उत्तीर्ण (Pass)</span>
              <span className="text-sm font-black font-mono text-emerald-700 print:text-xs print:text-black">{activePassed}</span>
            </div>
            <div className="p-1.5 bg-emerald-50/80 border border-emerald-300 rounded print:p-1 print:bg-white print:border-slate-400">
              <span className="text-[9.5px] text-emerald-800 font-bold block print:text-[8px] print:text-black">पास प्रतिशत</span>
              <span className="text-sm font-black font-mono text-emerald-700 print:text-xs print:text-black">{activePassRate}%</span>
            </div>
            <div className="p-1.5 bg-purple-50 border border-purple-300 rounded print:p-1 print:bg-white print:border-slate-400">
              <span className="text-[9.5px] text-purple-800 font-bold block print:text-[8px] print:text-black">प्रथम श्रेणी (60%+)</span>
              <span className="text-sm font-black font-mono text-purple-800 print:text-xs print:text-black">{activeFirstDiv}</span>
            </div>
            <div className="p-1.5 bg-amber-50 border border-amber-300 rounded print:p-1 print:bg-white print:border-slate-400">
              <span className="text-[9.5px] text-amber-800 font-bold block print:text-[8px] print:text-black">पूरक (Suppl.)</span>
              <span className="text-sm font-black font-mono text-amber-700 print:text-xs print:text-black">{activeSuppl}</span>
            </div>
            <div className="p-1.5 bg-red-50 border border-red-300 rounded print:p-1 print:bg-white print:border-slate-400">
              <span className="text-[9.5px] text-red-800 font-bold block print:text-[8px] print:text-black">अनुत्तीर्ण (Fail)</span>
              <span className="text-sm font-black font-mono text-red-700 print:text-xs print:text-black">{activeFailed}</span>
            </div>
          </div>

          {/* 4. Subject-Wise Progress Table (NO student names, purely subject progress) */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black text-slate-900 print:text-[10px] flex items-center gap-1.5">
                <span>1. विषयवार प्रगति एवं विफलता विश्लेषण (Subject-Wise Progress Matrix)</span>
                <span className="text-[9px] font-normal text-slate-500 print:text-[8px]">
                  (विद्यार्थियों के नाम रहित - केवल विषयवार सांख्यिकी)
                </span>
              </h3>
              <span className="text-[9.5px] font-bold text-slate-600 print:text-[8px]">
                कुल विषय: {subjectStats.length}
              </span>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[10.5px] print:text-[8.5px] border-collapse">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300 print:bg-slate-100">
                    <th className="py-1 px-2 border-r border-slate-300">क्र.</th>
                    <th className="py-1 px-2 border-r border-slate-300">विषय का नाम (Subject)</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">उपस्थित</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">पूर्णांक</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">औसत प्राप्तांक</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">थ्योरी औसत</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">उत्तीर्ण छात्र</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">अनुत्तीर्ण (फेल)</th>
                    <th className="py-1 px-1.5 text-center border-r border-slate-300">उत्तीर्ण %</th>
                    <th className="py-1 px-2 text-center">प्रगति स्तर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjectStats.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-2 text-center text-slate-400">
                        कोई विषय डेटा उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    subjectStats.map((sub, idx) => {
                      const isWeak = sub.passRate < 50 || sub.failedCount > 5;
                      const statusText =
                        sub.passRate >= 75
                          ? 'उत्कृष्ट'
                          : sub.passRate >= 50
                          ? 'संतोषजनक'
                          : 'सुधार आवश्यक';
                      const statusBg =
                        sub.passRate >= 75
                          ? 'text-emerald-700 font-bold'
                          : sub.passRate >= 50
                          ? 'text-blue-700 font-semibold'
                          : 'text-red-700 font-bold';

                      return (
                        <tr
                          key={sub.name}
                          className={isWeak ? 'bg-red-50/50 print:bg-transparent' : 'bg-white'}
                        >
                          <td className="py-0.5 px-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="py-0.5 px-2 border-r border-slate-200 font-bold text-slate-900">{sub.name}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono">{sub.appeared}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono">{sub.maxMarks}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono font-bold">{sub.avgMarks} ({sub.avgPercentage}%)</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-slate-700">{sub.avgTheory} / {sub.theoryMaxMarks}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">{sub.passedCount}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-red-600 font-bold">{sub.failedCount}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono font-bold">{sub.passRate}%</td>
                          <td className={`py-0.5 px-2 text-center text-[9.5px] print:text-[8px] ${statusBg}`}>
                            {statusText}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Class Comparison Table (If ALL) OR Class Division Matrix (If Specific Class) */}
          <div className="mb-3">
            <h3 className="text-xs font-black text-slate-900 print:text-[10px] mb-1">
              2. {isAll ? 'कक्षावार परिणाम तुलनात्मक विवरण (Class-Wise Performance Summary)' : `कक्षा ${selectedClass} श्रेणी विभाजन व विशिष्ट सांख्यिकी`}
            </h3>

            {isAll ? (
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-[10px] print:text-[8px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="py-1 px-2 border-r border-slate-300">कक्षा / संकाय</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">दर्ज</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">उपस्थित</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">पास</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">फेल</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">पूरक</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">1st Div</th>
                      <th className="py-1 px-1.5 text-center border-r border-slate-300">पास %</th>
                      <th className="py-1 px-2 text-center">कक्षा औसत</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {classStats.map((c) => {
                      const pRatio = c.appeared > 0 ? (c.passed / c.appeared) * 100 : 0;
                      return (
                        <tr key={c.className} className="hover:bg-slate-50">
                          <td className="py-0.5 px-2 border-r border-slate-200 font-bold text-slate-900">{c.className}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono">{c.total}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono">{c.appeared}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-emerald-700 font-bold">{c.passed}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-red-600 font-bold">{c.failed}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-amber-700">{c.suppl}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono text-purple-700">{c.firstDiv}</td>
                          <td className="py-0.5 px-1.5 border-r border-slate-200 text-center font-mono font-bold">{pRatio.toFixed(1)}%</td>
                          <td className="py-0.5 px-2 text-center font-mono text-slate-700">{c.avgPercentage}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded print:text-[8.5px] print:p-1.5">
                <div>
                  <span className="text-slate-500 block">प्रथम श्रेणी (60%+):</span>
                  <span className="font-bold text-purple-900 font-mono">
                    {currentClassSummary?.firstDiv || 0} छात्र ({activeAppeared > 0 ? (((currentClassSummary?.firstDiv || 0) / activeAppeared) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">सामान्य उत्तीर्ण (33-59%):</span>
                  <span className="font-bold text-emerald-800 font-mono">
                    {Math.max(0, (currentClassSummary?.passed || 0) - (currentClassSummary?.firstDiv || 0))} छात्र
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">पूरक पात्रता (1 विषय):</span>
                  <span className="font-bold text-amber-800 font-mono">{currentClassSummary?.suppl || 0} छात्र</span>
                </div>
                <div>
                  <span className="text-slate-500 block">अनुत्तीर्ण (2+ विषय):</span>
                  <span className="font-bold text-red-700 font-mono">{currentClassSummary?.failed || 0} छात्र</span>
                </div>
              </div>
            )}
          </div>

          {/* 6. AI Academic Diagnostic & Key Remedial Points */}
          <div className="p-2.5 bg-slate-50 border-2 border-indigo-200 rounded mb-3 print:border-slate-400 print:bg-white print:p-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 mb-1 print:text-[9.5px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 print:hidden" />
              <span>3. AI शैक्षणिक निदान व सुधारात्मक कार्ययोजना (Diagnostic Findings & Action Plan):</span>
            </div>
            <div className="text-[10.5px] print:text-[8.5px] text-slate-800 leading-snug space-y-1">
              {aiAnalysisText ? (
                <div className="line-clamp-4 print:line-clamp-none whitespace-pre-line">
                  {aiAnalysisText.slice(0, 480)}...
                </div>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><b>थ्योरी कटऑफ अनिवार्यता:</b> प्रोजेक्ट अंकों की तुलना में सैद्धांतिक (थ्योरी) परीक्षा में 1/3 उत्तीर्णांक प्राप्त न कर पाना विफलता का प्रमुख कारण है।</li>
                  <li><b>उपचारात्मक शिक्षण (Remedial Classes):</b> कमजोर विषयों हेतु प्रतिदिन 40 मिनट की अतिरिक्त उपचारात्मक कक्षाएं अनिवार्य रूप से संचालित की जाएं।</li>
                  <li><b>साप्ताहिक 20-अंकीय मॉक टेस्ट:</b> प्रत्येक शनिवार को कमजोर अध्यायों का 20 अंकों का टेस्ट आयोजित कर कमजोर छात्रों को अभ्यास कराया जाए।</li>
                  <li><b>लक्षित अभिभावक संवाद:</b> 2 या अधिक विषयों में अनुत्तीर्ण विद्यार्थियों के अभिभावकों से व्यक्तिगत परामर्श किया जाए।</li>
                </ul>
              )}
            </div>
          </div>

          {/* 7. Signatures Block */}
          <div className="grid grid-cols-3 gap-4 pt-4 mt-2 border-t border-slate-400 text-center text-[10.5px] print:text-[9px] print:pt-3">
            <div>
              <div className="h-6 print:h-5"></div>
              <span className="border-t border-slate-700 pt-1 block font-bold text-slate-900">
                हस्ताक्षर कक्षा शिक्षक (Class Teacher)
              </span>
            </div>
            <div>
              <div className="h-6 print:h-5"></div>
              <span className="border-t border-slate-700 pt-1 block font-bold text-slate-900">
                हस्ताक्षर परीक्षा प्रभारी (Exam In-charge)
              </span>
            </div>
            <div>
              <div className="h-6 print:h-5"></div>
              <span className="border-t border-slate-700 pt-1 block font-black text-slate-950">
                हस्ताक्षर एवं सील संस्था प्राचार्य (Principal)
              </span>
            </div>
          </div>

          <div className="mt-2 text-center text-[9px] text-slate-400 print:text-[7.5px] print:text-slate-500">
            * यह पत्रक शाला प्रबंधन एवं शैक्षणिक गुणवत्ता सुधार हेतु अधिकृत रूप से जनरेट किया गया 1-पेज सारांश प्रतिवेदन है।
          </div>

        </div>

      </div>
    </div>
  );
};
