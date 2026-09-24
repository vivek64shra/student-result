import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  CreditCard, 
  Calendar, 
  School, 
  AlertCircle, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2,
  ArrowLeft,
  MessageSquareText,
  Download,
  Share2,
  LogOut
} from 'lucide-react';
import { StudentFeeRecord, formatINR, getAcademicSessionInfo } from '../utils/feesParser';
import { ParsedStudent, SCHOOL_INFO, SCHOOL_LOGO_URL } from '../utils/reportCardParser';
import { MAIN_SCHOOL_WEBSITE_URL } from './LoginPage';
import { downloadElementAsJpg } from '../utils/imageExporter';

interface StudentFeesViewProps {
  student: ParsedStudent;
  feeRecord: StudentFeeRecord | null;
  onPrint?: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  lastUpdated?: string;
}

export const StudentFeesView: React.FC<StudentFeesViewProps> = ({
  student,
  feeRecord,
  onPrint,
  onBack,
  onLogout,
  lastUpdated,
}) => {
  const [feeOption, setFeeOption] = useState<'all' | 'current' | 'prev_year'>('all');
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);

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
  const displayItems = useMemo(() => {
    if (!feeRecord || !feeRecord.items) return [];
    if (feeOption === 'prev_year') {
      return feeRecord.items.filter((item) => item.category === 'Dues' || item.id === 'prev_year_due' || item.id === 'april_old_due_fee');
    }
    if (feeOption === 'current') {
      return feeRecord.items.filter((item) => item.category !== 'Dues' && item.id !== 'prev_year_due' && item.id !== 'april_old_due_fee');
    }
    return feeRecord.items;
  }, [feeRecord, feeOption]);

  const activeDisplayTotal = useMemo(() => {
    if (!feeRecord) return 0;
    if (feeOption === 'prev_year') return totalOldDues;
    if (feeOption === 'current') return currentSessionAmount;
    return grandTotalAmount;
  }, [feeRecord, feeOption, totalOldDues, currentSessionAmount, grandTotalAmount]);

  const noteFeesMandatory = '📌 महत्वपूर्ण सूचना: डेटा तुरंत अपडेट नहीं होता है। यदि आपने हाल ही में (आज अथवा कल) शुल्क जमा किया है, तो कृपया 1-2 दिन की प्रतीक्षा करें, डेटा स्वतः अपडेट हो जाएगा अथवा विद्यालय कार्यालय में संपर्क करें।';

  // JPG Download handler (A4 size format)
  const handleDownloadJpg = async () => {
    await downloadElementAsJpg(
      'fee-receipt-card',
      `Fee_Receipt_${student.scholarNo || student.rollNo || 'Student'}`,
      setIsDownloadingJpg
    );
  };

  // WhatsApp Share handler
  const handleWhatsAppShare = () => {
    const text = `*${SCHOOL_INFO.schoolName}*\n` +
      `डाइस कोड: ${SCHOOL_INFO.diceCode} | संस्था कोड: ${SCHOOL_INFO.institutionCode}\n` +
      `सत्र: ${sessionInfo.session}\n\n` +
      `*छात्र शुल्क विवरण / रसीद:*\n` +
      `• विद्यार्थी: *${student.name}*\n` +
      `• पिता का नाम: ${student.fatherName || '-'}\n` +
      `• स्कॉलर नं.: ${student.scholarNo} | रोल नं.: ${student.rollNo}\n` +
      `• कक्षा: ${student.className || feeRecord?.className || 'सामान्य'}\n\n` +
      `📊 *शुल्क स्थिति:*\n` +
      `• कुल देय शुल्क: ${formatINR(grandTotalAmount)}\n` +
      (totalOldDues > 0 ? `• गत वर्ष का पुराना बकाया: ${formatINR(totalOldDues)}\n` : '') +
      `• वर्तमान सत्र शुल्क: ${formatINR(currentSessionAmount)}\n\n` +
      `${noteFeesMandatory}\n\n` +
      `पोर्टल लिंक: ${window.location.origin}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // ignore
    }

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div id="fee-receipt" className="fee-receipt-container max-w-[1020px] mx-auto">
      
      {/* Top Action Bar: Single consolidated non-repeating controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 print:hidden print-hidden">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              <span>← मुख्य विकल्प</span>
            </button>
          )}

          <a
            href={MAIN_SCHOOL_WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs sm:text-sm rounded-xl border border-amber-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="फीस संबंधी समस्या या फीडबैक दर्ज करें"
          >
            <MessageSquareText className="w-4 h-4 text-amber-700" />
            <span>फीडबैक ↗</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट रसीद</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJpg}
            disabled={isDownloadingJpg}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="रसीद को A4 साइज JPG फोटो फॉर्मेट में सीधे मोबाइल में सेव करें"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingJpg ? 'JPG बन रहा है...' : 'JPG डाउनलोड (A4)'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="शुल्क विवरण WhatsApp पर भेजें"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp शेयर</span>
          </button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>लॉगआउट</span>
            </button>
          )}
        </div>
      </div>

      {/* Option Selection Bar */}
      {hasRecord && (
        <div className="mb-3 print:hidden">
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-1 text-slate-800 font-black text-xs sm:text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <span>शुल्क देखने का विकल्प:</span>
                <span className="block text-[10px] text-slate-500 font-normal">विवरण देखने हेतु विकल्प चुनें</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {/* Option 1: All Fees */}
              <button
                type="button"
                onClick={() => setFeeOption('all')}
                className={`px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
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
                className={`px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center ${
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

              {/* Option 3: Previous Year Dues */}
              <button
                type="button"
                onClick={() => setFeeOption('prev_year')}
                className={`px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center flex flex-col items-center justify-center relative ${
                  feeOption === 'prev_year'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                    : totalOldDues > 0
                    ? 'bg-amber-100/90 text-amber-950 hover:bg-amber-200 border border-amber-300'
                    : 'text-slate-700 hover:bg-white/80'
                }`}
              >
                {totalOldDues > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span>3. गत वर्ष का बकाया</span>
                </span>
                <span className="text-[10px] font-mono font-extrabold mt-0.5">
                  {formatINR(totalOldDues)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-Ready & JPG Exportable Official Fee Receipt Card (Mobile fluid & zero-overflow) */}
      <div 
        id="fee-receipt-card"
        className="official-fee-slip bg-white p-2.5 sm:p-5 md:p-7 rounded-2xl shadow-xl border-2 border-slate-700/80 print:shadow-none print:border-2 print:border-black print:p-3 print:rounded-none relative overflow-hidden"
      >
        
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
          <Building2 className="w-[400px] h-[400px] text-slate-900" />
        </div>

        {/* Top Header */}
        <div className="text-center border-b-2 border-slate-800 pb-2 mb-2 relative z-10 print:pb-1.5 print:mb-1.5">
          
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10.5px] sm:text-xs text-slate-600 mb-1.5 print:text-[10px]">
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3.5">
            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 p-0.5 rounded-full bg-white border border-amber-500 shadow-xs flex items-center justify-center overflow-hidden print:w-11 print:h-11">
              <img
                src={SCHOOL_LOGO_URL}
                alt="School Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl font-black text-[#d93025] leading-tight print:text-xl">
                {SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-[10.5px] sm:text-xs font-semibold text-slate-600 print:text-[10px]">
                {SCHOOL_INFO.location} | मान्यता प्राप्त शिक्षा संस्थान
              </p>
            </div>
          </div>

          {/* Dynamic DUE FEE REPORT Banner */}
          <div className="mt-1.5 inline-flex flex-col items-center">
            <div className="px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-800 text-white font-black text-xs sm:text-sm tracking-wide shadow-xs print:bg-black print:text-white print:px-3 print:py-0.5">
              {sessionInfo.feeReportTitle}
            </div>
            <span className="text-[9.5px] sm:text-[11px] font-bold text-slate-600 mt-0.5 print:text-[9.5px]">
              {feeOption === 'prev_year' 
                ? 'गत वर्ष का पुराना बकाया शुल्क विवरण (Previous Year Dues)' 
                : feeOption === 'current'
                ? `वर्तमान सत्र ${sessionInfo.session} छात्र शुल्क विवरण (Current Session Fee)`
                : `वार्षिक छात्र शुल्क विवरण एवं देय पर्ची (सत्र ${sessionInfo.session})`}
            </span>
          </div>
        </div>

        {/* Student Details Grid (Mobile-friendly, no overflow) */}
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-2 sm:p-3 mb-2.5 relative z-10 print:bg-white print:p-2 print:mb-2 print:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[11px] sm:text-sm print:text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9.5px] sm:text-xs font-semibold">विद्यार्थी का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase truncate block">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px] sm:text-xs font-semibold">पिता का नाम:</span>
              <strong className="text-slate-900 font-extrabold uppercase truncate block">{student.fatherName || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px] sm:text-xs font-semibold">स्कॉलर / रोल नं.:</span>
              <strong className="text-blue-700 font-mono font-black">{student.scholarNo} / {student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9.5px] sm:text-xs font-semibold">कक्षा (Class):</span>
              <span className="inline-block px-1.5 py-0.2 bg-blue-100 text-blue-900 font-black rounded text-[11px] sm:text-xs print:bg-transparent print:p-0">
                {student.className || feeRecord?.className || 'सामान्य'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Fee Section */}
        {hasRecord ? (
          <div className="relative z-10">
            {/* Focused Alert when Viewing "गत वर्ष का पुराना बकाया" */}
            {feeOption === 'prev_year' && (
              <div className="mb-2.5 p-2 sm:p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 print:bg-white print:border-black">
                <div className="flex items-center gap-1.5 font-black text-amber-900 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>गत वर्ष (Previous Academic Session) पुराना बकाया:</span>
                </div>
                {totalOldDues > 0 ? (
                  <p className="font-semibold leading-relaxed">
                    विद्यार्थी <strong>{student.name}</strong> का पूर्व सत्र का कुल <strong>{formatINR(totalOldDues)}</strong> पुराना बकाया शेष है। कृपया इसे विद्यालय कार्यालय में संपर्क कर समय पर जमा करें।
                  </p>
                ) : (
                  <p className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>विद्यार्थी का गत शैक्षणिक सत्र का कोई भी पुराना बकाया शेष नहीं है (₹0 - All Cleared)।</span>
                  </p>
                )}
              </div>
            )}

            {/* Detailed Fee Breakdown Table - 100% Mobile Fluid, NO Horizontal Scrollbar */}
            <div className="border-2 border-slate-700 rounded-xl mb-2.5 shadow-2xs print:border-black print:rounded-none overflow-hidden w-full">
              <table className="w-full text-left text-xs sm:text-sm border-collapse print:text-[11px] table-auto">
                <thead>
                  <tr className="bg-slate-800 text-white font-extrabold print:bg-slate-200 print:text-black">
                    <th className="py-1.5 px-1.5 sm:px-3 border-r border-slate-600 print:border-black w-8 sm:w-10 text-center">क्र.</th>
                    <th className="py-1.5 px-2 sm:px-3 border-r border-slate-600 print:border-black">शुल्क का मद (Fee Head)</th>
                    <th className="py-1.5 px-2.5 border-r border-slate-600 print:border-black hidden md:table-cell print:table-cell w-32">श्रेणी</th>
                    <th className="py-1.5 px-2 sm:px-3 text-right w-24 sm:w-32 whitespace-nowrap">राशि (Amount)</th>
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
                          <td className="py-1.5 px-1.5 sm:px-3 border-r border-slate-300 print:border-black text-center font-mono text-slate-600 text-[11px] sm:text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-2 sm:px-3 border-r border-slate-300 print:border-black">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.nameHindi}</span>
                              {isOldDue && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded print:border print:border-black">
                                  गत वर्ष बकाया
                                </span>
                              )}
                              {isRenewable && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-indigo-100 text-indigo-900 rounded print:hidden">
                                  नवीनीकरण
                                </span>
                              )}
                            </div>
                            <span className="text-[9.5px] text-slate-500 font-medium block print:hidden">{item.nameEnglish}</span>
                          </td>
                          <td className="py-1.5 px-2.5 border-r border-slate-300 print:border-black text-slate-600 hidden md:table-cell print:table-cell text-xs">
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
                          <td className="py-1.5 px-2 sm:px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-slate-500 font-semibold text-xs">
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
                        <td colSpan={2} className="py-1.5 px-2 sm:px-3 border-r border-slate-400 text-right text-[11px] sm:text-xs">
                          (अ) गत वर्ष का कुल पुराना बकाया:
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-400 hidden md:table-cell print:table-cell text-xs text-amber-900 font-bold">
                          पूर्व सत्र बकाया
                        </td>
                        <td className="py-1.5 px-2 sm:px-3 text-right font-mono text-xs sm:text-sm text-amber-950 whitespace-nowrap">
                          {formatINR(totalOldDues)}
                        </td>
                      </tr>
                      <tr className="bg-blue-50/60 font-bold text-slate-900 border-t border-slate-300 print:bg-white">
                        <td colSpan={2} className="py-1.5 px-2 sm:px-3 border-r border-slate-400 text-right text-[11px] sm:text-xs">
                          (ब) वर्तमान सत्र {sessionInfo.session} शुल्क:
                        </td>
                        <td className="py-1.5 px-2.5 border-r border-slate-400 hidden md:table-cell print:table-cell text-xs text-blue-900 font-bold">
                          वर्तमान सत्र देय
                        </td>
                        <td className="py-1.5 px-2 sm:px-3 text-right font-mono text-xs sm:text-sm text-blue-950 whitespace-nowrap">
                          {formatINR(currentSessionAmount)}
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Grand Total Row */}
                  <tr className="bg-emerald-50/90 font-black text-slate-900 border-t-2 border-slate-700 print:bg-slate-100 print:border-black">
                    <td colSpan={2} className="py-2 px-2 sm:px-3 border-r border-slate-400 print:border-black text-right text-xs sm:text-sm uppercase tracking-wide">
                      {feeOption === 'prev_year' 
                        ? 'गत वर्ष कुल देय बकाया:' 
                        : feeOption === 'current'
                        ? `वर्तमान सत्र कुल देय:`
                        : 'कुल देय शुल्क योग:'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-400 print:border-black hidden md:table-cell print:table-cell text-xs text-slate-600">
                      {feeOption === 'prev_year' ? 'पूर्व सत्र' : `सत्र ${sessionInfo.session}`}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-right font-mono text-sm sm:text-base text-emerald-900 print:text-black whitespace-nowrap">
                      {formatINR(activeDisplayTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* MANDATORY USER REQUESTED NOTICE (Printed & Screen) */}
            <div className="bg-amber-50/95 border-2 border-amber-400 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-amber-950 mb-2.5 print:p-2 print:border-black print:bg-transparent print:text-[10.5px]">
              <div className="font-black flex items-center gap-1.5 text-amber-900 mb-0.5 print:text-black">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 print:hidden" />
                <span>📌 महत्वपूर्ण सूचना:</span>
              </div>
              <p className="font-bold leading-relaxed text-amber-950 print:text-black">
                डेटा तुरंत अपडेट नहीं होता है। यदि आपने हाल ही में (आज अथवा कल) शुल्क जमा किया है, तो कृपया 1-2 दिन की प्रतीक्षा करें, डेटा स्वतः अपडेट हो जाएगा अथवा विद्यालय कार्यालय में संपर्क करें।
              </p>
              <p className="text-[10.5px] sm:text-xs text-slate-700 mt-1 font-semibold print:text-black">
                • जमा की गई राशि का विवरण/अद्यतन (Paid Fee Update) प्रक्रियाधीन है। अधिक जानकारी हेतु विद्यालय कार्यालय में संपर्क करें।
              </p>
            </div>
          </div>
        ) : isZeroDue ? (
          /* Student has NO Pending Dues */
          <div className="border-2 border-emerald-400 bg-emerald-50/80 rounded-xl p-4 sm:p-6 text-center my-3 relative z-10 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-emerald-950 mb-1">
              कोई शुल्क बकाया नहीं है (No Dues Pending - ₹0)
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800 max-w-md mx-auto mb-2.5">
              विद्यार्थी <strong>{student.name}</strong> (स्कॉलर नं. {student.scholarNo}) का वर्तमान सत्र {sessionInfo.session} का संपूर्ण शुल्क चुकता है।
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 shadow-2xs mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>कार्यालयीन रिकॉर्ड अनुसार वर्तमान बकाया: ₹0 (निरंक)</span>
            </div>

            {/* MANDATORY NOTICE ALSO SHOWN HERE */}
            <div className="text-left bg-amber-50/95 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-950">
              <div className="font-bold text-amber-900 mb-0.5">📌 महत्वपूर्ण सूचना:</div>
              <p className="font-medium">
                डेटा तुरंत अपडेट नहीं होता है। यदि आपने हाल ही में (आज अथवा कल) शुल्क जमा किया है, तो कृपया 1-2 दिन की प्रतीक्षा करें, डेटा स्वतः अपडेट हो जाएगा अथवा विद्यालय कार्यालय में संपर्क करें।
              </p>
            </div>
          </div>
        ) : (
          /* Missing or Not Updated Fee Notice */
          <div className="border-2 border-dashed border-amber-300 bg-amber-50/80 rounded-xl p-4 sm:p-8 text-center my-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              शुल्क विवरण अभी अद्यतन (Update) नहीं हुआ है
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-2.5">
              विद्यार्थी <strong>{student.name}</strong> (स्कॉलर नं. {student.scholarNo}) का शुल्क रिकॉर्ड ऑनलाइन डेटाबेस में संकलित किया जा रहा है।
            </p>
            <div className="text-left bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-950 max-w-lg mx-auto">
              <div className="font-bold text-amber-900 mb-0.5">📌 महत्वपूर्ण सूचना:</div>
              <p className="font-medium">
                डेटा तुरंत अपडेट नहीं होता है। यदि आपने हाल ही में (आज अथवा कल) शुल्क जमा किया है, तो कृपया 1-2 दिन की प्रतीक्षा करें, डेटा स्वतः अपडेट हो जाएगा अथवा विद्यालय कार्यालय में संपर्क करें।
              </p>
            </div>
          </div>
        )}

        {/* Official Stamp & Signatures */}
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-2 relative z-10 border-t border-slate-300 print:border-black print:mt-2 print:pt-1">
          <div className="text-center w-28 sm:w-44">
            <div className="h-6 sm:h-8 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Accountant</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[10.5px] sm:text-xs">
              लेखापाल हस्ताक्षर
            </div>
          </div>

          {/* School Stamp Embellishment */}
          <div className="flex flex-col items-center justify-center opacity-75 print:opacity-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[7px] sm:text-[8px] text-center font-bold text-emerald-900 leading-tight uppercase p-1">
              Official<br />Seal
            </div>
          </div>

          <div className="text-center w-28 sm:w-44">
            <div className="h-6 sm:h-8 flex items-end justify-center">
              <span className="font-serif italic text-[10px] text-slate-400 print:text-slate-600">Principal</span>
            </div>
            <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[10.5px] sm:text-xs">
              प्राचार्य हस्ताक्षर / सील
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
