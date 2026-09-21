import React from 'react';
import { Printer, Award, School, CheckCircle2, LogOut } from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';

interface OfficialReportCardProps {
  student: ParsedStudent;
  onPrint?: () => void;
  onLogout?: () => void;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({
  student,
  onPrint,
  onLogout,
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const renderExamSection = (section: ParsedStudent['quarterly'] | ParsedStudent['halfYearly'] | ParsedStudent['annual']) => {
    if (!section || section.rows.length === 0) return null;

    const colSpan = 4 + (section.hasProject ? 1 : 0) + (section.hasAnyDistn ? 1 : 0);

    return (
      <div className="mb-7 overflow-hidden rounded-lg border-2 border-slate-700 bg-white/95 shadow-xs relative z-10">
        {/* Exam Section Header with Prominent Theory Max Marks Badge */}
        <div className="bg-gradient-to-r from-[#1258b5] via-[#1a73e8] to-[#1258b5] py-2 px-3 text-white border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-2">
          <span className="text-base md:text-lg font-extrabold uppercase tracking-wide">
            {section.title}
          </span>
          <div className="flex items-center gap-2 bg-slate-950/50 border border-white/30 rounded-lg px-2.5 py-1 text-xs md:text-sm font-bold shadow-xs">
            <span className="text-amber-300">सैद्धांतिक पूर्णांक (Theory Max):</span>
            <span className="font-mono text-white bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/40">
              {section.classTheoryMax || 50} अंक
            </span>
          </div>
        </div>

        <table className="w-full border-collapse text-center text-sm md:text-base">
          <thead>
            <tr className="bg-[#e9edf5] text-slate-900 font-bold border-b border-slate-400 text-xs md:text-sm">
              <th className="border-r border-slate-400 py-2 px-3 text-left">Subject (विषय)</th>
              <th className="border-r border-slate-400 py-2 px-2.5 text-center text-slate-700">पूर्णांक (Max)</th>
              <th className="border-r border-slate-400 py-2 px-2.5 text-center text-slate-700">उत्तीर्णांक (Min)</th>
              <th className="border-r border-slate-400 py-2 px-3 text-center">सैद्धांतिक (Theory)</th>
              {section.hasProject && (
                <th className="border-r border-slate-400 py-2 px-3 text-center">प्रोजेक्ट / प्रायोगिक</th>
              )}
              <th className={`py-2 px-3 text-center ${section.hasAnyDistn ? 'border-r border-slate-400' : ''}`}>
                प्राप्तांक योग (Total)
              </th>
              {section.hasAnyDistn && (
                <th className="py-2 px-3 text-[#d93025] text-center">विशेष योग्यता (Distn)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-slate-900">
            {section.rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="border-r border-slate-400 py-2.5 px-3 text-left font-semibold text-slate-950">
                  {row.name}
                </td>
                <td className="border-r border-slate-400 py-2.5 px-2.5 font-mono text-slate-800 font-bold text-xs sm:text-sm">
                  {row.maxMarks}
                </td>
                <td className="border-r border-slate-400 py-2.5 px-2.5 font-mono text-slate-600 text-xs sm:text-sm">
                  {row.minMarks}
                </td>
                <td className="border-r border-slate-400 py-2.5 px-3 font-mono font-medium text-center">
                  <span>{row.theory || '-'}</span>
                  {row.theoryMaxMarks && row.theoryMaxMarks !== row.maxMarks ? (
                    <span className="text-[10px] text-slate-400 block font-normal">/{row.theoryMaxMarks}</span>
                  ) : null}
                </td>
                {section.hasProject && (
                  <td className="border-r border-slate-400 py-2.5 px-3 font-mono font-medium text-center">
                    <span>{row.project || '-'}</span>
                    {row.projectMaxMarks ? (
                      <span className="text-[10px] text-slate-400 block font-normal">/{row.projectMaxMarks}</span>
                    ) : null}
                  </td>
                )}
                <td className={`py-2.5 px-3 font-bold font-mono text-slate-950 text-center ${section.hasAnyDistn ? 'border-r border-slate-400' : ''}`}>
                  {row.total || '0'}
                </td>
                {section.hasAnyDistn && (
                  <td className="py-2.5 px-3 font-black text-[#d93025] tracking-wider text-center">
                    {row.isDistn ? 'DISTN' : ''}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-700 bg-gradient-to-r from-slate-100 via-amber-50/40 to-slate-100 p-3 text-xs md:text-base font-bold text-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">पूर्णांक:</span>
            <span className="font-mono text-slate-800 font-extrabold">{section.totalMaxMarks}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">महायोग:</span>
            <span className="font-mono text-indigo-950 font-black text-base md:text-lg">{section.grandTotal}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">प्रतिशत:</span>
            <span className="font-mono text-emerald-800 font-black text-base md:text-lg">{section.percentage}%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">कक्षा में स्थान:</span>
            <span className="font-mono text-slate-900 font-extrabold">{section.classRank}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-slate-600">परिणाम:</span>
            <span
              className={`px-3 py-1 rounded text-xs font-black tracking-wider ${
                String(section.result).toUpperCase().includes('PASS') ||
                String(section.result).toUpperCase().includes('FIRST')
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-red-100 text-[#d93025] border border-red-300'
              }`}
            >
              {section.result}
            </span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      id="marksheet"
      className="official-marksheet relative mx-auto max-w-[1100px] border-4 border-slate-900 bg-white p-5 sm:p-9 shadow-2xl rounded-2xl print:rounded-none print:border-2 print:border-black print:shadow-none print:p-4 text-slate-900 overflow-hidden"
    >
      {/* Background Watermark using School Logo */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none opacity-[0.06] print:opacity-[0.08]"
        aria-hidden="true"
      >
        <img
          src={SCHOOL_LOGO_URL}
          alt="School Watermark"
          referrerPolicy="no-referrer"
          className="w-[420px] max-w-[70vw] object-contain filter grayscale"
        />
      </div>

      {/* Decorative Golden Inner Border */}
      <div className="relative z-10 border border-amber-600/30 rounded-lg p-3 sm:p-5 mb-1 bg-white/70 backdrop-blur-[1px]">
        {/* Printable School Header */}
        <div className="text-center border-b-4 border-[#1a73e8] pb-4 mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 mb-2">
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 p-1 rounded-full bg-white border-2 border-amber-500/80 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={SCHOOL_LOGO_URL}
                alt="Maa Durga School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#d93025] leading-tight m-0 drop-shadow-xs">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                सत्र: {SCHOOL_INFO.academicSession} | मान्यता प्राप्त शिक्षा संस्थान
              </p>
            </div>
          </div>

          <div className="mt-2 text-xs sm:text-sm md:text-base font-bold text-slate-800 flex flex-wrap items-center justify-center gap-4 sm:gap-12 bg-slate-50 py-1.5 px-4 rounded-md border border-slate-200">
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

        {/* Title Badge */}
        <div className="text-center mb-6">
          <div className="inline-block bg-[#1a73e8] text-white px-5 py-1.5 rounded-full shadow-xs">
            <h2 className="text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wider m-0">
              ACADEMIC REPORT CARD {SCHOOL_INFO.academicSession}
            </h2>
          </div>
        </div>

        {/* Student Info 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pb-5 mb-6 border-b-2 border-slate-800 text-sm sm:text-base bg-slate-50/80 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Student Name:</span>
            <b className="text-[#1a73e8] uppercase font-extrabold text-base sm:text-lg">
              {student.name || '-'}
            </b>
          </div>
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Father's Name:</span>
            <b className="text-slate-900 uppercase font-bold text-base sm:text-lg">
              {student.fatherName || '-'}
            </b>
          </div>
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Scholar Number:</span>
            <b className="text-slate-900 font-mono font-bold text-base">
              {student.scholarNo || '-'}
            </b>
          </div>
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Roll Number:</span>
            <b className="text-[#d93025] font-mono font-black text-base">
              {student.rollNo || '-'}
            </b>
          </div>
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Mobile/Info:</span>
            <b className="text-slate-800 font-mono font-semibold text-base">
              {student.mobile || '-'}
            </b>
          </div>
          <div className="flex items-center">
            <span className="text-slate-600 w-36 shrink-0 font-medium">Class:</span>
            <b className="text-[#1a73e8] uppercase font-extrabold text-base">
              {student.className || '-'}
            </b>
          </div>
        </div>

        {/* Exam Sections */}
        {renderExamSection(student.quarterly)}
        {renderExamSection(student.halfYearly)}
        {renderExamSection(student.annual)}

        {/* Signatures & Footer */}
        <div className="mt-12 sm:mt-16 flex items-center justify-between text-sm sm:text-base font-bold text-slate-800 pt-3 relative z-10">
          <div className="text-center w-48 sm:w-56">
            <div className="h-12 flex items-end justify-center">
              <span className="font-serif italic text-xs text-slate-400">Class Teacher</span>
            </div>
            <div className="border-t-2 border-slate-800 pt-1.5 font-bold text-slate-900">
              Class Teacher Sign
            </div>
          </div>

          {/* School Stamp Embellishment */}
          <div className="hidden sm:flex flex-col items-center justify-center opacity-60">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-700 flex items-center justify-center text-[10px] text-center font-bold text-indigo-900 leading-tight uppercase p-1">
              Official<br />Seal
            </div>
          </div>

          <div className="text-center w-48 sm:w-56">
            <div className="h-12 flex items-end justify-center">
              <span className="font-serif italic text-xs text-slate-400">Authorized Signatory</span>
            </div>
            <div className="border-t-2 border-slate-800 pt-1.5 font-bold text-slate-900">
              Principal Signature
            </div>
          </div>
        </div>
      </div>

      {/* Actions (Hidden during print) */}
      <div className="mt-8 print:hidden relative z-10 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 w-full py-3.5 px-4 bg-gradient-to-r from-[#28a745] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-base sm:text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Printer className="w-5 h-5" />
          <span>Print Marksheet (अंकसूची प्रिंट करें)</span>
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span>लॉगआउट (Logout)</span>
          </button>
        )}
      </div>
    </div>
  );
};

