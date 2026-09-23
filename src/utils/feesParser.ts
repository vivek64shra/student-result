import cachedFeesRaw from '../data/cachedFeesData.json';

export const FEES_GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSv0gTbGo5P8wkB4CYuVIWzvXDOu1INb_L8beoaLYrXIyw9noqOIIln5PxxlP2S9apBakQfq48_YLZ8/pub?output=csv';

export const FEES_GOOGLE_SHEETS_XLSX_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSv0gTbGo5P8wkB4CYuVIWzvXDOu1INb_L8beoaLYrXIyw9noqOIIln5PxxlP2S9apBakQfq48_YLZ8/pub?output=xlsx';

export interface FeeHeadItem {
  id: string;
  nameHindi: string;
  nameEnglish: string;
  category: 'Tuition' | 'Conveyance' | 'Admission' | 'Dues' | 'Other';
  amount: number;
}

export interface StudentFeeRecord {
  sNo: number;
  scholarNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  prevYearDue: number;
  admissionFee: number;
  renewableFee: number;
  boysFund: number;
  inst1Tuition: number;
  inst2Tuition: number;
  inst3Tuition: number;
  inst4Tuition: number;
  inst5Tuition: number;
  totalTuition: number;
  conveyanceJuly: number;
  conveyanceAugust: number;
  conveyanceSeptember: number;
  conveyanceOctober: number;
  conveyanceNovember: number;
  conveyanceDecember: number;
  conveyanceJanuary: number;
  conveyanceFebruary: number;
  conveyanceMarch: number;
  conveyanceApril: number;
  totalConveyance: number;
  decRegistrationFee: number;
  aprilOldDueFee: number;
  lateFee: number;
  advanceAdjustable: number;
  grandTotal: number;
  items: FeeHeadItem[];
}

export function getAcademicSessionInfo(refDate: Date = new Date()): {
  session: string;
  reportDateStr: string;
  feeReportTitle: string;
} {
  // If July 2026 to June 2027 => 2026-27
  // If month is July (7) to Dec (12) of year YYYY, session is YYYY-(YYYY+1)
  // If month is Jan (1) to June (6) of year YYYY, session is (YYYY-1)-YYYY
  const month = refDate.getMonth() + 1; // 1 to 12
  const year = refDate.getFullYear();

  let startYear = year;
  let endYear = year + 1;
  if (month < 7) {
    startYear = year - 1;
    endYear = year;
  }
  const endYearShort = String(endYear).slice(-2);
  const session = `${startYear}-${endYearShort}`;

  const day = String(refDate.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthStr = monthNames[refDate.getMonth()];
  const reportDateStr = `${day}-${monthStr}-${year}`;
  const feeReportTitle = `DUE FEE REPORT AS ON ${reportDateStr}`;

  return { session, reportDateStr, feeReportTitle };
}

function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(num) ? 0 : Math.round(num);
}

export function parseRawFeeRecord(raw: Record<string, any>): StudentFeeRecord {
  const sNo = parseNum(raw['S.No']);
  const scholarNo = String(raw['Scholar No'] || '').trim();
  const studentName = String(raw['Student Name'] || '').trim();
  const fatherName = String(raw['Father Name'] || '').trim();
  const className = String(raw['Class Name'] || '').trim();

  const prevYearDue = parseNum(raw['PREV YEAR DUE PREV YEAR DUE']);
  const admissionFee = parseNum(raw['ADMISSION FEES NEW ADMISSION FEE']);
  const renewableFee = parseNum(raw['RENEWABLE FEE ADMISSION FEE']);
  const boysFund = parseNum(raw['I INS BOYS FUND']);

  const inst1Tuition = parseNum(raw['I INS TUTION FEE']);
  const inst2Tuition = parseNum(raw['II INS TUTION FEE']);
  const inst3Tuition = parseNum(raw['III INS TUTION FEE']);
  const inst4Tuition = parseNum(raw['IV INS TUTION FEE']);
  const inst5Tuition = parseNum(raw['V INS TUTION FEE']);
  const totalTuition = inst1Tuition + inst2Tuition + inst3Tuition + inst4Tuition + inst5Tuition;

  const conveyanceJuly = parseNum(raw['JULY CONVEYANCE FEE']);
  const conveyanceAugust = parseNum(raw['AUGUST CONVEYANCE FEE']);
  const conveyanceSeptember = parseNum(raw['SEPTEMBER CONVEYANCE FEE']);
  const conveyanceOctober = parseNum(raw['OCTOBER CONVEYANCE FEE']);
  const conveyanceNovember = parseNum(raw['NOVEMBER CONVEYANCE FEE']);
  const conveyanceDecember = parseNum(raw['DECEMBER CONVEYANCE FEE']);
  const conveyanceJanuary = parseNum(raw['JANUARY CONVEYANCE FEE']);
  const conveyanceFebruary = parseNum(raw['FEBRUARY CONVEYANCE FEE']);
  const conveyanceMarch = parseNum(raw['MARCH CONVEYANCE FEE']);
  const conveyanceApril = parseNum(raw['APRIL CONVEYANCE FEE']);
  const totalConveyance =
    conveyanceJuly +
    conveyanceAugust +
    conveyanceSeptember +
    conveyanceOctober +
    conveyanceNovember +
    conveyanceDecember +
    conveyanceJanuary +
    conveyanceFebruary +
    conveyanceMarch +
    conveyanceApril;

  const decRegistrationFee = parseNum(raw['DECEMBER REGISTRATION FEE']);
  const aprilOldDueFee = parseNum(raw['APRIL OLD DUE FEE']);
  const lateFee = parseNum(raw['Late Fee']);
  const advanceAdjustable = parseNum(raw['Advance Adjustable']);

  const rawTotal = parseNum(raw['Total']);
  const calculatedTotal =
    prevYearDue +
    admissionFee +
    renewableFee +
    boysFund +
    totalTuition +
    totalConveyance +
    decRegistrationFee +
    aprilOldDueFee +
    lateFee -
    advanceAdjustable;

  const grandTotal = rawTotal > 0 ? rawTotal : calculatedTotal;

  // Build itemized fee breakdown
  // REQUIREMENT: "वार्षिक नवीनीकरण शुल्क ko bhi top me likho"
  const items: FeeHeadItem[] = [];

  // 1. TOP: वार्षिक नवीनीकरण शुल्क (Annual Renewal Fee)
  if (renewableFee > 0) {
    items.push({
      id: 'renewable_fee',
      nameHindi: 'वार्षिक नवीनीकरण शुल्क',
      nameEnglish: 'Annual Renewal Fee',
      category: 'Admission',
      amount: renewableFee,
    });
  }

  // 2. नवीन प्रवेश शुल्क (New Admission Fee)
  if (admissionFee > 0) {
    items.push({
      id: 'admission_fee',
      nameHindi: 'नवीन प्रवेश शुल्क',
      nameEnglish: 'New Admission Fee',
      category: 'Admission',
      amount: admissionFee,
    });
  }

  // 3. गत वर्ष का बकाया (Previous Year Due)
  if (prevYearDue > 0) {
    items.push({
      id: 'prev_year_due',
      nameHindi: 'गत वर्ष का पुराना बकाया',
      nameEnglish: 'Previous Year Dues',
      category: 'Dues',
      amount: prevYearDue,
    });
  }

  // 4. बालक निधि
  if (boysFund > 0) {
    items.push({
      id: 'boys_fund',
      nameHindi: 'प्रथम किश्त बालक निधि',
      nameEnglish: 'I Installment Boys Fund',
      category: 'Other',
      amount: boysFund,
    });
  }

  // 5. शिक्षण शुल्क किश्तें (Tuition Fee Installments)
  if (inst1Tuition > 0) {
    items.push({
      id: 'inst1_tuition',
      nameHindi: 'प्रथम किश्त शिक्षण शुल्क (I Term)',
      nameEnglish: 'I Installment Tuition Fee',
      category: 'Tuition',
      amount: inst1Tuition,
    });
  }

  if (inst2Tuition > 0) {
    items.push({
      id: 'inst2_tuition',
      nameHindi: 'द्वितीय किश्त शिक्षण शुल्क (II Term)',
      nameEnglish: 'II Installment Tuition Fee',
      category: 'Tuition',
      amount: inst2Tuition,
    });
  }

  if (inst3Tuition > 0) {
    items.push({
      id: 'inst3_tuition',
      nameHindi: 'तृतीय किश्त शिक्षण शुल्क (III Term)',
      nameEnglish: 'III Installment Tuition Fee',
      category: 'Tuition',
      amount: inst3Tuition,
    });
  }

  if (inst4Tuition > 0) {
    items.push({
      id: 'inst4_tuition',
      nameHindi: 'चतुर्थ किश्त शिक्षण शुल्क (IV Term)',
      nameEnglish: 'IV Installment Tuition Fee',
      category: 'Tuition',
      amount: inst4Tuition,
    });
  }

  if (inst5Tuition > 0) {
    items.push({
      id: 'inst5_tuition',
      nameHindi: 'पंचम किश्त शिक्षण शुल्क (V Term)',
      nameEnglish: 'V Installment Tuition Fee',
      category: 'Tuition',
      amount: inst5Tuition,
    });
  }

  // 6. वाहन/बस शुल्क (Monthly conveyance breakdown)
  const conveyanceMonths = [
    { monthHindi: 'जुलाई', monthEng: 'July', val: conveyanceJuly },
    { monthHindi: 'अगस्त', monthEng: 'August', val: conveyanceAugust },
    { monthHindi: 'सितम्बर', monthEng: 'September', val: conveyanceSeptember },
    { monthHindi: 'अक्टूबर', monthEng: 'October', val: conveyanceOctober },
    { monthHindi: 'नवम्बर', monthEng: 'November', val: conveyanceNovember },
    { monthHindi: 'दिसम्बर', monthEng: 'December', val: conveyanceDecember },
    { monthHindi: 'जनवरी', monthEng: 'January', val: conveyanceJanuary },
    { monthHindi: 'फ़रवरी', monthEng: 'February', val: conveyanceFebruary },
    { monthHindi: 'मार्च', monthEng: 'March', val: conveyanceMarch },
    { monthHindi: 'अप्रैल', monthEng: 'April', val: conveyanceApril },
  ];

  conveyanceMonths.forEach((m) => {
    if (m.val > 0) {
      items.push({
        id: `conveyance_${m.monthEng.toLowerCase()}`,
        nameHindi: `${m.monthHindi} वाहन/बस शुल्क`,
        nameEnglish: `${m.monthEng} Conveyance Fee`,
        category: 'Conveyance',
        amount: m.val,
      });
    }
  });

  if (decRegistrationFee > 0) {
    items.push({
      id: 'dec_reg_fee',
      nameHindi: 'दिसम्बर पंजीयन/बोर्ड शुल्क',
      nameEnglish: 'December Registration Fee',
      category: 'Other',
      amount: decRegistrationFee,
    });
  }

  if (aprilOldDueFee > 0) {
    items.push({
      id: 'april_old_due',
      nameHindi: 'अप्रैल पुराना बकाया शुल्क',
      nameEnglish: 'April Old Due Fee',
      category: 'Dues',
      amount: aprilOldDueFee,
    });
  }

  if (lateFee > 0) {
    items.push({
      id: 'late_fee',
      nameHindi: 'विलंब शुल्क (Late Fee)',
      nameEnglish: 'Late Fee',
      category: 'Other',
      amount: lateFee,
    });
  }

  if (advanceAdjustable > 0) {
    items.push({
      id: 'advance_adjustable',
      nameHindi: 'अग्रिम समायोजन (छूट/समायोजित)',
      nameEnglish: 'Advance Adjustable (-)',
      category: 'Other',
      amount: -advanceAdjustable,
    });
  }

  return {
    sNo,
    scholarNo,
    studentName,
    fatherName,
    className,
    prevYearDue,
    admissionFee,
    renewableFee,
    boysFund,
    inst1Tuition,
    inst2Tuition,
    inst3Tuition,
    inst4Tuition,
    inst5Tuition,
    totalTuition,
    conveyanceJuly,
    conveyanceAugust,
    conveyanceSeptember,
    conveyanceOctober,
    conveyanceNovember,
    conveyanceDecember,
    conveyanceJanuary,
    conveyanceFebruary,
    conveyanceMarch,
    conveyanceApril,
    totalConveyance,
    decRegistrationFee,
    aprilOldDueFee,
    lateFee,
    advanceAdjustable,
    grandTotal,
    items,
  };
}

export function getInitialCachedFees(): StudentFeeRecord[] {
  const rawList = cachedFeesRaw as unknown as Record<string, any>[];
  return rawList.map(parseRawFeeRecord);
}

export async function fetchLiveFeesData(): Promise<StudentFeeRecord[]> {
  try {
    let text: string | null = null;
    try {
      const res = await fetch(FEES_GOOGLE_SHEETS_CSV_URL);
      if (res.ok) {
        text = await res.text();
      }
    } catch (directErr) {
      console.warn('Direct Google Sheet fees fetch failed, trying proxy endpoint...', directErr);
    }

    if (!text) {
      try {
        const proxyRes = await fetch('/api/proxy/fees');
        if (proxyRes.ok) {
          text = await proxyRes.text();
        }
      } catch (proxyErr) {
        console.warn('Proxy fees fetch failed:', proxyErr);
      }
    }

    if (!text) {
      throw new Error('Unable to retrieve fees from direct or proxy endpoints');
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return getInitialCachedFees();

    // Dynamically search for the true header line containing 'Student Name' and 'Scholar No'
    let headerIndex = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const lineLower = lines[i].toLowerCase();
      if (lineLower.includes('student name') && lineLower.includes('scholar no')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      console.warn('Could not detect fee header row, falling back to cached fees');
      return getInitialCachedFees();
    }

    const headers = lines[headerIndex].split(',').map((h) => h.trim());
    const records: StudentFeeRecord[] = [];

    for (let i = headerIndex + 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      const raw: Record<string, any> = {};
      headers.forEach((h, idx) => {
        if (h) {
          raw[h] = parts[idx] ?? '';
        }
      });
      // S.No fallback if not mapped
      if (!raw['S.No'] && parts[0]) {
        raw['S.No'] = parts[0];
      }
      const rec = parseRawFeeRecord(raw);
      if (rec.scholarNo && rec.studentName) {
        records.push(rec);
      }
    }

    return records.length > 0 ? records : getInitialCachedFees();
  } catch (err: any) {
    console.warn('Failed to fetch live fees from Google Sheets, using cached:', err.message);
    return getInitialCachedFees();
  }
}

export function findStudentFeeRecord(
  feeList: StudentFeeRecord[],
  scholarNo?: string | number,
  rollNo?: string | number,
  studentName?: string
): StudentFeeRecord | null {
  if (!feeList || feeList.length === 0) return null;

  const rawScholar = String(scholarNo ?? '').trim().toLowerCase();
  const numScholar = rawScholar ? parseInt(rawScholar, 10) : NaN;
  const rawRoll = String(rollNo ?? '').trim().toLowerCase();
  const numRoll = rawRoll ? parseInt(rawRoll, 10) : NaN;
  const cleanName = studentName ? String(studentName).trim().toLowerCase() : '';

  // 1. Primary: Match by exact Scholar No (string or numeric comparison)
  if (rawScholar) {
    const foundByScholar = feeList.find((f) => {
      const fScholar = String(f.scholarNo ?? '').trim().toLowerCase();
      if (fScholar === rawScholar) return true;
      if (!isNaN(numScholar) && parseInt(fScholar, 10) === numScholar) return true;
      return false;
    });
    if (foundByScholar) return foundByScholar;
  }

  // 2. Secondary: Match by roll number if scholar equals roll number in some cases
  if (rawRoll) {
    const foundByRoll = feeList.find((f) => {
      const fScholar = String(f.scholarNo ?? '').trim().toLowerCase();
      if (fScholar === rawRoll) return true;
      if (!isNaN(numRoll) && parseInt(fScholar, 10) === numRoll) return true;
      return false;
    });
    if (foundByRoll) return foundByRoll;
  }

  // 3. Fallback: Match by student name
  if (cleanName && cleanName.length >= 4) {
    const foundByName = feeList.find((f) => {
      const fName = String(f.studentName ?? '').trim().toLowerCase();
      return fName.includes(cleanName) || cleanName.includes(fName);
    });
    if (foundByName) return foundByName;
  }

  return null;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}
