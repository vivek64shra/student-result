import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Sliders, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { 
  ParsedStudent, 
  SCHOOL_INFO, 
  SCHOOL_LOGO_URL, 
  getCurrentPrintTimestamp 
} from '../utils/reportCardParser';
import { OfficialReportCard } from './OfficialReportCard';

interface ClassResultSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: ParsedStudent[];
  initialClass?: string;
  initialExam?: 'quarterly' | 'halfYearly' | 'annual';
  lastUpdated?: string;
}

export const ClassResultSheetModal: React.FC<ClassResultSheetModalProps> = ({
  isOpen,
  onClose,
  students,
  initialClass = 'ALL',
  initialExam = 'annual',
  lastUpdated,
}) => {
  const [selectedExam, setSelectedExam] = useState<'quarterly' | 'halfYearly' | 'annual'>(initialExam);
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [printScale, setPrintScale] = useState<'compact' | 'normal' | 'spacious'>('compact');
  const [viewMode, setViewMode] = useState<'ledger' | 'bulk-cards'>('ledger');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL' | 'SUPPL' | 'FIRST'>('ALL');

  // Compute available classes that actually have results for the selected exam
  const availableClasses = useMemo(() => {
    const classCountMap: Record<string, number> = {};
    students.forEach((s) => {
      const cls = s.className || s.sheetName;
      const examData = s[selectedExam];
      if (examData && examData.rows && examData.rows.length > 0) {
        classCountMap[cls] = (classCountMap[cls] || 0) + 1;
      }
    });

    return Object.keys(classCountMap)
      .filter((cls) => classCountMap[cls] > 0)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students, selectedExam]);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (initialClass !== 'ALL' && availableClasses.includes(initialClass)) {
      return initialClass;
    }
    return availableClasses[0] || 'ALL';
  });

  // Keep selectedClass synchronized if availableClasses changes
  React.useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.includes(selectedClass)) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass]);

  // Filter students of selected class having results
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter((s) => (s.className || s.sheetName) === selectedClass)
      .filter((s) => {
        const exam = s[selectedExam];
        return exam && exam.rows && exam.rows.length > 0;
      })
      .sort((a, b) => {
        const rollA = parseInt(a.rollNo, 10);
        const rollB = parseInt(b.rollNo, 10);
        if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
        return a.scholarNo.localeCompare(b.scholarNo, undefined, { numeric: true });
      });
  }, [students, selectedClass, selectedExam]);

  // Extract distinct subject names for columns in this class
  const classSubjects = useMemo(() => {
    const subMap: Record<string, { name: string; maxMarks: number }> = {};
    classStudents.forEach((s) => {
      const exam = s[selectedExam];
      if (!exam || !exam.rows) return;
      exam.rows.forEach((r) => {
        const cleanName = r.name.trim();
        if (cleanName && !subMap[cleanName]) {
          subMap[cleanName] = { name: cleanName, maxMarks: r.maxMarks || 100 };
        }
      });
    });
    return Object.values(subMap);
  }, [classStudents, selectedExam]);

  // Filtered by status (Pass, Fail, etc.)
  const filteredStudents = useMemo(() => {
    if (statusFilter === 'ALL') return classStudents;

    return classStudents.filter((s) => {
      const exam = s[selectedExam];
      if (!exam) return false;
      const resStr = String(exam.result).toUpperCase();
      const per = parseFloat(exam.percentage) || 0;
      const isFirst = resStr.includes('FIRST') || per >= 60;
      const isSuppl = resStr.includes('SUPPL');
      const isPass = resStr.includes('PASS') || isFirst || per >= 33;

      if (statusFilter === 'FIRST') return isFirst;
      if (statusFilter === 'SUPPL') return isSuppl;
      if (statusFilter === 'PASS') return isPass && !isSuppl;
      if (statusFilter === 'FAIL') return !isPass || isSuppl;
      return true;
    });
  }, [classStudents, selectedExam, statusFilter]);

  // Summary statistics for this class
  const classSummary = useMemo<{
    total: number;
    passed: number;
    failed: number;
    suppl: number;
    firstDiv: number;
    passRate: string;
    avgPer: string;
    topper: { name: string; rollNo: string; percentage: number } | null;
  }>(() => {
    const total = classStudents.length;
    let passed = 0;
    let failed = 0;
    let suppl = 0;
    let firstDiv = 0;
    let sumPer = 0;
    let topper: { name: string; rollNo: string; percentage: number } | null = null;

    classStudents.forEach((s) => {
      const exam = s[selectedExam];
      if (!exam) return;
      const per = parseFloat(exam.percentage) || 0;
      sumPer += per;

      if (!topper || per > topper.percentage) {
        topper = { name: s.name, rollNo: s.rollNo, percentage: per };
      }

      const resStr = String(exam.result).toUpperCase();
      const isFirst = resStr.includes('FIRST') || per >= 60;
      const isSuppl = resStr.includes('SUPPL');
      const isPass = resStr.includes('PASS') || isFirst || per >= 33;

      if (isFirst) firstDiv++;
      if (isSuppl) suppl++;
      if (isPass && !isSuppl) passed++;
      else failed++;
    });

    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    const avgPer = total > 0 ? (sumPer / total).toFixed(1) : '0';

    return { total, passed, failed, suppl, firstDiv, passRate, avgPer, topper };
  }, [classStudents, selectedExam]);

  if (!isOpen) return null;

  const examTitleHindi =
    selectedExam === 'quarterly'
      ? 'त्रैमासिक परीक्षा 2024-25'
      : selectedExam === 'halfYearly'
      ? 'अर्द्धवार्षिक परीक्षा 2024-25'
      : 'वार्षिक परीक्षा 2024-25';

  const handlePrint = () => {
    window.print();
  };

  // Export class ledger to CSV / Excel
  const handleExportCsv = () => {
    if (classStudents.length === 0) return;

    const headers = [
      'क्रमांक',
      'रोल नं.',
      'स्कॉलर नं.',
      'विद्यार्थी का नाम',
      'पिता का नाम',
      'कक्षा',
      ...classSubjects.map((s) => `${s.name} (${s.maxMarks})`),
      'कुल प्राप्तांक',
      'पूर्णांक',
      'प्रतिशत (%)',
      'परिणाम / श्रेणी',
      'रैंक',
    ];

    const rows = classStudents.map((s, idx) => {
      const exam = s[selectedExam];
      const marksMap: Record<string, string> = {};
      if (exam && exam.rows) {
        exam.rows.forEach((r) => {
          marksMap[r.name.trim()] = String(r.total);
        });
      }

      return [
        idx + 1,
        `"${s.rollNo}"`,
        `"${s.scholarNo}"`,
        `"${s.name}"`,
        `"${s.fatherName}"`,
        `"${s.className || s.sheetName}"`,
        ...classSubjects.map((sub) => `"${marksMap[sub.name] ?? '-'}"`),
        exam ? exam.grandTotal : '-',
        exam ? exam.totalMaxMarks : '-',
        exam ? exam.percentage : '-',
        exam ? `"${exam.result}"` : '-',
        exam ? exam.classRank : '-',
      ];
    });

    const csvContent =
      '\uFEFF' +
      `"माँ दुर्गा उच्चतर माध्यमिक विद्यालय, सेमरिया (रीवा)"\n` +
      `"कक्षावार परीक्षा परिणाम सारणी: कक्षा ${selectedClass} - ${examTitleHindi}"\n` +
      `"प्रिंट दिनांक: ${getCurrentPrintTimestamp()}"\n\n` +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Class_${selectedClass}_Result_${selectedExam}_Tabulation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scale classes
  const scaleClass =
    printScale === 'compact'
      ? 'text-[10px] sm:text-[11px] leading-tight'
      : printScale === 'spacious'
      ? 'text-xs sm:text-sm leading-normal'
      : 'text-[11px] sm:text-xs leading-normal';

  const tablePadding =
    printScale === 'compact'
      ? 'py-1 px-1.5'
      : printScale === 'spacious'
      ? 'py-2 px-3'
      : 'py-1.5 px-2';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex flex-col p-1 sm:p-3 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Inject print orientation styles dynamically */}
      <style>{`
        @page {
          size: A4 ${printOrientation};
          margin: 4mm 5mm !important;
        }
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            color: black !important;
          }
          .modal-control-bar, .modal-backdrop-ui {
            display: none !important;
          }
          .printable-sheet-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .bulk-card-item {
            page-break-after: always !important;
            break-after: page !important;
          }
          .bulk-card-item:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* Top Floating Control Bar (Hidden during print) */}
      <div className="modal-control-bar bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-3 border border-slate-700 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0 print:hidden">
        
        {/* Left: Title & Quick Badges */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black shadow-md shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-slate-950 rounded">
                कक्षावार परिणाम रजिस्टर
              </span>
              <span className="text-xs text-indigo-200">
                A4 प्रिंट एवं Google Excel लेजर फॉर्मेट
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
              <span>कक्षा: {selectedClass}</span>
              <span className="text-xs font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                {examTitleHindi}
              </span>
            </h2>
          </div>
        </div>

        {/* Center: Controls - Class, Exam, Mode, Orientation & Scale */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Class Dropdown */}
          <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs font-bold text-indigo-200">कक्षा:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-800 text-white font-black text-xs rounded-lg px-2 py-1 outline-none border border-indigo-400 cursor-pointer"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white">
                  कक्षा: {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Switcher */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedExam('quarterly')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedExam === 'quarterly' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              त्रैमासिक
            </button>
            <button
              type="button"
              onClick={() => setSelectedExam('halfYearly')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedExam === 'halfYearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              अर्द्धवार्षिक
            </button>
            <button
              type="button"
              onClick={() => setSelectedExam('annual')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedExam === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              वार्षिक
            </button>
          </div>

          {/* View Mode Toggle: Tabular Ledger vs Bulk Cards */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('ledger')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'ledger' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
              title="Google Excel / सारणी लेजर फॉर्मेट"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>कक्षा परिणाम सारणी</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bulk-cards')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'bulk-cards' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-200 hover:text-white'
              }`}
              title="सभी विद्यार्थियों की व्यक्तिगत अंकसूची A4 पर क्रमवार प्रिंट"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>थोक अंकसूची ({classStudents.length})</span>
            </button>
          </div>

          {/* Orientation Toggle: Landscape vs Portrait */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrintOrientation('landscape')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printOrientation === 'landscape' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-white/80 hover:text-white'
              }`}
              title="लैंडस्केप (आड़ा प्रिंट) - सारणी के लिए सर्वोत्तम"
            >
              📑 लैंडस्केप
            </button>
            <button
              type="button"
              onClick={() => setPrintOrientation('portrait')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printOrientation === 'portrait' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-white/80 hover:text-white'
              }`}
              title="पोर्ट्रेट (सीधा प्रिंट)"
            >
              📄 पोर्ट्रेट
            </button>
          </div>

          {/* Scale Adjust: Compact vs Normal vs Spacious */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrintScale('compact')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printScale === 'compact' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
              }`}
              title="छोटा साइज (85%) - A4 पर अधिक विषय आसानी से समाने हेतु"
            >
              छोटा (85%)
            </button>
            <button
              type="button"
              onClick={() => setPrintScale('normal')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printScale === 'normal' ? 'bg-blue-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              सामान्य (100%)
            </button>
          </div>

        </div>

        {/* Right Action Buttons: Print, CSV & Close */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="कक्षा का परिणाम Excel / CSV फॉर्मेट में डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="A4 साइज में सीधे प्रिंट करें"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ A4 प्रिंट करें</span>
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        
        {viewMode === 'ledger' ? (
          /* ========================================================== */
          /* MODE 1: TABULAR CLASS RESULT REGISTER (EXCEL LEDGER SHEET) */
          /* ========================================================== */
          <div className="printable-sheet-container bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-300 max-w-[1400px] mx-auto print:max-w-none print:p-0 print:border-none print:shadow-none">
            
            {/* Header: School Branding */}
            <div className="border-b-2 border-slate-900 pb-2 mb-2 text-center">
              <div className="flex items-center justify-between gap-3">
                <img
                  src={SCHOOL_LOGO_URL}
                  alt="School Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
                />
                <div className="flex-1 text-center">
                  <h1 className="text-base sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                    {SCHOOL_INFO.schoolName}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-700 font-bold mt-0.5">
                    डाइस कोड: <b>{SCHOOL_INFO.diceCode}</b> • संस्था कोड: <b>{SCHOOL_INFO.institutionCode}</b> • शैक्षणिक सत्र: <b>{SCHOOL_INFO.academicSession}</b>
                  </p>
                  <div className="mt-1 inline-block px-3 py-0.5 bg-slate-900 text-white text-xs sm:text-sm font-black rounded-md uppercase tracking-wide print:bg-slate-200 print:text-black print:border print:border-black">
                    कक्षावार परीक्षा परिणाम सारणी (TABULATION REGISTER) • कक्षा: {selectedClass} • {examTitleHindi}
                  </div>
                </div>
                {/* Official Circular School Logo Seal */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-indigo-950 ring-1 ring-indigo-950/60 p-0.5 flex items-center justify-center bg-indigo-50/50 print:border-black print:ring-0">
                    <div className="w-full h-full rounded-full border border-dashed border-indigo-700 flex items-center justify-center p-1 bg-white print:border-black">
                      <img src={SCHOOL_LOGO_URL} alt="Seal" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <span className="text-[7.5px] font-black uppercase text-indigo-950 mt-0.5 print:text-black">अधिकृत सील</span>
                </div>
              </div>
            </div>

            {/* Quick KPI Digest Bar (Visible in Screen & Print) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 mb-2.5 text-center text-xs">
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-slate-600 block">कुल विद्यार्थी</span>
                <span className="text-sm font-black font-mono text-slate-900">{classSummary.total}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-emerald-800 block">उत्तीर्ण (Pass %)</span>
                <span className="text-sm font-black font-mono text-emerald-900">{classSummary.passRate}% ({classSummary.passed})</span>
              </div>
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-purple-800 block">प्रथम श्रेणी (60%+)</span>
                <span className="text-sm font-black font-mono text-purple-900">{classSummary.firstDiv}</span>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-amber-800 block">पूरक (Suppl.)</span>
                <span className="text-sm font-black font-mono text-amber-900">{classSummary.suppl}</span>
              </div>
              <div className="bg-red-50 border border-red-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-red-800 block">अनुत्तीर्ण (Fail)</span>
                <span className="text-sm font-black font-mono text-red-900">{classSummary.failed}</span>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-blue-800 block">कक्षा औसत अंक</span>
                <span className="text-sm font-black font-mono text-blue-900">{classSummary.avgPer}%</span>
              </div>
              <div className="bg-amber-100 border border-amber-400 rounded-lg p-1.5 col-span-2 sm:col-span-1 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-amber-950 block">कक्षा टॉपर (1st)</span>
                <span className="text-xs font-black truncate block text-amber-950">
                  {classSummary.topper ? `${classSummary.topper.name} (${classSummary.topper.percentage}%)` : '-'}
                </span>
              </div>
            </div>

            {/* Results Table - Optimized for A4 Landscape / Portrait */}
            <div className="border border-slate-700 rounded-lg overflow-x-auto print:overflow-visible print:border-black print:rounded-none">
              <table className={`w-full text-left border-collapse ${scaleClass} table-auto`}>
                <thead className="bg-slate-800 text-white font-extrabold print:bg-slate-200 print:text-black">
                  <tr>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-8`}>क्र.</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-14`}>Roll No</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-14`}>Scholar</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black min-w-[130px]`}>विद्यार्थी का नाम</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black min-w-[120px]`}>पिता का नाम</th>
                    
                    {/* Dynamic Subjects */}
                    {classSubjects.map((sub) => (
                      <th
                        key={sub.name}
                        className={`${tablePadding} border-r border-slate-600 print:border-black text-center min-w-[55px]`}
                        title={`${sub.name} (Max: ${sub.maxMarks})`}
                      >
                        <div className="truncate font-bold">{sub.name}</div>
                        <span className="text-[8.5px] opacity-80 block font-mono">({sub.maxMarks})</span>
                      </th>
                    ))}

                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-16`}>प्राप्तांक</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-14`}>प्रतिशत</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-16`}>परिणाम</th>
                    <th className={`${tablePadding} text-center w-12`}>रैंक</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 print:divide-slate-800 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9 + classSubjects.length} className="py-6 text-center text-slate-500 italic">
                        इस कक्षा में चयनित फिल्टर अनुसार कोई विद्यार्थी परिणाम उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const exam = s[selectedExam];
                      const marksMap: Record<string, { total: any; isFail?: boolean }> = {};
                      if (exam && exam.rows) {
                        exam.rows.forEach((r) => {
                          const numTotal = typeof r.total === 'number' ? r.total : parseFloat(String(r.total));
                          const isFail = r.isTheoryFailed || (!isNaN(numTotal) && numTotal < r.minMarks);
                          marksMap[r.name.trim()] = { total: r.total, isFail };
                        });
                      }

                      const resStr = exam ? String(exam.result).toUpperCase() : '';
                      const isPass = resStr.includes('PASS') || resStr.includes('FIRST');
                      const isSuppl = resStr.includes('SUPPL');

                      return (
                        <tr
                          key={`${s.scholarNo}-${idx}`}
                          className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80 print:bg-white'}
                        >
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono text-slate-600`}>
                            {idx + 1}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-bold text-blue-700 print:text-black`}>
                            {s.rollNo}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-bold text-slate-900`}>
                            {s.scholarNo}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black font-bold text-slate-950`}>
                            {s.name}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-slate-700`}>
                            {s.fatherName}
                          </td>

                          {/* Dynamic Subject Marks */}
                          {classSubjects.map((sub) => {
                            const markObj = marksMap[sub.name];
                            return (
                              <td
                                key={sub.name}
                                className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono ${
                                  markObj?.isFail ? 'text-red-600 font-bold bg-red-50/60 print:bg-transparent' : 'text-slate-800'
                                }`}
                              >
                                {markObj ? markObj.total : '-'}
                              </td>
                            );
                          })}

                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-bold text-slate-900`}>
                            {exam ? exam.grandTotal : '-'}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-black text-emerald-800 print:text-black`}>
                            {exam ? `${exam.percentage}%` : '-'}
                          </td>
                          <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center`}>
                            {exam ? (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9.5px] font-black ${
                                  isPass
                                    ? 'bg-emerald-100 text-emerald-900 print:bg-transparent print:border print:border-black'
                                    : isSuppl
                                    ? 'bg-amber-100 text-amber-900 print:bg-transparent'
                                    : 'bg-red-100 text-red-900 print:bg-transparent'
                                }`}
                              >
                                {exam.result}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className={`${tablePadding} text-center font-mono font-bold text-slate-700`}>
                            {exam ? exam.classRank : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Signatures Bar */}
            <div className="mt-6 pt-3 border-t-2 border-slate-800 flex items-center justify-between text-xs font-bold text-slate-900 print:mt-4 print:pt-2">
              <div className="text-center w-36 sm:w-48">
                <div className="h-6 flex items-end justify-center">
                  <span className="font-serif italic text-[10px] text-slate-400">Class Teacher</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  हस्ताक्षर कक्षा अध्यापक
                </div>
              </div>

              <div className="text-center w-36 sm:w-48">
                <div className="h-6 flex items-end justify-center">
                  <span className="font-serif italic text-[10px] text-slate-400">Exam Incharge</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  हस्ताक्षर परीक्षा प्रभारी
                </div>
              </div>

              {/* Official Seal in Center */}
              <div className="flex flex-col items-center justify-center select-none" title="माँ दुर्गा उ.मा. विद्यालय - अधिकृत सील">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-indigo-950 ring-1 ring-indigo-950/60 p-0.5 flex items-center justify-center bg-indigo-50/50 print:border-black print:ring-0">
                  <div className="w-full h-full rounded-full border border-dashed border-indigo-700 flex items-center justify-center p-1 bg-white print:border-black">
                    <img src={SCHOOL_LOGO_URL} alt="Seal" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-[7.5px] font-black uppercase text-indigo-950 mt-0.5 print:text-black">अधिकृत सील</span>
              </div>

              <div className="text-center w-36 sm:w-48">
                <div className="h-6 flex items-end justify-center">
                  <span className="font-serif italic text-[10px] text-slate-400">Principal</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  हस्ताक्षर एवं सील संस्था प्राचार्य
                </div>
              </div>
            </div>

            {/* Bottom Print Date & Time Footer (Printed subtly at bottom of sheet) */}
            <div className="mt-3 pt-1 border-t border-slate-300 print:border-black flex items-center justify-between text-[8.5px] sm:text-[9.5px] text-slate-600 print:text-black font-mono">
              <span>
                प्रिंट दिनांक एवं समय: <b>{getCurrentPrintTimestamp()}</b>
              </span>
              <span>
                {SCHOOL_INFO.schoolName} (डाइस: {SCHOOL_INFO.diceCode})
              </span>
              <span>
                कक्षा {selectedClass} • कुल {classStudents.length} परीक्षार्थी
              </span>
            </div>

          </div>
        ) : (
          /* ========================================================== */
          /* MODE 2: BULK MARKSHEETS PRINT (1 A4 PAGE PER STUDENT)      */
          /* ========================================================== */
          <div className="space-y-6 print:space-y-0">
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 text-center font-bold print:hidden max-w-4xl mx-auto mb-4">
              🖨️ <b>थोक अंकसूची प्रिंट मोड:</b> कक्षा <b>{selectedClass}</b> के सभी {classStudents.length} विद्यार्थियों की अधिकृत अंकसूची नीचे क्रमबद्ध है। प्रिंट बटन दबाने पर प्रत्येक छात्र की अंकसूची अलग A4 पृष्ठ पर प्रिंट होगी।
            </div>

            {classStudents.map((student, idx) => (
              <div key={`${student.scholarNo}-${idx}`} className="bulk-card-item mb-6 print:mb-0">
                <OfficialReportCard
                  student={student}
                  onPrint={handlePrint}
                  lastUpdated={lastUpdated}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
