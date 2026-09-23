import React from 'react';
import { 
  Printer, 
  School, 
  LogOut, 
  AlertCircle, 
  Calendar, 
  PhoneCall, 
  HelpCircle,
  ArrowLeft,
  Sparkles,
  Globe,
  MessageSquareText,
  ExternalLink
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL, DEFAULT_UPDATE_TIMESTAMP } from '../utils/reportCardParser';
import { MAIN_SCHOOL_WEBSITE_URL } from './LoginPage';

interface OfficialReportCardProps {
  student: ParsedStudent;
  onPrint?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
  onViewFees?: () => void;
  lastUpdated?: string;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({
  student,
  onPrint,
  onLogout,
  onBack,
  onViewFees,
  lastUpdated,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const isExamSectionValid = (section: ParsedStudent['quarterly'] | ParsedStudent['halfYearly'] | ParsedStudent['annual']) => {
    if (!section || !section.rows || section.rows.length === 0) return false;
    const hasAnyScore = section.rows.some((r) => {
      const t = String(r.theory ?? '').trim();
      const p = String(r.project ?? '').trim();
      const tot = String(r.total ?? '').trim();
      return (
        (t !== '' && t !== '-' && t !== '0' && t !== 'null' && t !== 'undefined') ||
        (p !== '' && p !== '-' && p !== '0' && p !== 'null' && p !== 'undefined') ||
        (tot !== '' && tot !== '-' && tot !== '0' && tot !== 'null' && tot !== 'undefined')
      );
    });
    const grandTot = Number(section.grandTotal) || 0;
    return hasAnyScore || grandTot > 0;
  };

  const hasQuarterly = isExamSectionValid(student.quarterly);
  const hasHalfYearly = isExamSectionValid(student.halfYearly);
  const hasAnnual = isExamSectionValid(student.annual);
  const hasAnyExamData = hasQuarterly || hasHalfYearly || hasAnnual;

  const renderExamSection = (section: ParsedStudent['quarterly'] | ParsedStudent['halfYearly'] | ParsedStudent['annual']) => {
    if (!section || section.rows.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6 overflow-hidden rounded-xl border-2 border-slate-700 bg-white/95 shadow-xs relative z-10 print:mb-2 print:border-black print:rounded-none">
        
        {/* Exam Section Header with Logical Theory & Project Max Marks Badges */}
        <div className="bg-gradient-to-r from-[#1258b5] via-[#1a73e8] to-[#1258b5] py-2 px-3 text-white border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-1.5 print:bg-slate-200 print:text-black print:border-black print:py-1">
          <span className="text-xs sm:text-base md:text-lg font-extrabold uppercase tracking-wide">
            {section.title}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] sm:text-xs font-bold">
            <div className="flex items-center gap-1 bg-slate-950/50 border border-white/30 rounded-lg px-2 py-0.5 shadow-xs print:bg-transparent print:border-none print:text-black">
              <span className="text-amber-300 print:text-black">सैद्धांतिक:</span>
              <span className="font-mono text-white print:text-black font-extrabold">
                {section.classTheoryMax || 80} अंक
              </span>
              <span className="text-amber-200/90 text-[9.5px] print:text-black">
                (उत्तीर्णांक: {section.classTheoryMin || 27})
              </span>
            </div>
            {section.hasProject && section.classProjectMax > 0 && (
              <div className="flex items-center gap-1 bg-slate-950/50 border border-white/30 rounded-lg px-2 py-0.5 shadow-xs print:bg-transparent print:border-none print:text-black">
                <span className="text-emerald-300 print:text-black">प्रोजेक्ट:</span>
                <span className="font-mono text-white print:text-black font-extrabold">
                  {section.classProjectMax} अंक
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 1-Page Mobile Optimized Table - NO Horizontal Scroll Needed */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed sm:table-auto border-collapse text-center text-xs sm:text-sm print:text-[10px]">
            <thead>
              <tr className="bg-[#e9edf5] text-slate-900 font-bold border-b border-slate-400 text-xs sm:text-sm print:bg-slate-100 print:text-[10px]">
                {/* Subject column */}
                <th className="border-r border-slate-400 py-2 px-2 text-left w-[44%] sm:w-auto">
                  Subject (विषय)
                </th>

                {/* Poornank & Passing Marks - HIDDEN ON MOBILE as requested */}
                <th className="border-r border-slate-400 py-2 px-1 text-center text-slate-700 hidden sm:table-cell print:table-cell w-16">
                  पूर्णांक
                </th>
                <th className="border-r border-slate-400 py-2 px-1 text-center text-slate-700 hidden sm:table-cell print:table-cell w-20">
                  उत्तीर्णांक
                </th>

                {/* Marks Columns */}
                <th className="border-r border-slate-400 py-2 px-1 text-center w-[26%] sm:w-auto">
                  सैद्धांतिक
                </th>
                {section.hasProject && (
                  <th className="border-r border-slate-400 py-2 px-1 text-center w-[15%] sm:w-auto">
                    प्रोजेक्ट
                  </th>
                )}
                <th className={`py-2 px-1 text-center ${section.hasAnyDistn ? 'border-r border-slate-400' : ''} ${section.hasProject ? 'w-[15%]' : 'w-[30%]'} sm:w-auto`}>
                  प्राप्तांक योग
                </th>
                {section.hasAnyDistn && (
                  <th className="py-2 px-1 text-[#d93025] text-center hidden md:table-cell print:table-cell w-20">
                    विशेष योग्यता
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-900 print:text-[10px]">
              {section.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60 print:bg-white'}>
                  <td className="border-r border-slate-400 py-1.5 px-2 text-left font-bold text-slate-950 truncate">
                    <span>{row.name}</span>
                    {row.isDistn && (
                      <span className="md:hidden ml-1 text-[9px] font-black text-red-600 bg-red-50 px-1 rounded border border-red-200">
                        DISTN
                      </span>
                    )}
                  </td>

                  {/* Poornank & Passing Marks - HIDDEN ON MOBILE */}
                  <td className="border-r border-slate-400 py-1.5 px-1 font-mono text-slate-800 font-bold text-xs hidden sm:table-cell print:table-cell">
                    {row.maxMarks}
                  </td>
                  <td className="border-r border-slate-400 py-1.5 px-1 font-mono text-slate-600 text-xs hidden sm:table-cell print:table-cell">
                    <span>{row.minMarks}</span>
                    {row.projectMaxMarks ? (
                      <span className="text-[9px] text-slate-400 block font-normal print:hidden">
                        (थ्योरी {row.theoryMinMarks})
                      </span>
                    ) : null}
                  </td>

                  <td className="border-r border-slate-400 py-1.5 px-1 font-mono font-bold text-center">
                    {row.isTheoryFailed ? (
                      <div>
                        <span className="text-red-600 font-black">{row.theory || '-'}*</span>
                        <span className="text-[8.5px] text-red-500 block font-semibold print:hidden">
                          (उत्तीर्णांक: {row.theoryMinMarks})
                        </span>
                      </div>
                    ) : (
                      <span>{row.theory || '-'}</span>
                    )}
                    {row.theoryMaxMarks && row.theoryMaxMarks !== row.maxMarks && !row.isTheoryFailed ? (
                      <span className="text-[9px] text-slate-400 block font-normal print:hidden">/{row.theoryMaxMarks}</span>
                    ) : null}
                  </td>
                  {section.hasProject && (
                    <td className="border-r border-slate-400 py-1.5 px-1 font-mono font-medium text-center">
                      <span>{row.project || '-'}</span>
                      {row.projectMaxMarks ? (
                        <span className="text-[9px] text-slate-400 block font-normal print:hidden">/{row.projectMaxMarks}</span>
                      ) : null}
                    </td>
                  )}
                  <td className={`py-1.5 px-1 font-black font-mono text-center ${section.hasAnyDistn ? 'border-r border-slate-400' : ''}`}>
                    {row.isTheoryFailed ? (
                      <div>
                        <span className="text-red-700 font-black">{row.total || '0'}</span>
                        <span className="text-[8.5px] text-red-600 font-bold block print:text-[8px]">(FAIL)</span>
                      </div>
                    ) : (
                      <span className="text-slate-950">{row.total || '0'}</span>
                    )}
                  </td>
                  {section.hasAnyDistn && (
                    <td className="py-1.5 px-1 font-black text-[#d93025] tracking-wider text-center text-xs hidden md:table-cell print:table-cell">
                      {row.isDistn ? 'DISTN' : ''}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Examination Rule Note */}
        {section.hasProject && (
          <div className="px-2.5 py-1 bg-amber-50/80 border-t border-slate-300 text-[10px] sm:text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-1 print:text-[8.5px] print:bg-transparent print:border-slate-400">
            <span>
              * <strong>परीक्षा नियम:</strong> सैद्धांतिक (थ्योरी) पूर्णांक <strong>{section.classTheoryMax}</strong> में <strong>1/3 ({section.classTheoryMin} अंक)</strong> उत्तीर्णांक अनिवार्य है। प्रोजेक्ट पूर्णांक <strong>{section.classProjectMax}</strong> अंक है। कुल विषय उत्तीर्णांक 33 अंक है।
            </span>
          </div>
        )}

        {/* Mobile & Desktop Responsive Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 border-t-2 border-slate-700 bg-gradient-to-r from-slate-100 via-amber-50/40 to-slate-100 p-2 text-xs sm:text-sm font-bold text-slate-800 print:bg-white print:border-black print:p-1 print:text-[10px]">
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/70 px-2 py-1 rounded border border-slate-200 print:border-none print:p-0">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">पूर्णांक:</span>
            <span className="font-mono text-slate-800 font-extrabold">{section.totalMaxMarks}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/70 px-2 py-1 rounded border border-slate-200 print:border-none print:p-0">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">महायोग:</span>
            <span className="font-mono text-indigo-950 font-black text-xs sm:text-sm">{section.grandTotal}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/70 px-2 py-1 rounded border border-slate-200 print:border-none print:p-0">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">प्रतिशत:</span>
            <span className="font-mono text-emerald-800 font-black text-xs sm:text-sm">{section.percentage}%</span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-white/70 px-2 py-1 rounded border border-slate-200 print:border-none print:p-0">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">स्थान:</span>
            <span className="font-mono text-slate-900 font-extrabold">{section.classRank}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-start gap-1 bg-white/70 px-2 py-1 rounded border border-slate-200 print:border-none print:p-0">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">परिणाम:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-black tracking-wider ${
                String(section.result).toUpperCase().includes('PASS') ||
                String(section.result).toUpperCase().includes('FIRST') ||
                String(section.result).toUpperCase().includes('SECOND') ||
                String(section.result).toUpperCase().includes('THIRD') ||
                String(section.result).toUpperCase().includes('DISTINCTION')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 print:border-none print:text-black'
                  : String(section.result).toUpperCase().includes('SUPPL')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 print:border-none print:text-black'
                  : 'bg-red-100 text-[#d93025] border border-red-300 print:border-none print:text-black'
              }`}
            >
              {section.result}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1050px] mx-auto">
      {/* Top Action Bar for Back & Print */}
      <div className="flex items-center justify-between gap-3 mb-3 print:hidden">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← मुख्य विकल्प (Back to Options)</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
        >
          <Printer className="w-4 h-4" />
          <span>अंकसूची प्रिंट करें (Print)</span>
        </button>
      </div>

      <div
        id="marksheet"
        className="official-marksheet relative mx-auto border-2 sm:border-4 border-slate-900 bg-white p-3 sm:p-7 md:p-8 shadow-2xl rounded-2xl print:rounded-none print:border-2 print:border-black print:shadow-none print:p-3 text-slate-900 overflow-hidden font-sans"
      >
        {/* Background Watermark using School Logo */}
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none opacity-[0.04] print:opacity-[0.06]"
          aria-hidden="true"
        >
          <img
            src={SCHOOL_LOGO_URL}
            alt="School Watermark"
            referrerPolicy="no-referrer"
            className="w-[360px] sm:w-[420px] max-w-[70vw] object-contain filter grayscale"
          />
        </div>

        {/* Decorative Golden Inner Border */}
        <div className="relative z-10 border border-amber-600/30 rounded-xl p-2.5 sm:p-4 mb-1 bg-white/80 print:border-none print:p-0">
          {/* Printable School Header */}
          <div className="text-center border-b-2 sm:border-b-4 border-[#1a73e8] pb-2.5 mb-3 print:pb-1.5 print:mb-1.5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-1.5">
              <div className="shrink-0 w-14 h-14 sm:w-18 sm:h-18 p-1 rounded-full bg-white border-2 border-amber-500/80 shadow-md flex items-center justify-center overflow-hidden print:w-12 print:h-12">
                <img
                  src={SCHOOL_LOGO_URL}
                  alt="Maa Durga School Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-base sm:text-2xl font-black text-[#d93025] leading-snug print:text-lg">
                  {SCHOOL_INFO.schoolName}
                </h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-600">
                  सत्र: {SCHOOL_INFO.academicSession} | मान्यता प्राप्त शिक्षा संस्थान
                </p>
              </div>
            </div>

            <div className="text-[11px] sm:text-xs font-bold text-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-6 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-200 print:bg-transparent print:border-none">
              <span>डाइसकोड: <b className="font-mono text-slate-900">{SCHOOL_INFO.diceCode}</b></span>
              <span>संस्था कोड: <b className="font-mono text-slate-900">{SCHOOL_INFO.institutionCode}</b></span>
              <span className="text-slate-600">अद्यतन: <b className="text-slate-900">{lastUpdated || DEFAULT_UPDATE_TIMESTAMP}</b></span>
            </div>
          </div>

          {/* Title Badge */}
          <div className="text-center mb-3 print:mb-1.5">
            <div className="inline-block bg-[#1a73e8] text-white px-4 py-0.5 rounded-full shadow-xs print:bg-black print:text-white">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider m-0">
                ACADEMIC REPORT CARD {SCHOOL_INFO.academicSession}
              </h2>
            </div>
          </div>

          {/* Student Info Mobile-Optimized Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 mb-3 border-b-2 border-slate-800 text-xs sm:text-sm bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-800 print:p-1.5 print:mb-2">
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">Student Name:</span>
              <strong className="text-[#1a73e8] uppercase font-extrabold text-xs sm:text-sm print:text-black">
                {student.name || '-'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">Father's Name:</span>
              <strong className="text-slate-900 uppercase font-bold text-xs sm:text-sm">
                {student.fatherName || '-'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">Scholar No:</span>
              <strong className="text-slate-900 font-mono font-bold text-xs sm:text-sm">
                {student.scholarNo || '-'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">Roll No / Class:</span>
              <strong className="text-[#d93025] font-mono font-black text-xs sm:text-sm print:text-black">
                {student.rollNo || '-'} ({student.className})
              </strong>
            </div>
          </div>

          {/* Exam Marksheets */}
          {hasAnyExamData ? (
            <div>
              {hasQuarterly && renderExamSection(student.quarterly)}
              {hasHalfYearly && renderExamSection(student.halfYearly)}
              {hasAnnual && renderExamSection(student.annual)}
            </div>
          ) : (
            <div className="border-2 border-dashed border-amber-400 bg-amber-50/95 rounded-2xl p-6 sm:p-10 text-center my-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <AlertCircle className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1.5 leading-snug">
                अभी रिजल्ट पब्लिश नहीं हुआ है, कृपया विद्यालय ऑफिस में संपर्क करें
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto mb-4 font-medium leading-relaxed">
                विद्यार्थी <strong>{student.name}</strong> (कक्षा: {student.className}, स्कॉलर नं.: {student.scholarNo}) का परीक्षा परिणाम विद्यालय कार्यालय द्वारा अभी पब्लिश (जारी) नहीं किया गया है।
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {onViewFees && (
                  <button
                    type="button"
                    onClick={onViewFees}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>💳 देय शुल्क विवरण देखें (View Fees)</span>
                  </button>
                )}

                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900 shadow-2xs">
                  <School className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>कार्यालय संपर्क: {SCHOOL_INFO.location}</span>
                </div>
              </div>
            </div>
          )}

          {/* Signatures & Footer */}
          <div className="mt-6 sm:mt-8 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-2 relative z-10 border-t border-slate-300 print:border-black print:mt-3 print:pt-1">
            <div className="text-center w-32 sm:w-44">
              <div className="h-7 sm:h-9 flex items-end justify-center">
                <span className="font-serif italic text-[10px] text-slate-400">Class Teacher</span>
              </div>
              <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                कक्षा अध्यापक हस्ताक्षर
              </div>
            </div>

            <div className="flex flex-col items-center justify-center opacity-70">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-dashed border-indigo-700 flex items-center justify-center text-[7.5px] sm:text-[8.5px] text-center font-bold text-indigo-900 leading-tight uppercase p-1">
                Official<br />Seal
              </div>
            </div>

            <div className="text-center w-32 sm:w-44">
              <div className="h-7 sm:h-9 flex items-end justify-center">
                <span className="font-serif italic text-[10px] text-slate-400">Principal</span>
              </div>
              <div className="border-t border-slate-800 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                प्राचार्य / सील
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions (Hidden during print) */}
        <div className="mt-4 print:hidden print-hidden relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← मुख्य विकल्प</span>
              </button>
            )}

            <a
              href={MAIN_SCHOOL_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="किसी भी समस्या या फीडबैक के लिए यहाँ क्लिक करें"
            >
              <MessageSquareText className="w-4 h-4" />
              <span>समस्या / फीडबैक दर्ज करें ↗</span>
            </a>

            <a
              href={MAIN_SCHOOL_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="माँ दुर्गा उ.मा. विद्यालय मुख्य पृष्ठ"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span>मुख्य पृष्ठ ↗</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto py-2.5 px-5 bg-gradient-to-r from-[#28a745] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>अंकसूची प्रिंट करें (Print)</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>लॉगआउट</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
