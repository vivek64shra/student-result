import React from 'react';
import { 
  Printer, 
  CreditCard, 
  Calendar, 
  School, 
  AlertCircle, 
  Receipt, 
  CheckCircle2, 
  Bus, 
  BookOpen, 
  Clock, 
  ShieldCheck,
  Building2,
  ArrowLeft,
  Info,
  Globe,
  MessageSquareText,
  ExternalLink
} from 'lucide-react';
import { StudentFeeRecord, formatINR, getAcademicSessionInfo } from '../utils/feesParser';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';
import { MAIN_SCHOOL_WEBSITE_URL } from './LoginPage';

interface StudentFeesViewProps {
  student: ParsedStudent;
  feeRecord: StudentFeeRecord | null;
  onPrint?: () => void;
  onBack?: () => void;
  lastUpdated?: string;
}

export const StudentFeesView: React.FC<StudentFeesViewProps> = ({
  student,
  feeRecord,
  onPrint,
  onBack,
  lastUpdated,
}) => {
  const [feeOption, setFeeOption] = React.useState<'all' | 'current' | 'prev_year'>('all');

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const sessionInfo = getAcademicSessionInfo();
  const prevYearAmount = feeRecord?.prevYearDue || 0;
  const aprilOldDue = feeRecord?.aprilOldDueFee || 0;
  const totalOldDues = prevYearAmount + aprilOldDue;
  const grandTotalAmount = feeRecord?.grandTotal || 0;
  const currentSessionAmount = Math.max(0, grandTotalAmount - totalOldDues);

  const isZeroDue = feeRecord && grandTotalAmount === 0 && (!feeRecord.items || feeRecord.items.length === 0);
  const hasRecord = feeRecord && (grandTotalAmount > 0 || (feeRecord.items && feeRecord.items.length > 0));

  // Filtered items based on selected feeOption
  const displayItems = React.useMemo(() => {
    if (!feeRecord || !feeRecord.items) return [];
    if (feeOption === 'prev_year') {
      return feeRecord.items.filter((item) => item.category === 'Dues' || item.id === 'prev_year_due' || item.id === 'april_old_due_fee');
    }
    if (feeOption === 'current') {
      return feeRecord.items.filter((item) => item.category !== 'Dues' && item.id !== 'prev_year_due' && item.id !== 'april_old_due_fee');
    }
    return feeRecord.items;
  }, [feeRecord, feeOption]);

  const activeDisplayTotal = React.useMemo(() => {
    if (!feeRecord) return 0;
    if (feeOption === 'prev_year') return totalOldDues;
    if (feeOption === 'current') return currentSessionAmount;
    return grandTotalAmount;
  }, [feeRecord, feeOption, totalOldDues, currentSessionAmount, grandTotalAmount]);

  return (
    <div id="fee-receipt" className="fee-receipt-container max-w-[1020px] mx-auto">
      
      {/* Top Interactive Bar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 print:hidden print-hidden">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>← मुख्य विकल्प</span>
            </button>
          )}

          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="किसी भी समस्या या फीस संबंधी प्रश्न के लिए यहाँ क्लिक करें"
          >
            <MessageSquareText className="w-4 h-4" />
            <span>फीस संबंधी समस्या / फीडबैक ↗</span>
          </a>

          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="माँ दुर्गा उ.मा. विद्यालय मुख्य पृष्ठ"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>मुख्य पृष्ठ ↗</span>
          </a>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>शुल्क रसीद प्रिंट करें (Print Slip)</span>
        </button>
      </div>

      {/* Option Selection Bar (User Request: "shulk me gat varsh ka bhi option dd karo") */}
      {hasRecord && (
        <div className="mb-3 print:hidden">
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 px-2 text-slate-800 font-black text-xs sm:text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span>शुल्क देखने का विकल्प (Fee View Option):</span>
                <span className="block text-[10px] text-slate-500 font-normal">विवरण देखने हेतु विकल्प चुनें</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {/* Option 1: All Fees */}
              <button
                type="button"
                onClick={() => setFeeOption('all')}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                  feeOption === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                <span>1. सम्पूर्ण शुल्क विवरण</span>
                <span className="text-[10px] font-mono font-extrabold mt-0.5 opacity-90">
                  {formatINR(grandTotalAmount)}
                </span>
              </button>

              {/* Option 2: Current Session */}
              <button
                type="button"
                onClick={() => setFeeOption('current')}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
                  feeOption === 'current'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                <span>2. वर्तमान सत्र ({sessionInfo.session})</span>
                <span className="text-[10px] font-mono font-extrabold mt-0.5 opacity-90">
                  {formatINR(currentSessionAmount)}
                </span>
              </button>

              {/* Option 3: Previous Year Dues (गत वर्ष का बकाया) */}
              <button
                type="button"
                onClick={() => setFeeOption('prev_year')}
                className={`px-3 py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center relative ${
                  feeOption === 'prev_year'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                    : totalOldDues > 0
                    ? 'bg-amber-100/90 text-amber-950 hover:bg-amber-200 border border-amber-300'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                {totalOldDues > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>3. गत वर्ष का पुराना बकाया</span>
                </span>
                <span className="text-[10px] font-mono font-extrabold mt-0.5">
                  {formatINR(totalOldDues)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Ready Official Fee Receipt Card */}
      <div className="official-fee-slip bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl shadow-xl border-2 border-slate-700/80 print:shadow-none print:border-2 print:border-black print:p-3 print:rounded-none relative overflow-hidden">
        
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
          <Building2 className="w-[450px] h-[450px] text-slate-900" />
        </div>

        {/* Top Header */}
        <div className="text-center border-b-2 border-slate-800 pb-2.5 mb-2.5 relative z-10 print:pb-1.5 print:mb-1.5">
          
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-600 mb-1.5 print:text-[10px]">
            <span className="font-semibold text-slate-700">
              डाइस कोड: <b className="font-mono text-slate-900">{SCHOOL_INFO.diceCode}</b>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 print:border-none print:bg-transparent print:p-0">
              <Calendar className="w-3 h-3 text-emerald-700 print:hidden" />
              <span>सत्र: <b>{sessionInfo.session}</b></span>
            </span>
            <span className="font-semibold text-slate-700">
              संस्था कोड: <b className="font-mono text-slate-900">{SCHOOL_INFO.institutionCode}</b>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 p-0.5 rounded-full bg-white border border-amber-500 shadow-xs flex items-center justify-center overflow-hidden print:w-12 print:h-12">
              <img
                src={SCHOOL_LOGO_URL}
                alt="School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[#d93025] leading-tight print:text-xl">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-600 print:text-[10px]">
                {SCHOOL_INFO.location} | मान्यता प्राप्त शिक्षा संस्थान
              </p>
            </div>
          </div>

          {/* Dynamic DUE FEE REPORT Banner */}
          <div className="mt-2 inline-flex flex-col items-center">
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-800 text-white font-black text-xs sm:text-sm tracking-wide shadow-xs print:bg-black print:text-white print:px-3 print:py-0.5">
              {sessionInfo.feeReportTitle}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5 print:text-[9.5px]">
              {feeOption === 'prev_year' 
                ? 'गत वर्ष का पुराना बकाया शुल्क विवरण (Previous Year Dues Statement)' 
                : feeOption === 'current'
                ? `वर्तमान सत्र ${sessionInfo.session} छात्र शुल्क विवरण (Current Session Fee)`
                : `वार्षिक छात्र शुल्क विवरण एवं देय रसीद (सत्र ${sessionInfo.session})`}
            </span>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:p-3.5 mb-3 relative z-10 print:bg-white print:p-2 print:mb-2 print:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm print:text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">विद्यार्थी का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">पिता का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase">{student.fatherName || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">स्कॉलर नं. / रोल नं.:</span>
              <strong className="text-blue-700 font-mono font-black">{student.scholarNo} / {student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] sm:text-xs font-semibold">कक्षा (Class):</span>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 font-black rounded text-xs print:bg-transparent print:p-0">
                {student.className || feeRecord?.className || 'सामान्य'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Fee Section */}
        {hasRecord ? (
          <div className="relative z-10">
            {/* Quick Stat Highlights with "वार्षिक नवीनीकरण शुल्क" & "गत वर्ष का पुराना बकाया" at TOP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 mb-3 print:hidden">
              {/* 1. कुल देय शुल्क */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2 sm:p-2.5 text-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 block">कुल देय शुल्क (Total)</span>
                <span className="text-base sm:text-xl font-black text-emerald-900 font-mono">
                  {formatINR(feeRecord.grandTotal)}
                </span>
              </div>

              {/* 2. गत वर्ष का पुराना बकाया */}
              <div className={`border rounded-xl p-2 sm:p-2.5 text-center ${
                totalOldDues > 0 
                  ? 'bg-amber-50 border-amber-300 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 opacity-80'
              }`}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 block">गत वर्ष बकाया</span>
                  {totalOldDues > 0 && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded">
                      देय
                    </span>
                  )}
                </div>
                <span className="text-base sm:text-xl font-black text-amber-950 font-mono">
                  {formatINR(totalOldDues)}
                </span>
              </div>

              {/* 3. वार्षिक नवीनीकरण शुल्क */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2 sm:p-2.5 text-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-800 block">वार्षिक नवीनीकरण</span>
                <span className="text-base sm:text-xl font-black text-indigo-900 font-mono">
                  {formatINR(feeRecord.renewableFee)}
                </span>
              </div>

              {/* 4. शिक्षण शुल्क */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 sm:p-2.5 text-center">
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 block">शिक्षण शुल्क (Tuition)</span>
                <span className="text-base sm:text-xl font-black text-blue-900 font-mono">
                  {formatINR(feeRecord.totalTuition)}
                </span>
              </div>

              {/* 5. वाहन शुल्क */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-2 sm:p-2.5 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 block">वाहन शुल्क (Bus/Van)</span>
                <span className="text-base sm:text-xl font-black text-purple-900 font-mono">
                  {formatINR(feeRecord.totalConveyance)}
                </span>
              </div>
            </div>

            {/* Focused Alert when Viewing "गत वर्ष का पुराना बकाया" */}
            {feeOption === 'prev_year' && (
              <div className="mb-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 print:bg-white print:border-black">
                <div className="flex items-center gap-2 font-black text-amber-900 mb-1">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>गत वर्ष (Previous Academic Session) का पुराना बकाया विवरण:</span>
                </div>
                {totalOldDues > 0 ? (
                  <p className="font-semibold leading-relaxed">
                    विद्यार्थी <strong>{student.name}</strong> का पूर्व शैक्षणिक सत्र का कुल <strong>{formatINR(totalOldDues)}</strong> पुराना बकाया शेष है। कृपया इसे विद्यालय कार्यालय में संपर्क कर समय पर समाधान कराएं।
                  </p>
                ) : (
                  <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>विद्यार्थी का गत शैक्षणिक सत्र का कोई भी पुराना बकाया शेष नहीं है (₹0 - All Cleared)।</span>
                  </p>
                )}
              </div>
            )}

            {/* Detailed Fee Breakdown Table */}
            <div className="border-2 border-slate-700 rounded-xl mb-3 shadow-2xs print:border-black print:rounded-none overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm border-collapse print:text-[11px]">
                <thead>
                  <tr className="bg-slate-800 text-white font-extrabold print:bg-slate-200 print:text-black">
                    <th className="py-2 px-3 border-r border-slate-600 print:border-black w-10 text-center">क्र.</th>
                    <th className="py-2 px-3 border-r border-slate-600 print:border-black">शुल्क का मद (Fee Head Description)</th>
                    <th className="py-2 px-3 border-r border-slate-600 print:border-black w-36 hidden sm:table-cell print:table-cell">श्रेणी</th>
                    <th className="py-2 px-3 text-right w-36">देय राशि (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 print:divide-slate-800">
                  {displayItems.length > 0 ? (
                    displayItems.map((item, idx) => {
                      const isOldDue = item.category === 'Dues' || item.id === 'prev_year_due' || item.id === 'april_old_due_fee';
                      const isRenewable = item.id === 'renewable_fee';

                      return (
                        <tr 
                          key={item.id} 
                          className={
                            isOldDue
                              ? 'bg-amber-50/70 print:bg-white font-semibold'
                              : isRenewable 
                              ? 'bg-indigo-50/50 print:bg-white font-semibold' 
                              : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 print:bg-white')
                          }
                        >
                          <td className="py-1.5 px-3 border-r border-slate-300 print:border-black text-center font-mono text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-300 print:border-black">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">{item.nameHindi}</span>
                              {isOldDue && (
                                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-200 text-amber-950 rounded print:border print:border-black">
                                  गत वर्ष बकाया
                                </span>
                              )}
                              {isRenewable && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-900 rounded print:hidden">
                                  वार्षिक नवीनीकरण
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium block print:hidden">{item.nameEnglish}</span>
                          </td>
                          <td className="py-1.5 px-3 border-r border-slate-300 print:border-black text-slate-600 hidden sm:table-cell print:table-cell text-xs">
                            {isOldDue ? (
                              <span className="font-extrabold text-amber-800">गत वर्ष पुराना बकाया</span>
                            ) : item.category === 'Admission' ? (
                              'प्रवेश/नवीनीकरण'
                            ) : item.category === 'Tuition' ? (
                              'शिक्षण शुल्क'
                            ) : item.category === 'Conveyance' ? (
                              'वाहन शुल्क'
                            ) : (
                              'अन्य शुल्क'
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500 font-semibold">
                        {feeOption === 'prev_year'
                          ? 'गत शैक्षणिक सत्र का कोई पुराना बकाया नहीं है (₹0 - No Dues Pending)'
                          : 'कोई शुल्क मद उपलब्ध नहीं है।'}
                      </td>
                    </tr>
                  )}
                  
                  {/* Detailed Subtotals / Total Rows */}
                  {feeOption === 'all' && totalOldDues > 0 && (
                    <>
                      <tr className="bg-amber-50/90 font-bold text-slate-900 border-t border-slate-400 print:bg-slate-50">
                        <td colSpan={2} className="py-1.5 px-3 border-r border-slate-400 text-right text-xs">
                          (अ) गत वर्ष का कुल पुराना बकाया:
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-400 hidden sm:table-cell print:table-cell text-xs text-amber-900 font-bold">
                          पूर्व सत्र बकाया
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-xs sm:text-sm text-amber-950">
                          {formatINR(totalOldDues)}
                        </td>
                      </tr>
                      <tr className="bg-blue-50/60 font-bold text-slate-900 border-t border-slate-300 print:bg-white">
                        <td colSpan={2} className="py-1.5 px-3 border-r border-slate-400 text-right text-xs">
                          (ब) वर्तमान सत्र {sessionInfo.session} शुल्क:
                        </td>
                        <td className="py-1.5 px-3 border-r border-slate-400 hidden sm:table-cell print:table-cell text-xs text-blue-900 font-bold">
                          वर्तमान सत्र देय
                        </td>
                        <td className="py-1.5 px-3 text-right font-mono text-xs sm:text-sm text-blue-950">
                          {formatINR(currentSessionAmount)}
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Grand Total Row */}
                  <tr className="bg-emerald-50/90 font-black text-slate-900 border-t-2 border-slate-700 print:bg-slate-100 print:border-black">
                    <td colSpan={2} className="py-2 px-3 border-r border-slate-400 print:border-black text-right text-xs sm:text-sm uppercase tracking-wide">
                      {feeOption === 'prev_year' 
                        ? 'गत वर्ष का कुल देय बकाया (Total Previous Year Due):' 
                        : feeOption === 'current'
                        ? `वर्तमान सत्र (${sessionInfo.session}) कुल देय शुल्क:`
                        : 'कुल देय शुल्क योग (Total Demand):'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-400 print:border-black hidden sm:table-cell print:table-cell text-xs text-slate-600">
                      {feeOption === 'prev_year' ? 'पूर्व सत्र' : `सत्र ${sessionInfo.session}`}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm sm:text-base text-emerald-900 print:text-black">
                      {formatINR(activeDisplayTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* User Requested Specific Notice */}
            <div className="bg-blue-50/90 border-2 border-blue-300 rounded-xl p-3 text-xs sm:text-sm text-blue-950 mb-3 print:p-2 print:border-black print:bg-transparent print:text-[10.5px]">
              <div className="font-extrabold flex items-center gap-1.5 text-blue-900 mb-1 print:text-black">
                <Info className="w-4 h-4 text-blue-700 shrink-0 print:hidden" />
                <span>महत्वपूर्ण कार्यालयीन सूचना:</span>
              </div>
              <p className="font-bold leading-relaxed text-blue-900 print:text-black">
                • <strong>जमा की गई राशि का विवरण/अद्यतन (Paid Fee Update) बहुत जल्द उपलब्ध कराया जाएगा।</strong>
              </p>
              <p className="font-semibold leading-relaxed text-slate-700 mt-1 print:text-black">
                • अधिक जानकारी एवं सही जानकारी के लिए कृपया <strong>विद्यालय कार्यालय में संपर्क करें</strong>।
              </p>
            </div>
          </div>
        ) : isZeroDue ? (
          /* Student has NO Pending Dues */
          <div className="border-2 border-emerald-400 bg-emerald-50/80 rounded-xl p-6 sm:p-8 text-center my-4 relative z-10 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-xl font-black text-emerald-950 mb-1">
              कोई शुल्क बकाया नहीं है (No Dues Pending - ₹0)
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800 max-w-md mx-auto mb-3">
              विद्यार्थी <strong>{student.name}</strong> (स्कॉलर नं. {student.scholarNo}) का वर्तमान सत्र {sessionInfo.session} का संपूर्ण शुल्क चुकता है।
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold text-emerald-900 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>कार्यालयीन रिकॉर्ड अनुसार वर्तमान बकाया: ₹0 (निरंक)</span>
            </div>
          </div>
        ) : (
          /* Missing or Not Updated Fee Notice */
          <div className="border-2 border-dashed border-amber-300 bg-amber-50/80 rounded-xl p-6 sm:p-10 text-center my-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              शुल्क विवरण अभी अद्यतन (Update) नहीं हुआ है
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-3">
              विद्यार्थी <strong>{student.name}</strong> (स्कॉलर नं. {student.scholarNo}) का शुल्क रिकॉर्ड ऑनलाइन डेटाबेस में संकलित किया जा रहा है।
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs">
              <School className="w-4 h-4 text-amber-700" />
              <span>अधिक जानकारी एवं सही जानकारी के लिए कृपया विद्यालय कार्यालय में संपर्क करें।</span>
            </div>
          </div>
        )}

        {/* Official Stamp & Signatures */}
        <div className="mt-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-2.5 relative z-10 border-t border-slate-300 print:border-black print:mt-3 print:pt-1">
          <div className="text-center w-32 sm:w-44">
            <div className="h-7 sm:h-9 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Accountant</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
              लेखापाल हस्ताक्षर
            </div>
          </div>

          {/* School Stamp Embellishment */}
          <div className="flex flex-col items-center justify-center opacity-75 print:opacity-100">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[7.5px] sm:text-[8.5px] text-center font-bold text-emerald-900 leading-tight uppercase p-1">
              Official<br />Seal
            </div>
          </div>

          <div className="text-center w-32 sm:w-44">
            <div className="h-7 sm:h-9 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Principal</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
              प्राचार्य हस्ताक्षर / सील
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
