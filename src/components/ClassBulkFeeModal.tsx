import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  X, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  CreditCard
} from 'lucide-react';
import { 
  ParsedStudent, 
  SCHOOL_INFO, 
  SCHOOL_LOGO_URL, 
  getCurrentPrintTimestamp,
  compareClassNames
} from '../utils/reportCardParser';
import { downloadElementAsJpg } from '../utils/imageExporter';
import { 
  StudentFeeRecord, 
  formatINR, 
  getAcademicSessionInfo, 
  findStudentFeeRecord 
} from '../utils/feesParser';
import { StudentFeesView } from './StudentFeesView';

interface ClassBulkFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: ParsedStudent[];
  fees: StudentFeeRecord[];
  initialClass?: string;
  lastUpdated?: string;
}

export const ClassBulkFeeModal: React.FC<ClassBulkFeeModalProps> = ({
  isOpen,
  onClose,
  students,
  fees,
  initialClass = 'ALL',
  lastUpdated,
}) => {
  const [printOrientation, setPrintOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [printScale, setPrintScale] = useState<'compact' | 'normal'>('compact');
  const [viewMode, setViewMode] = useState<'ledger' | 'bulk-slips'>('ledger');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'CLEARED'>('ALL');
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

  const sessionInfo = getAcademicSessionInfo();

  // Distinct class list from students and fees
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      const cls = s.className || s.sheetName;
      if (cls) set.add(cls);
    });
    fees.forEach((f) => {
      if (f.className) set.add(f.className);
    });
    return Array.from(set).sort(compareClassNames);
  }, [students, fees]);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (initialClass !== 'ALL' && classList.includes(initialClass)) {
      return initialClass;
    }
    return classList[0] || '1';
  });

  // Students in selected class merged with their fee records
  const classRows = useMemo(() => {
    const list = students.filter((s) => (s.className || s.sheetName) === selectedClass);

    return list.map((student) => {
      const fee = findStudentFeeRecord(fees, student.scholarNo, student.rollNo, student.name);
      const totalOldDue = (fee?.prevYearDue || 0) + (fee?.aprilOldDueFee || 0);
      const grandTotal = fee?.grandTotal || 0;
      const renewableFee = fee?.renewableFee || 0;
      const tuitionFee = fee?.totalTuition || 0;
      const conveyanceFee = fee?.totalConveyance || 0;
      const currentSessionTotal = Math.max(0, grandTotal - totalOldDue);

      return {
        student,
        fee,
        totalOldDue,
        renewableFee,
        tuitionFee,
        conveyanceFee,
        currentSessionTotal,
        grandTotal,
        hasDues: grandTotal > 0,
      };
    }).sort((a, b) => {
      const rollA = parseInt(a.student.rollNo, 10);
      const rollB = parseInt(b.student.rollNo, 10);
      if (!isNaN(rollA) && !isNaN(rollB)) return rollA - rollB;
      return a.student.scholarNo.localeCompare(b.student.scholarNo, undefined, { numeric: true });
    });
  }, [students, fees, selectedClass]);

  // Filtered by status
  const filteredRows = useMemo(() => {
    if (statusFilter === 'DUE') return classRows.filter((r) => r.hasDues);
    if (statusFilter === 'CLEARED') return classRows.filter((r) => !r.hasDues);
    return classRows;
  }, [classRows, statusFilter]);

  // Aggregate stats for this class
  const classSummary = useMemo(() => {
    const totalStudents = classRows.length;
    let studentsWithDues = 0;
    let sumOldDues = 0;
    let sumRenewable = 0;
    let sumTuition = 0;
    let sumConveyance = 0;
    let sumGrandTotal = 0;

    classRows.forEach((r) => {
      if (r.hasDues) studentsWithDues++;
      sumOldDues += r.totalOldDue;
      sumRenewable += r.renewableFee;
      sumTuition += r.tuitionFee;
      sumConveyance += r.conveyanceFee;
      sumGrandTotal += r.grandTotal;
    });

    return {
      totalStudents,
      studentsWithDues,
      sumOldDues,
      sumRenewable,
      sumTuition,
      sumConveyance,
      sumGrandTotal,
    };
  }, [classRows]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJpg = async () => {
    await downloadElementAsJpg(
      'class-bulk-fee-container',
      `Class_${selectedClass}_Bulk_Fees_Ledger_${sessionInfo.session}`,
      setIsDownloadingJpg
    );
  };

  // CSV Export
  const handleExportCsv = () => {
    if (classRows.length === 0) return;

    const headers = [
      'क्रमांक',
      'स्कॉलर नं.',
      'रोल नं.',
      'विद्यार्थी का नाम',
      'पिता का नाम',
      'कक्षा',
      'गत वर्ष पुराना बकाया (₹)',
      'वार्षिक नवीनीकरण शुल्क (₹)',
      'शिक्षण शुल्क (₹)',
      'वाहन शुल्क (₹)',
      'कुल देय शुल्क (₹)',
      'शुल्क स्थिति',
    ];

    const rows = classRows.map((r, idx) => [
      idx + 1,
      `"${r.student.scholarNo}"`,
      `"${r.student.rollNo}"`,
      `"${r.student.name}"`,
      `"${r.student.fatherName}"`,
      `"${selectedClass}"`,
      r.totalOldDue,
      r.renewableFee,
      r.tuitionFee,
      r.conveyanceFee,
      r.grandTotal,
      r.hasDues ? '"बकाया देय"' : '"पूर्ण जमा (₹0)"',
    ]);

    const csvContent =
      '\uFEFF' +
      `"माँ दुर्गा उच्चतर माध्यमिक विद्यालय, सेमरिया (रीवा)"\n` +
      `"कक्षावार थोक शुल्क मांग रजिस्टर: कक्षा ${selectedClass} - शैक्षणिक सत्र ${sessionInfo.session}"\n` +
      `"प्रिंट दिनांक: ${getCurrentPrintTimestamp()}"\n\n` +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Class_${selectedClass}_Bulk_Fees_Ledger_${sessionInfo.session}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scaleClass =
    printScale === 'compact'
      ? 'text-[10px] sm:text-[11px] leading-tight'
      : 'text-[11px] sm:text-xs leading-normal';

  const tablePadding =
    printScale === 'compact'
      ? 'py-1 px-1.5'
      : 'py-1.5 px-2.5';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex flex-col p-1 sm:p-3 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Dynamic print stylesheet for A4 sizing */}
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
          .bulk-slip-item {
            page-break-after: always !important;
            break-after: page !important;
          }
          .bulk-slip-item:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      `}</style>

      {/* Top Floating Control Bar (Hidden during print) */}
      <div className="modal-control-bar bg-slate-900 text-white rounded-2xl p-3 sm:p-4 mb-3 border border-slate-700 shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0 print:hidden">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-black shadow-md shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-slate-950 rounded">
                कक्षावार थोक शुल्क रजिस्टर
              </span>
              <span className="text-xs text-emerald-200">
                A4 प्रिंट • सत्र {sessionInfo.session}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mt-0.5">
              <span>कक्षा: {selectedClass}</span>
              <span className="text-xs font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                कुल छात्र: {classRows.length} (बकाया: {classSummary.studentsWithDues})
              </span>
            </h2>
          </div>
        </div>

        {/* Center Controls: Class, Mode, Orientation, Filter */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Class Select */}
          <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs font-bold text-emerald-200">कक्षा:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-slate-800 text-white font-black text-xs rounded-lg px-2 py-1 outline-none border border-emerald-400 cursor-pointer"
            >
              {classList.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white">
                  कक्षा: {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('ledger')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'ledger' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>थोक शुल्क सारणी</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bulk-slips')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'bulk-slips' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>थोक रसीदें ({classRows.length})</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-950 font-black' : 'text-white/80 hover:text-white'
              }`}
            >
              सभी
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DUE')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'DUE' ? 'bg-amber-400 text-slate-950 font-black' : 'text-amber-200 hover:text-white'
              }`}
            >
              बकाया वाले ({classSummary.studentsWithDues})
            </button>
          </div>

          {/* Orientation */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrintOrientation('landscape')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printOrientation === 'landscape' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              📑 लैंडस्केप
            </button>
            <button
              type="button"
              onClick={() => setPrintOrientation('portrait')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printOrientation === 'portrait' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-white/80 hover:text-white'
              }`}
            >
              📄 पोर्ट्रेट
            </button>
          </div>

          {/* Scale */}
          <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
            <button
              type="button"
              onClick={() => setPrintScale('compact')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printScale === 'compact' ? 'bg-emerald-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              छोटा (85%)
            </button>
            <button
              type="button"
              onClick={() => setPrintScale('normal')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                printScale === 'normal' ? 'bg-emerald-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              सामान्य (100%)
            </button>
          </div>

        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={handleDownloadJpg}
            disabled={isDownloadingJpg}
            className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
            title="कक्षा थोक शुल्क लेजर को A4 JPG फोटो फॉर्मेट में डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingJpg ? 'JPG बन रहा है...' : 'JPG डाउनलोड (A4)'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Excel / CSV डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
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
          /* MODE 1: TABULAR CLASS FEE REGISTER (A4 LEDGER)            */
          /* ========================================================== */
          <div 
            id="class-bulk-fee-container"
            className="printable-sheet-container bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-300 max-w-[1350px] mx-auto print:max-w-none print:p-0 print:border-none print:shadow-none"
          >
            
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
                    डाइस कोड: <b>{SCHOOL_INFO.diceCode}</b> • संस्था कोड: <b>{SCHOOL_INFO.institutionCode}</b> • शैक्षणिक सत्र: <b>{sessionInfo.session}</b>
                  </p>
                  <div className="mt-1 inline-block px-3 py-0.5 bg-emerald-900 text-white text-xs sm:text-sm font-black rounded-md uppercase tracking-wide print:bg-slate-200 print:text-black print:border print:border-black">
                    कक्षावार थोक शुल्क मांग रजिस्टर (FEE DEMAND REGISTER) • कक्षा: {selectedClass}
                  </div>
                </div>
                {/* Official Circular School Logo Seal */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-emerald-950 ring-1 ring-emerald-950/60 p-0.5 flex items-center justify-center bg-emerald-50/50 print:border-black print:ring-0">
                    <div className="w-full h-full rounded-full border border-dashed border-emerald-700 flex items-center justify-center p-1 bg-white print:border-black">
                      <img src={SCHOOL_LOGO_URL} alt="Seal" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <span className="text-[7.5px] font-black uppercase text-emerald-950 mt-0.5 print:text-black">अधिकृत सील</span>
                </div>
              </div>
            </div>

            {/* Quick KPI Digest Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 mb-2.5 text-center text-xs">
              <div className="bg-slate-100 border border-slate-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-slate-600 block">कुल विद्यार्थी</span>
                <span className="text-sm font-black font-mono text-slate-900">{classSummary.totalStudents}</span>
              </div>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-amber-900 block">गत वर्ष पुराना बकाया (1st)</span>
                <span className="text-sm font-black font-mono text-amber-950">{formatINR(classSummary.sumOldDues)}</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-indigo-900 block">वार्षिक नवीनीकरण (2nd)</span>
                <span className="text-sm font-black font-mono text-indigo-950">{formatINR(classSummary.sumRenewable)}</span>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-blue-900 block">शिक्षण शुल्क मांग</span>
                <span className="text-sm font-black font-mono text-blue-950">{formatINR(classSummary.sumTuition)}</span>
              </div>
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-purple-900 block">वाहन/बस शुल्क मांग</span>
                <span className="text-sm font-black font-mono text-purple-950">{formatINR(classSummary.sumConveyance)}</span>
              </div>
              <div className="bg-emerald-100 border border-emerald-400 rounded-lg p-1.5 print:bg-white print:border-black">
                <span className="text-[9.5px] font-bold text-emerald-950 block">कुल देय शुल्क मांग</span>
                <span className="text-sm font-black font-mono text-emerald-950">{formatINR(classSummary.sumGrandTotal)}</span>
              </div>
            </div>

            {/* Fee Table - STRICT ORDER: 1st Previous Due, 2nd Renewable, 3rd Tuition, 4th Conveyance */}
            <div className="border border-slate-700 rounded-lg overflow-x-auto print:overflow-visible print:border-black print:rounded-none">
              <table className={`w-full text-left border-collapse ${scaleClass} table-auto`}>
                <thead className="bg-slate-800 text-white font-extrabold print:bg-slate-200 print:text-black">
                  <tr>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-8`}>क्र.</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-16`}>Scholar</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-center w-14`}>Roll No</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black min-w-[130px]`}>विद्यार्थी का नाम</th>
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black min-w-[120px]`}>पिता का नाम</th>
                    
                    {/* PRIORITY 1: PREVIOUS YEAR OLD DUES */}
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-right w-24 bg-amber-900/60 print:bg-transparent`}>
                      गत वर्ष बकाया (1)
                    </th>

                    {/* PRIORITY 2: ANNUAL RENEWAL FEE */}
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-right w-24 bg-indigo-900/60 print:bg-transparent`}>
                      नवीनीकरण शुल्क (2)
                    </th>

                    {/* TUITION FEE */}
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-right w-24`}>
                      शिक्षण शुल्क
                    </th>

                    {/* CONVEYANCE FEE */}
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-right w-20`}>
                      वाहन शुल्क
                    </th>

                    {/* GRAND TOTAL */}
                    <th className={`${tablePadding} border-r border-slate-600 print:border-black text-right w-28 bg-emerald-900/70 print:bg-transparent`}>
                      कुल देय शुल्क
                    </th>

                    {/* STATUS */}
                    <th className={`${tablePadding} text-center w-20`}>स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 print:divide-slate-800 font-medium">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-slate-500 italic">
                        इस कक्षा में चयनित फिल्टर अनुसार कोई शुल्क रिकॉर्ड उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((r, idx) => (
                      <tr
                        key={`${r.student.scholarNo}-${idx}`}
                        className={
                          r.totalOldDue > 0
                            ? 'bg-amber-50/50 print:bg-white'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50/70 print:bg-white'
                        }
                      >
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono text-slate-600`}>
                          {idx + 1}
                        </td>
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-bold text-slate-900`}>
                          {r.student.scholarNo}
                        </td>
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-center font-mono font-bold text-blue-700 print:text-black`}>
                          {r.student.rollNo}
                        </td>
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black font-bold text-slate-950`}>
                          {r.student.name}
                        </td>
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-slate-700`}>
                          {r.student.fatherName}
                        </td>

                        {/* 1st: Previous Due */}
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-right font-mono font-bold ${
                          r.totalOldDue > 0 ? 'text-amber-950 bg-amber-100/60 print:bg-transparent' : 'text-slate-400'
                        }`}>
                          {r.totalOldDue > 0 ? formatINR(r.totalOldDue) : '₹0'}
                        </td>

                        {/* 2nd: Renewal Fee */}
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-right font-mono font-bold ${
                          r.renewableFee > 0 ? 'text-indigo-950 bg-indigo-50/60 print:bg-transparent' : 'text-slate-400'
                        }`}>
                          {r.renewableFee > 0 ? formatINR(r.renewableFee) : '₹0'}
                        </td>

                        {/* Tuition Fee */}
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-right font-mono text-slate-800`}>
                          {r.tuitionFee > 0 ? formatINR(r.tuitionFee) : '₹0'}
                        </td>

                        {/* Conveyance Fee */}
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-right font-mono text-slate-800`}>
                          {r.conveyanceFee > 0 ? formatINR(r.conveyanceFee) : '₹0'}
                        </td>

                        {/* Grand Total */}
                        <td className={`${tablePadding} border-r border-slate-300 print:border-black text-right font-mono font-black text-emerald-900 bg-emerald-50/60 print:bg-transparent`}>
                          {formatINR(r.grandTotal)}
                        </td>

                        {/* Status */}
                        <td className={`${tablePadding} text-center`}>
                          {r.hasDues ? (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-amber-100 text-amber-950 print:border print:border-black">
                              देय बकाया
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800 print:border print:border-black">
                              ₹0 जमा
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
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
                  <span className="font-serif italic text-[10px] text-slate-400">Accountant</span>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  हस्ताक्षर संस्था लेखापाल
                </div>
              </div>

              {/* Official Seal in Center */}
              <div className="flex flex-col items-center justify-center select-none" title="माँ दुर्गा उ.मा. विद्यालय - अधिकृत सील">
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-emerald-950 ring-1 ring-emerald-950/60 p-0.5 flex items-center justify-center bg-emerald-50/50 print:border-black print:ring-0">
                  <div className="w-full h-full rounded-full border border-dashed border-emerald-700 flex items-center justify-center p-1 bg-white print:border-black">
                    <img src={SCHOOL_LOGO_URL} alt="Seal" className="w-full h-full object-contain" />
                  </div>
                </div>
                <span className="text-[7.5px] font-black uppercase text-emerald-950 mt-0.5 print:text-black">अधिकृत मुद्रा</span>
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

            {/* Bottom Print Date & Time Footer */}
            <div className="mt-3 pt-1 border-t border-slate-300 print:border-black flex items-center justify-between text-[8.5px] sm:text-[9.5px] text-slate-600 print:text-black font-mono">
              <span>
                प्रिंट दिनांक एवं समय: <b>{getCurrentPrintTimestamp()}</b>
              </span>
              <span>
                {SCHOOL_INFO.schoolName} (डाइस: {SCHOOL_INFO.diceCode})
              </span>
              <span>
                कक्षा {selectedClass} • कुल {classRows.length} छात्र शुल्क विवरण
              </span>
            </div>

          </div>
        ) : (
          /* ========================================================== */
          /* MODE 2: BULK INDIVIDUAL FEE SLIPS (1 A4 SLIP PER STUDENT)  */
          /* ========================================================== */
          <div className="space-y-6 print:space-y-0">
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 text-center font-bold print:hidden max-w-4xl mx-auto mb-4">
              🖨️ <b>थोक शुल्क रसीद प्रिंट मोड:</b> कक्षा <b>{selectedClass}</b> के सभी {filteredRows.length} विद्यार्थियों की अधिकृत शुल्क रसीदें नीचे क्रमबद्ध हैं। प्रिंट बटन दबाने पर प्रत्येक छात्र की रसीद अलग A4 पृष्ठ पर प्रिंट होगी।
            </div>

            {filteredRows.map((row, idx) => (
              <div key={`${row.student.scholarNo}-${idx}`} className="bulk-slip-item mb-6 print:mb-0">
                <StudentFeesView
                  student={row.student}
                  feeRecord={row.fee}
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
