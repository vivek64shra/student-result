import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Printer, 
  Download, 
  Share2, 
  ArrowLeft, 
  LogOut, 
  UserCheck, 
  CalendarX2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CalendarDays,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';
import { 
  getStudentAbsenteeSummary, 
  fetchLiveStudentAttendance,
  subscribeToStudentAttendance,
  AbsentDateRecord,
  CURRENT_SESSION 
} from '../utils/attendanceGenerator';
import { parseAnyDate } from '../utils/firebase';
import { downloadElementAsJpg, shareElementAsJpg } from '../utils/imageExporter';

interface StudentAttendanceViewProps {
  student: ParsedStudent;
  onBack?: () => void;
  onLogout?: () => void;
  lastUpdated?: string;
  isAdmin?: boolean;
}

// Academic session months for session 2026-27 (जुलाई 2026 से अप्रैल 2027)
const SESSION_MONTHS = [
  { id: '2026-07', name: 'जुलाई 2026', shortName: 'जुलाई', year: 2026, month: 7 },
  { id: '2026-08', name: 'अगस्त 2026', shortName: 'अगस्त', year: 2026, month: 8 },
  { id: '2026-09', name: 'सितम्बर 2026', shortName: 'सितम्बर', year: 2026, month: 9 },
  { id: '2026-10', name: 'अक्टूबर 2026', shortName: 'अक्टूबर', year: 2026, month: 10 },
  { id: '2026-11', name: 'नवम्बर 2026', shortName: 'नवम्बर', year: 2026, month: 11 },
  { id: '2026-12', name: 'दिसम्बर 2026', shortName: 'दिसम्बर', year: 2026, month: 12 },
  { id: '2027-01', name: 'जनवरी 2027', shortName: 'जनवरी', year: 2027, month: 1 },
  { id: '2027-02', name: 'फ़रवरी 2027', shortName: 'फ़रवरी', year: 2027, month: 2 },
  { id: '2027-03', name: 'मार्च 2027', shortName: 'मार्च', year: 2027, month: 3 },
  { id: '2027-04', name: 'अप्रैल 2027', shortName: 'अप्रैल', year: 2027, month: 4 },
];

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  student,
  onBack,
  onLogout,
  lastUpdated = '12-Oct-2026',
  isAdmin = false,
}) => {
  const [summary, setSummary] = useState(() => getStudentAbsenteeSummary(student));
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);

  // Advanced View Modes: 'datewise' | 'monthwise' | 'monthdrill'
  const [viewMode, setViewMode] = useState<'datewise' | 'monthwise' | 'monthdrill'>('datewise');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({
    '2026-10': true,
    '2026-09': true,
  });

  // Background fetch attendance using scholar number strictly
  useEffect(() => {
    let isMounted = true;

    fetchLiveStudentAttendance(student)
      .then((res) => {
        if (isMounted && res) {
          setSummary(res);
        }
      })
      .catch(() => {});

    const unsubscribe = subscribeToStudentAttendance(student.scholarNo, (updated) => {
      if (isMounted && updated) {
        setSummary({
          scholarNo: student.scholarNo,
          rollNo: student.rollNo,
          studentName: student.name,
          fatherName: student.fatherName,
          className: student.className,
          academicSession: CURRENT_SESSION,
          absentDates: updated.absentDates,
          totalAbsentDays: updated.totalAbsentDays,
          hasAbsenceRecorded: updated.totalAbsentDays > 0,
          isLoading: false,
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [student.scholarNo]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJpg = async () => {
    await downloadElementAsJpg(
      'student-absentee-printable-card',
      `Absent_Report_${student.scholarNo}_${student.name.replace(/\s+/g, '_')}`,
      setIsDownloadingJpg
    );
  };

  const handleWhatsAppShare = async () => {
    const fileName = `Absent_Report_${student.scholarNo}_${student.name.replace(/\s+/g, '_')}.jpg`;
    const shareTitle = `${SCHOOL_INFO.schoolName} - छात्र अनुपस्थिति विवरण`;
    
    let absentDatesText = '';
    if (summary.absentDates.length > 0) {
      absentDatesText = summary.absentDates.map((d, i) => `${i + 1}. दिनांक: ${d.date} (${d.dayName}) - ${d.reason}`).join('\n');
    } else {
      absentDatesText = 'वर्तमान सत्र में कोई अनुपस्थिति दर्ज नहीं है (0 दिन)। विद्यार्थी नियमित उपस्थित है अथवा विद्यालय अवकाश मान्य है।';
    }

    const shareText = 
      `📋 विद्यार्थी: ${student.name}\n` +
      `स्कॉलर नं.: ${student.scholarNo} | रोल नं.: ${student.rollNo}\n` +
      `कक्षा: ${student.className}\n` +
      `कुल अनुपस्थित दिन: ${summary.totalAbsentDays}\n\n` +
      `अनुपस्थिति विवरण:\n${absentDatesText}\n\n` +
      `${SCHOOL_INFO.schoolName}`;

    await shareElementAsJpg(
      'student-absentee-printable-card',
      fileName,
      shareTitle,
      shareText,
      setIsSharingWhatsApp
    );
  };

  // Helper to get month ID (e.g. "2026-10") from date string
  const getRecordMonthId = (dateStr: string): string => {
    const d = parseAnyDate(dateStr);
    if (!d || isNaN(d.getTime())) return 'unknown';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const getRecordMonthName = (dateStr: string): string => {
    const monthId = getRecordMonthId(dateStr);
    const found = SESSION_MONTHS.find((m) => m.id === monthId);
    if (found) return found.name;
    const d = parseAnyDate(dateStr);
    if (d && !isNaN(d.getTime())) {
      const monthNames = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];
      return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    }
    return 'अन्य माह';
  };

  // Group absences by Academic Session Month
  const monthWiseGroups = useMemo(() => {
    const map = new Map<string, { monthInfo: typeof SESSION_MONTHS[0]; records: AbsentDateRecord[] }>();

    SESSION_MONTHS.forEach((m) => {
      map.set(m.id, { monthInfo: m, records: [] });
    });

    summary.absentDates.forEach((rec) => {
      const mId = getRecordMonthId(rec.date);
      if (map.has(mId)) {
        map.get(mId)!.records.push(rec);
      } else {
        const dynamicMonth = {
          id: mId,
          name: getRecordMonthName(rec.date),
          shortName: getRecordMonthName(rec.date).split(' ')[0],
          year: parseAnyDate(rec.date)?.getFullYear() || 2026,
          month: (parseAnyDate(rec.date)?.getMonth() || 0) + 1,
        };
        map.set(mId, { monthInfo: dynamicMonth, records: [rec] });
      }
    });

    return Array.from(map.values());
  }, [summary.absentDates]);

  // Peak absence month calculation
  const peakMonth = useMemo(() => {
    let max = 0;
    let monthName = 'कोई नहीं';
    monthWiseGroups.forEach((g) => {
      if (g.records.length > max) {
        max = g.records.length;
        monthName = `${g.monthInfo.name} (${max} दिन)`;
      }
    });
    return max > 0 ? monthName : 'कोई नहीं (0 दिन)';
  }, [monthWiseGroups]);

  // Filtered date records
  const filteredAbsentDates = useMemo(() => {
    return summary.absentDates.filter((r) => {
      const matchesSearch = 
        !searchFilter.trim() || 
        r.date.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.dayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(searchFilter.toLowerCase());

      const matchesMonth = 
        selectedMonthFilter === 'all' || 
        getRecordMonthId(r.date) === selectedMonthFilter;

      return matchesSearch && matchesMonth;
    });
  }, [summary.absentDates, searchFilter, selectedMonthFilter]);

  const toggleMonthExpand = (monthId: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthId]: !prev[monthId],
    }));
  };

  return (
    <div className="max-w-[960px] mx-auto pb-12">
      
      {/* Top Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 print:hidden">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>← मुख्य विकल्प</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट विवरण (A4)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJpg}
            disabled={isDownloadingJpg}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="अनुपस्थिति विवरण को A4 JPG फोटो फॉर्मेट में सीधे डाउनलोड करें"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingJpg ? 'JPG बन रहा है...' : 'JPG डाउनलोड (A4)'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            disabled={isSharingWhatsApp}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="अनुपस्थिति विवरण WhatsApp पर भेजें"
          >
            <Share2 className="w-4 h-4" />
            <span>{isSharingWhatsApp ? 'शेयर हो रहा है...' : 'WhatsApp शेयर'}</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>लॉगआउट</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Advanced View Switcher Tabs (Hidden in Print) */}
      <div className="mb-4 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('datewise')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'datewise'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1. दिनांकवार अनुपस्थिति सूची</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('monthwise')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'monthwise'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. माहवार अनुपस्थिति सारांश</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('monthdrill')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'monthdrill'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>3. माह + दिनांक विस्तार दृश्य</span>
          </button>
        </div>

        {/* View mode indicator */}
        <div className="text-[11px] text-slate-600 font-semibold px-2">
          कुल अनुपस्थित दिन: <b className="text-red-600 font-mono text-sm">{summary.totalAbsentDays}</b>
        </div>
      </div>

      {/* Search and Month Filter Bar (Only active in screen view, hidden in print) */}
      {viewMode === 'datewise' && (
        <div className="mb-3.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="दिनांक, दिन (सोमवार आदि) या कारण खोजें..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-bold text-slate-600">माह फिल्टर:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">सभी माह (सत्र 2026-27)</option>
              {SESSION_MONTHS.map((m) => {
                const count = summary.absentDates.filter((r) => getRecordMonthId(r.date) === m.id).length;
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} {count > 0 ? `(${count} दिन अनुपस्थित)` : '(उपलब्ध नहीं / अवकाश)'}
                  </option>
                );
              })}
            </select>
            {selectedMonthFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedMonthFilter('all')}
                className="px-2 py-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                रीसेट
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE CARD: OFFICIAL STUDENT ABSENTEE RECORD                          */}
      {/* ========================================================================= */}
      <div 
        id="student-absentee-printable-card"
        className="bg-white border-2 border-slate-700 rounded-2xl p-4 sm:p-7 shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:w-full relative overflow-hidden"
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.025] select-none z-0">
          <img src={SCHOOL_LOGO_URL} alt="watermark" className="w-[420px] h-[420px] object-contain filter grayscale" />
        </div>

        {/* 1. Official School Header */}
        <div className="border-b-2 border-slate-800 pb-3 mb-3 text-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 border-2 border-amber-500 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={SCHOOL_LOGO_URL}
                alt="School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-base sm:text-2xl font-black text-[#d93025] leading-tight print:text-xl">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-[10.5px] sm:text-xs font-semibold text-slate-600 print:text-[10px]">
                {SCHOOL_INFO.location} | मान्यता प्राप्त शिक्षा संस्थान • डाइस कोड: {SCHOOL_INFO.diceCode}
              </p>
            </div>
          </div>

          <div className="mt-1.5 inline-flex flex-col items-center">
            <div className="px-4 py-1 rounded-full bg-slate-900 text-white font-black text-xs sm:text-sm tracking-wide shadow-xs print:bg-black print:text-white">
              छात्र अनुपस्थिति विवरण पत्रक (OFFICIAL ABSENTEE RECORD)
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 mt-0.5">
              शैक्षणिक सत्र: <b>{summary.academicSession}</b> | अद्यतन: <b>{lastUpdated}</b>
            </span>
          </div>
        </div>

        {/* 2. Student Info Card */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3.5 mb-4 relative z-10 print:bg-white print:border-black">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">विद्यार्थी का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase truncate block">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">पिता का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase truncate block">{student.fatherName || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">स्कॉलर / रोल नं.:</span>
              <strong className="text-blue-700 font-mono font-black">{student.scholarNo} / {student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">कक्षा (Class):</span>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 font-black rounded text-xs print:bg-transparent print:p-0">
                {student.className || 'सामान्य'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 relative z-10">
          <div className={`p-3 rounded-xl border-2 text-center ${
            summary.totalAbsentDays > 0 
              ? 'bg-red-50/80 border-red-300 text-red-950' 
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          }`}>
            <span className="text-[10px] sm:text-xs font-bold block">कुल अनुपस्थित दिन</span>
            <div className="text-xl sm:text-3xl font-black font-mono my-0.5">
              {summary.totalAbsentDays}
            </div>
            <span className="text-[9.5px] sm:text-[10.5px] font-semibold">
              {summary.totalAbsentDays > 0 ? 'सत्र 2026-27' : '100% नियमित'}
            </span>
          </div>

          <div className="p-3 rounded-xl border-2 border-slate-300 bg-slate-50 text-center flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">सर्वाधिक अनुपस्थिति माह</span>
            <div className="text-xs sm:text-sm font-black text-slate-900 mt-1 truncate">
              {peakMonth}
            </div>
            <span className="text-[9.5px] text-slate-500 mt-0.5">अधिकतम अनुपस्थित</span>
          </div>

          <div className="p-3 rounded-xl border-2 border-slate-300 bg-slate-50 text-center flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">अंतिम अनुपस्थिति दिनांक</span>
            <div className="text-xs sm:text-sm font-black text-blue-800 font-mono mt-1">
              {summary.absentDates.length > 0 
                ? summary.absentDates[summary.absentDates.length - 1].date 
                : 'कोई नहीं'}
            </div>
            <span className="text-[9.5px] text-slate-500 mt-0.5">हालिया अनुपस्थिति</span>
          </div>

          <div className="p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 text-center flex flex-col justify-center">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-900 block">उपस्थिति प्रमाणीकरण</span>
            <div className="text-xs sm:text-sm font-black text-emerald-800 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>सत्यापित अभिलेख</span>
            </div>
            <span className="text-[9.5px] text-emerald-700 mt-0.5">सत्र {summary.academicSession}</span>
          </div>
        </div>

        {/* Policy & Holiday Notice (Clarification requested by user) */}
        <div className="mb-3.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-[11px] relative z-10 flex items-start gap-2 print:border-black">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 print:hidden" />
          <p className="leading-relaxed">
            <b>अवकाश एवं उपस्थिति नियम:</b> यदि किसी दिवस छात्र की उपस्थिति/अनुपस्थिति प्रविष्टि दर्ज नहीं है, तो उस दिवस को विद्यालय अवकाश (Holiday / Sunday / पर्व अवकाश) अथवा नियमित उपस्थिति मान्य किया गया है।
          </p>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE VIEW 1: DATE-WISE ABSENCE LIST                                */}
        {/* ========================================================================= */}
        {(viewMode === 'datewise' || typeof window === 'undefined') && (
          <div className="mb-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>दिनांकवार अनुपस्थिति विवरण (Date-wise Absent Log)</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 print:hidden">
                कुल प्रविष्टियाँ: {filteredAbsentDates.length}
              </span>
            </div>

            {filteredAbsentDates.length > 0 ? (
              <div className="border-2 border-slate-700 rounded-xl overflow-hidden print:border-black print:rounded-none">
                <table className="w-full text-left text-xs sm:text-sm border-collapse print:text-[11px]">
                  <thead>
                    <tr className="bg-slate-800 text-white font-extrabold print:bg-slate-200 print:text-black">
                      <th className="py-2 px-3 border-r border-slate-600 print:border-black text-center w-12">क्र.</th>
                      <th className="py-2 px-3.5 border-r border-slate-600 print:border-black">अनुपस्थिति दिनांक (Date)</th>
                      <th className="py-2 px-3 border-r border-slate-600 print:border-black">दिन (Day)</th>
                      <th className="py-2 px-3 border-r border-slate-600 print:border-black text-center text-red-300 print:text-black">माह</th>
                      <th className="py-2 px-3 border-r border-slate-600 print:border-black text-center">स्थिति</th>
                      <th className="py-2 px-3.5">कारण / विवरण (Reason)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 print:divide-slate-800">
                    {filteredAbsentDates.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50/40 print:bg-white'}>
                        <td className="py-2 px-3 border-r border-slate-300 print:border-black text-center font-mono text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3.5 border-r border-slate-300 print:border-black font-mono font-bold text-slate-900">
                          {item.date}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 print:border-black font-semibold text-slate-700">
                          {item.dayName}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 print:border-black text-center text-slate-700 font-medium">
                          {getRecordMonthName(item.date).split(' ')[0]}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-300 print:border-black text-center">
                          <span className="inline-block px-2 py-0.5 bg-red-100 text-red-900 font-extrabold text-[11px] rounded print:border print:border-black">
                            अनुपस्थित (A)
                          </span>
                        </td>
                        <td className="py-2 px-3.5 text-slate-800 font-medium">
                          {item.reason || 'अनुपस्थित (बिना पूर्व सूचना)'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-2 border-dashed border-amber-300 bg-amber-50/60 rounded-2xl p-6 text-center my-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                  <AlertCircle className="w-6 h-6 text-amber-700" />
                </div>
                <h4 className="text-base font-black text-amber-950 mb-1">
                  यह सुविधा इस महीने उपलब्ध नहीं थी। असुविधा के लिए खेद है।
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 max-w-md mx-auto">
                  सत्र <b>{summary.academicSession}</b> में इस अवधि का कोई अनुपस्थिति रिकॉर्ड दर्ज नहीं है। अन्य दिवसों में विद्यार्थी उपस्थित था अथवा उस दिन विद्यालय अवकाश (Holiday) मान्य है।
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE VIEW 2: MONTH-WISE BREAKDOWN & DRILL-DOWN                     */}
        {/* ========================================================================= */}
        {viewMode === 'monthwise' && (
          <div className="mb-4 relative z-10 print:hidden">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>माहवार अनुपस्थिति सारांश (Month-wise Absentee Summary)</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                सत्र {summary.academicSession}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {monthWiseGroups.map((group) => {
                const isExpanded = Boolean(expandedMonths[group.monthInfo.id]);
                const count = group.records.length;
                return (
                  <div 
                    key={group.monthInfo.id}
                    className={`rounded-2xl border-2 transition-all overflow-hidden ${
                      count > 0 
                        ? 'border-red-200 bg-red-50/30' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Month Header Card */}
                    <div 
                      onClick={() => toggleMonthExpand(group.monthInfo.id)}
                      className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          count > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-slate-900 text-xs sm:text-sm font-extrabold block">
                            {group.monthInfo.name}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {count > 0 
                              ? `${count} कार्य दिवस अनुपस्थित` 
                              : 'यह सुविधा इस महीने उपलब्ध नहीं थी / अवकाश'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {count > 0 ? (
                          <span className="px-2.5 py-1 rounded-full font-black text-xs font-mono bg-red-600 text-white">
                            {count} दिन
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10.5px] bg-amber-100 text-amber-900 border border-amber-300">
                            उपलब्ध नहीं
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Drill-down dates inside the month */}
                    {isExpanded && (
                      <div className="p-3 bg-white border-t border-slate-200 text-xs">
                        {count > 0 ? (
                          <div className="space-y-1.5">
                            {group.records.map((r, i) => (
                              <div 
                                key={r.id || i}
                                className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md bg-red-100 text-red-700 font-mono font-bold text-[10px] flex items-center justify-center">
                                    {i + 1}
                                  </span>
                                  <div>
                                    <strong className="text-slate-900 font-mono font-extrabold">{r.date}</strong>
                                    <span className="text-slate-600 text-[11px] ml-1.5">({r.dayName})</span>
                                  </div>
                                </div>
                                <span className="text-slate-700 font-medium text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {r.reason || 'अनुपस्थित'}
                                </span>
                              </div>
                            ))}
                            <p className="text-[10px] text-slate-500 pt-1 italic">
                              * शेष दिवसों में छात्र उपस्थित रहा अथवा उस दिन विद्यालय अवकाश था।
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-center">
                            <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-amber-950 mb-0.5">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>यह सुविधा इस महीने उपलब्ध नहीं थी। असुविधा के लिए खेद है।</span>
                            </div>
                            <p className="text-[10.5px] text-amber-800">
                              (इस माह में डिजिटल उपस्थिति दर्ज नहीं की गई है अथवा विद्यालय अवकाश मान्य है)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE VIEW 3: MONTH + DATE CHIPS DRILL-DOWN                         */}
        {/* ========================================================================= */}
        {viewMode === 'monthdrill' && (
          <div className="mb-4 relative z-10 print:hidden">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>माहवार दिनांक ग्रिड दृश्य (Month & Date Chips Matrix)</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">
                सत्र {summary.academicSession}
              </span>
            </div>

            <div className="space-y-3">
              {monthWiseGroups.map((group) => {
                const count = group.records.length;
                return (
                  <div 
                    key={group.monthInfo.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {group.monthInfo.name}
                        </strong>
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          count > 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {count > 0 ? `${count} दिन अनुपस्थित` : 'उपलब्ध नहीं / अवकाश'}
                        </span>
                      </div>
                    </div>

                    {count > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {group.records.map((r) => (
                          <div
                            key={r.id}
                            className="px-2.5 py-1.5 bg-white border border-red-200 rounded-xl shadow-2xs flex items-center gap-2 text-xs"
                            title={r.reason}
                          >
                            <CalendarX2 className="w-3.5 h-3.5 text-red-600" />
                            <strong className="font-mono text-slate-900">{r.date}</strong>
                            <span className="text-slate-600 font-semibold text-[11px]">({r.dayName})</span>
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-700 text-[10px] rounded font-bold">
                              {r.reason ? r.reason.slice(0, 20) : 'अनुपस्थित'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>यह सुविधा इस महीने उपलब्ध नहीं थी। असुविधा के लिए खेद है। (विद्यालय अवकाश)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALWAYS INCLUDED IN PRINT: Official Month-wise Summary Table */}
        <div className="hidden print:block mb-4 relative z-10">
          <h3 className="text-xs font-black text-slate-900 mb-1">
            माहवार अनुपस्थिति सारांश (Month-wise Absentee Summary)
          </h3>
          <table className="w-full text-left text-[11px] border-collapse border border-black mb-3">
            <thead>
              <tr className="bg-slate-200 text-black font-extrabold">
                <th className="py-1 px-2 border border-black text-center">क्र.</th>
                <th className="py-1 px-2 border border-black">माह (Month)</th>
                <th className="py-1 px-2 border border-black text-center">अनुपस्थित दिन</th>
                <th className="py-1 px-2 border border-black">स्थिति / टिप्पणी</th>
              </tr>
            </thead>
            <tbody>
              {monthWiseGroups.map((group, idx) => (
                <tr key={group.monthInfo.id}>
                  <td className="py-1 px-2 border border-black text-center font-mono">{idx + 1}</td>
                  <td className="py-1 px-2 border border-black font-bold">{group.monthInfo.name}</td>
                  <td className="py-1 px-2 border border-black text-center font-bold font-mono">
                    {group.records.length}
                  </td>
                  <td className="py-1 px-2 border border-black">
                    {group.records.length > 0 
                      ? `${group.records.length} दिन अनुपस्थित (${group.records.map((r) => r.date).join(', ')})`
                      : 'यह सुविधा इस महीने उपलब्ध नहीं थी (विद्यालय अवकाश)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Official Signatures and School Seal */}
        <div className="mt-5 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-3 relative z-10 border-t border-slate-300 print:border-black print:mt-2 print:pt-1">
          <div className="text-center w-28 sm:w-44">
            <div className="h-6 sm:h-8 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Class Teacher</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[10.5px] sm:text-xs">
              कक्षाध्यापक हस्ताक्षर
            </div>
          </div>

          {/* School Stamp Embellishment */}
          <div className="flex flex-col items-center justify-center select-none" title="माँ दुर्गा उ.मा. विद्यालय - उपस्थिति प्रमाणीकरण मुद्रा">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-slate-900 ring-1 ring-slate-900/60 p-0.5 flex items-center justify-center bg-slate-50 shadow-2xs print:border-black print:ring-0">
              <div className="w-full h-full rounded-full border border-dashed border-slate-700 flex items-center justify-center p-1 bg-white print:border-black">
                <img
                  src={SCHOOL_LOGO_URL}
                  alt="School Logo Stamp"
                  className="w-full h-full object-contain opacity-95"
                />
              </div>
            </div>
            <span className="text-[7px] sm:text-[8px] font-black text-slate-950 mt-0.5 tracking-tight uppercase print:text-black">
              अधिकृत मुद्रा (SEAL)
            </span>
          </div>

          <div className="text-center w-28 sm:w-44">
            <div className="h-6 sm:h-8 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Principal</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[10.5px] sm:text-xs">
              प्राचार्य हस्ताक्षर
            </div>
          </div>
        </div>

        {/* 6. Bottom Footer */}
        <div className="mt-3 pt-1 border-t border-slate-200 print:border-black flex items-center justify-between text-[8px] sm:text-[9.5px] text-slate-500 print:text-black font-mono">
          <span>
            प्रिंट दिनांक: <b>{new Date().toLocaleString('hi-IN')}</b>
          </span>
          <span className="hidden sm:inline print:inline font-sans">
            {SCHOOL_INFO.schoolName} (स्कॉलर: {student.scholarNo})
          </span>
          <span>
            अधिकृत अनुपस्थिति अभिलेख
          </span>
        </div>

      </div>

    </div>
  );
};
