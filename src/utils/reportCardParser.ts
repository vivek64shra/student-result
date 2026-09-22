import cachedData from '../data/cachedSheetData.json';
import * as XLSX from 'xlsx';

export interface SchoolInfo {
  schoolName: string;
  location: string;
  diceCode: string;
  institutionCode: string;
  academicSession: string;
}

export interface SubjectMarksRow {
  name: string;
  theoryMaxMarks: number;
  theoryMinMarks: number;
  theory: string | number;
  projectMaxMarks?: number;
  projectMinMarks?: number;
  project?: string | number;
  maxMarks: number;
  minMarks: number;
  total: string | number;
  isDistn: boolean;
  isTheoryFailed?: boolean;
}

export interface ExamSectionData {
  title: string;
  classTheoryMax: number;
  classTheoryMin: number;
  classProjectMax: number;
  rows: SubjectMarksRow[];
  hasProject: boolean;
  hasAnyDistn: boolean;
  totalMaxMarks: number;
  totalMinMarks: number;
  grandTotal: string | number;
  percentage: string;
  classRank: string | number;
  result: string;
}

export interface ParsedStudent {
  scholarNo: string;
  rollNo: string;
  name: string;
  fatherName: string;
  mobile: string;
  className: string;
  sheetName: string;
  quarterly: ExamSectionData | null;
  halfYearly: ExamSectionData | null;
  annual: ExamSectionData | null;
  rawRow: any[];
}

export const SCHOOL_LOGO_URL =
  'https://www.online.edumentsolution.com/ImageHandler.ashx?pTbl=ApplicationConfig&pImgFiled=iLogo1&pTblFiled=nCampusID&pVal=2&pDBName=My2070';

export const SCHOOL_INFO: SchoolInfo = {
  schoolName: 'माँ दुर्गा उच्च. माध्य. विद्यालय सेमरिया, जिला-रीवा (म.प्र.)',
  location: 'सेमरिया, जिला-रीवा (म.प्र.)',
  diceCode: '23140402055',
  institutionCode: '322517',
  academicSession: '2025-26',
};

export const DEFAULT_UPDATE_TIMESTAMP = '22-Sep-2026, 04:30 PM';

export const GOOGLE_SHEETS_PUBHTML_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJACfw2mytnCs_RBtLI4UbW5DKj15umzZJ36XNybQqCLn9wYmkeJKu_M8lTbKEG9-1mNlO3D8R1Kf6/pubhtml';

export const GOOGLE_SHEETS_EXPORT_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTJACfw2mytnCs_RBtLI4UbW5DKj15umzZJ36XNybQqCLn9wYmkeJKu_M8lTbKEG9-1mNlO3D8R1Kf6/pub?output=xlsx';

export function compareClassNames(a: string, b: string): number {
  const getOrder = (name: string): number => {
    const s = name.toUpperCase().trim();
    if (s.includes('NURSERY')) return 1;
    if (s.includes('LKG')) return 2;
    if (s.includes('UKG') || s.includes('KG')) return 3;
    if (s === '1' || s.startsWith('1ST')) return 10;
    if (s === '2' || s.startsWith('2ND')) return 20;
    if (s === '3' || s.startsWith('3RD')) return 30;
    if (s === '4' || s.startsWith('4TH')) return 40;
    if (s === '5' || s.startsWith('5TH')) return 50;
    if (s === '6' || s.startsWith('6TH')) return 60;
    if (s === '7' || s.startsWith('7TH')) return 70;
    if (s === '8' || s.startsWith('8TH')) return 80;
    if (s === '9A') return 91;
    if (s === '9B') return 92;
    if (s === '9C') return 93;
    if (s.startsWith('9')) return 90;
    if (s === '10A') return 101;
    if (s === '10B') return 102;
    if (s === '10C') return 103;
    if (s.startsWith('10')) return 100;
    if (s === '11M') return 111;
    if (s === '11B') return 112;
    if (s === '11C') return 113;
    if (s.startsWith('11')) return 110;
    if (s === '12M') return 121;
    if (s === '12B') return 122;
    if (s === '12C') return 123;
    if (s.startsWith('12')) return 120;
    return 999;
  };
  return getOrder(a) - getOrder(b);
}

export function formatUpdateTimestamp(date: Date = new Date()): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${day}-${month}-${year}, ${strHours}:${minutes} ${ampm}`;
}

export function parseSheetDatabase(sheetsDb: Record<string, any[][]>): ParsedStudent[] {
  const allStudents: ParsedStudent[] = [];

  for (const [sheetName, sheetRows] of Object.entries(sheetsDb)) {
    if (!sheetRows || sheetRows.length < 5) continue;

    const cleanSheetKey = sheetName.trim().toLowerCase();
    if (
      cleanSheetKey === 'formula' ||
      cleanSheetKey.includes('master') ||
      cleanSheetKey.includes('template')
    ) {
      continue;
    }

    // Dynamically locate field header row (contains SCOLAR / ROLL NO / Candidate / सैद्धांतिक)
    let fieldHeaderIdx = -1;
    for (let r = 0; r < Math.min(10, sheetRows.length); r++) {
      const row = sheetRows[r] || [];
      const rowStr = row.map((c) => String(c || '')).join(' ').toUpperCase();
      if (
        rowStr.includes('SCOLAR') ||
        rowStr.includes('SCHOLAR') ||
        rowStr.includes('ROLL NO') ||
        rowStr.includes('CANDIDATE') ||
        rowStr.includes('सैद्धांतिक')
      ) {
        fieldHeaderIdx = r;
        break;
      }
    }
    if (fieldHeaderIdx === -1) fieldHeaderIdx = 3;

    // Sub-header (Subject names: HINDI, ENGLISH, etc.) sits right above fieldHeaderIdx
    const subHeaderIdx = Math.max(0, fieldHeaderIdx - 1);

    // School/Class header sits above subHeaderIdx
    let rawHeaderIdx = -1;
    for (let r = 0; r < subHeaderIdx; r++) {
      const row = sheetRows[r] || [];
      const rowStr = row.map((c) => String(c || '')).join(' ');
      if (
        rowStr.includes('विद्यालय') ||
        rowStr.includes('कक्षा') ||
        rowStr.includes('परीक्षाफल') ||
        rowStr.includes('माँ दुर्गा')
      ) {
        rawHeaderIdx = r;
        break;
      }
    }
    if (rawHeaderIdx === -1) rawHeaderIdx = Math.max(0, subHeaderIdx - 1);

    // Max marks row sits right below fieldHeaderIdx (contains 'पूर्णांक' or numbers >= 40)
    let maxMarksRowIdx = fieldHeaderIdx + 1;
    if (sheetRows[maxMarksRowIdx]) {
      const mmRowStr = (sheetRows[maxMarksRowIdx] || []).map((c) => String(c || '')).join(' ');
      if (
        !mmRowStr.includes('पूर्णांक') &&
        !(sheetRows[maxMarksRowIdx] || []).some((c) => typeof c === 'number' && c >= 40 && c <= 100)
      ) {
        if (sheetRows[maxMarksRowIdx + 1]) {
          const nextStr = (sheetRows[maxMarksRowIdx + 1] || []).map((c) => String(c || '')).join(' ');
          if (nextStr.includes('पूर्णांक')) maxMarksRowIdx++;
        }
      }
    }

    const studentStartIdx = maxMarksRowIdx + 1;

    const rawHeader = sheetRows[rawHeaderIdx] || [];
    const subHeader = sheetRows[subHeaderIdx] || [];
    const fieldHeader = sheetRows[fieldHeaderIdx] || [];
    const maxMarksRow = sheetRows[maxMarksRowIdx] || [];

    const headerText = rawHeader.find(
      (c) => typeof c === 'string' && (c.includes('कक्षा') || c.includes('Class'))
    );
    let classText = sheetName.toUpperCase();
    if (headerText) {
      const match = headerText.match(/कक्षा\s*[-:]?\s*([^\s,]+)/i);
      if (match && match[1]) {
        classText = match[1];
      }
    }

    for (let r = studentStartIdx; r < sheetRows.length; r++) {
      const student = sheetRows[r];
      if (!student || student.length < 3) continue;

      const scholarNo = student[0] !== undefined && student[0] !== null ? String(student[0]).trim() : '';
      const rollNo = student[1] !== undefined && student[1] !== null ? String(student[1]).trim() : '';
      const name = student[2] !== undefined && student[2] !== null ? String(student[2]).trim() : '';
      const fatherName = student[3] !== undefined && student[3] !== null ? String(student[3]).trim() : '';
      const mobile = student[4] !== undefined && student[4] !== null ? String(student[4]).trim() : '';

      if (!name && !scholarNo && !rollNo) continue;

      const lowerName = name.toLowerCase().trim();
      const lowerFather = fatherName.toLowerCase().trim();
      if (
        lowerName.includes('candidate') ||
        lowerName.includes('student') ||
        lowerName.includes('विद्यार्थी') ||
        lowerName.includes('महायोग') ||
        lowerName.includes('परीक्षार्थी') ||
        lowerName.includes('total') ||
        lowerName.includes('pass') ||
        lowerName.includes('fail') ||
        lowerName.includes('abs.') ||
        lowerFather.includes('student') ||
        lowerFather.includes('pass') ||
        lowerFather.includes('fail') ||
        lowerFather.includes('abs.') ||
        (!isNaN(Number(name)) && !scholarNo && !rollNo)
      ) {
        continue;
      }

      const parseSection = (
        title: string,
        startIdx: number,
        totalIdx: number,
        perIdx: number,
        rankIdx: number,
        resIdx: number,
        defaultSubjectMax: number = 50
      ): ExamSectionData | null => {
        const indices = [
          startIdx,
          startIdx + 3,
          startIdx + 6,
          startIdx + 9,
          startIdx + 12,
          startIdx + 15,
        ];

        let hasProject = false;
        let hasAnyDistn = false;
        const rowsToDisplay: SubjectMarksRow[] = [];
        let calculatedSum = 0;
        let totalMaxMarks = 0;
        let totalMinMarks = 0;
        let detectedClassTheoryMax = defaultSubjectMax;
        let failedSubjectsCount = 0;

        indices.forEach((idx) => {
          const subName = subHeader[idx] || `Subject ${(idx - startIdx) / 3 + 1}`;
          const theory = student[idx];
          const proj = student[idx + 1];
          const total = student[idx + 2];

          const isGiven = (v: any) =>
            v !== undefined &&
            v !== null &&
            String(v).trim() !== '' &&
            String(v).trim() !== '-' &&
            String(v).toLowerCase() !== 'null' &&
            String(v).toLowerCase() !== 'undefined';

          const hasTheory = isGiven(theory);
          const hasProj = isGiven(proj);
          const hasTotal = isGiven(total);

          let subjectHasData = false;
          if (hasTheory || hasProj) {
            subjectHasData = true;
          } else if (hasTotal) {
            const strTotal = String(total).trim().toUpperCase();
            if (strTotal !== 'FAIL' && strTotal !== '#NAME?' && strTotal !== '0') {
              subjectHasData = true;
            }
          }

          if (subjectHasData) {
            const isActualProj = hasProj && String(proj).toLowerCase() !== 'nan';
            if (isActualProj) {
              hasProject = true;
            }

            const rawMaxVal = maxMarksRow[idx];
            const numRawMax = Number(rawMaxVal);
            const theoryMax = !isNaN(numRawMax) && numRawMax > 0 ? numRawMax : defaultSubjectMax;

            if (detectedClassTheoryMax === defaultSubjectMax && !isNaN(numRawMax) && numRawMax > 0) {
              detectedClassTheoryMax = numRawMax;
            }

            let projectMax = 0;
            let subjectMax = theoryMax;

            // Logical handling for senior secondary & classes with Theory + Project (e.g., 11th Com, Maths, Bio)
            if (isActualProj) {
              if (theoryMax === 80) {
                projectMax = 20;
                subjectMax = 100;
              } else if (theoryMax === 75) {
                projectMax = 25;
                subjectMax = 100;
              } else if (theoryMax === 70) {
                projectMax = 30;
                subjectMax = 100;
              } else if (theoryMax === 50) {
                projectMax = 0;
                subjectMax = 50;
              } else {
                projectMax = 20;
                subjectMax = theoryMax + projectMax;
              }
            }

            // In Theory 80: passing mark is 1/3 of 80 = 26.666... ≈ 27 marks!
            // Passing requirement is strictly on Theory obtaining at least 1/3 (27 marks).
            const theoryMin = Math.ceil(theoryMax * 0.33); // e.g. 80 => 27
            const subjectMin = Math.round(subjectMax * 0.33); // e.g. 100 => 33
            const projectMin = projectMax > 0 ? Math.round(projectMax * 0.33) : undefined;

            const numTheory = Number(theory);
            const isTheoryNumeric = !isNaN(numTheory) && hasTheory;
            const isTheoryFailed = isTheoryNumeric && numTheory < theoryMin;

            const numProj = Number(proj);
            const isProjNumeric = !isNaN(numProj) && isActualProj;

            // Calculate actual earned subject score (Theory + Project)
            // Even if Excel placed 'FAIL' due to formula =IF(th<27, 'FAIL', th+pr),
            // calculate the real marks obtained so grand total & percentage reflect reality!
            let subjectScore = 0;
            let resolvedTotal: string | number = total;
            const numTotal = Number(total);

            if (!isNaN(numTotal) && numTotal > 0 && String(total).trim().toUpperCase() !== 'FAIL') {
              subjectScore = numTotal;
              resolvedTotal = numTotal;
            } else if (isTheoryNumeric || isProjNumeric) {
              const thVal = isTheoryNumeric ? numTheory : 0;
              const prVal = isProjNumeric ? numProj : 0;
              subjectScore = thVal + prVal;
              resolvedTotal = subjectScore;
            } else if (String(theory).trim().toUpperCase() === 'ABS') {
              resolvedTotal = 'ABS';
              subjectScore = 0;
            } else {
              resolvedTotal = hasTotal ? total : '0';
            }

            if (isTheoryFailed || String(total).trim().toUpperCase() === 'FAIL' || (subjectScore < subjectMin && !isNaN(subjectScore) && subjectScore > 0)) {
              failedSubjectsCount++;
            }

            const isDistn = subjectScore >= Math.round(subjectMax * 0.75);
            if (isDistn) hasAnyDistn = true;

            calculatedSum += subjectScore;
            totalMaxMarks += subjectMax;
            totalMinMarks += subjectMin;

            rowsToDisplay.push({
              name: subName,
              theoryMaxMarks: theoryMax,
              theoryMinMarks: theoryMin,
              theory: hasTheory ? theory : '-',
              projectMaxMarks: projectMax > 0 ? projectMax : undefined,
              projectMinMarks: projectMin,
              project: isActualProj ? proj : '-',
              maxMarks: subjectMax,
              minMarks: subjectMin,
              total: resolvedTotal,
              isDistn,
              isTheoryFailed,
            });
          }
        });

        if (rowsToDisplay.length === 0) return null;

        // Resolve Grand Total (prevent #NAME? or 0 when Excel formula failed)
        let rawTotal = student[totalIdx];
        let displayTotal: string | number = '0';
        const numRawTotal = Number(rawTotal);

        if (!isNaN(numRawTotal) && numRawTotal > 0 && String(rawTotal) !== '#NAME?') {
          displayTotal = numRawTotal;
        } else if (calculatedSum > 0) {
          displayTotal = calculatedSum;
        } else {
          displayTotal = '0';
        }

        // Resolve Percentage
        let displayPer = '0.00';
        const finalNumericSum = typeof displayTotal === 'number' ? displayTotal : calculatedSum;
        if (totalMaxMarks > 0 && finalNumericSum > 0) {
          displayPer = ((finalNumericSum / totalMaxMarks) * 100).toFixed(2);
        } else {
          const rawPer = student[perIdx];
          const numPer = parseFloat(String(rawPer));
          if (!isNaN(numPer) && numPer > 0) {
            displayPer = numPer.toFixed(2);
          }
        }

        const rawRank = student[rankIdx] !== undefined && student[rankIdx] !== null && String(student[rankIdx]) !== '#NAME?' ? student[rankIdx] : '-';
        const rawRes = student[resIdx] !== undefined && student[resIdx] !== null ? String(student[resIdx]).trim() : '-';

        let result = rawRes;
        const numPer = parseFloat(displayPer);
        const isFormulaError = !result || result === '#NAME?' || result === '-' || result === '' || result === '0';
        const isFalseFail = result.toUpperCase().includes('FAIL') && failedSubjectsCount === 0 && numPer >= 33;

        if (isFormulaError || isFalseFail) {
          if (failedSubjectsCount === 0 && numPer >= 33) {
            if (numPer >= 75) {
              result = 'DISTINCTION (विशेष योग्यता)';
            } else if (numPer >= 60) {
              result = 'FIRST (प्रथम)';
            } else if (numPer >= 45) {
              result = 'SECOND (द्वितीय)';
            } else {
              result = 'PASS (उत्तीर्ण)';
            }
          } else if (failedSubjectsCount === 1) {
            result = 'SUPPL. (पूरक)';
          } else {
            result = 'FAIL (अनुत्तीर्ण)';
          }
        } else if (result.toUpperCase().includes('FIRST') && !result.includes('(')) {
          result = 'FIRST (प्रथम)';
        } else if (result.toUpperCase().includes('SECOND') && !result.includes('(')) {
          result = 'SECOND (द्वितीय)';
        } else if (result.toUpperCase().includes('THIRD') && !result.includes('(')) {
          result = 'THIRD (तृतीय)';
        } else if (result.toUpperCase() === 'PASS' && !result.includes('(')) {
          result = 'PASS (उत्तीर्ण)';
        } else if (result.toUpperCase().includes('SUPPL') && !result.includes('(')) {
          result = 'SUPPL. (पूरक)';
        } else if (result.toUpperCase() === 'FAIL' && !result.includes('(')) {
          result = 'FAIL (अनुत्तीर्ण)';
        }

        const classTheoryMin = Math.ceil(detectedClassTheoryMax * 0.33);
        const classProjectMax = hasProject
          ? detectedClassTheoryMax === 80
            ? 20
            : detectedClassTheoryMax === 75
            ? 25
            : detectedClassTheoryMax === 70
            ? 30
            : 0
          : 0;

        return {
          title,
          classTheoryMax: detectedClassTheoryMax,
          classTheoryMin,
          classProjectMax,
          rows: rowsToDisplay,
          hasProject,
          hasAnyDistn,
          totalMaxMarks,
          totalMinMarks,
          grandTotal: displayTotal,
          percentage: displayPer,
          classRank: rawRank,
          result,
        };
      };

      const quarterly = parseSection('1. त्रैमासिक परीक्षा (QUARTERLY)', 5, 23, 24, 25, 26, 50);
      const halfYearly = parseSection('2. अर्द्धवार्षिक परीक्षा (HALF-YEARLY)', 27, 45, 46, 47, 48, 60);
      const annual = parseSection('3. वार्षिक परीक्षा (ANNUAL)', 49, 67, 68, 69, 70, 60);

      allStudents.push({
        scholarNo,
        rollNo,
        name,
        fatherName,
        mobile,
        className: classText,
        sheetName,
        quarterly,
        halfYearly,
        annual,
        rawRow: student,
      });
    }
  }

  // Post-processing: Calculate accurate class rank for each class and exam section
  const classesMap = new Map<string, ParsedStudent[]>();
  for (const s of allStudents) {
    const list = classesMap.get(s.className) || [];
    list.push(s);
    classesMap.set(s.className, list);
  }

  const examKeys: Array<'quarterly' | 'halfYearly' | 'annual'> = ['quarterly', 'halfYearly', 'annual'];

  classesMap.forEach((classStudents) => {
    examKeys.forEach((examKey) => {
      // Filter students who appeared in this exam
      const studentsWithExam = classStudents.filter((s) => {
        const sec = s[examKey];
        if (!sec) return false;
        const tot = typeof sec.grandTotal === 'number' ? sec.grandTotal : Number(sec.grandTotal);
        return !isNaN(tot) && tot > 0;
      });

      if (studentsWithExam.length === 0) return;

      // Sort descending by grand total, then percentage
      studentsWithExam.sort((a, b) => {
        const totA = Number(a[examKey]!.grandTotal) || 0;
        const totB = Number(b[examKey]!.grandTotal) || 0;
        if (totB !== totA) return totB - totA;
        return parseFloat(b[examKey]!.percentage) - parseFloat(a[examKey]!.percentage);
      });

      // Assign ranking
      let rank = 1;
      studentsWithExam.forEach((s, idx) => {
        if (idx > 0) {
          const prevTotal = Number(studentsWithExam[idx - 1][examKey]!.grandTotal) || 0;
          const currTotal = Number(s[examKey]!.grandTotal) || 0;
          if (currTotal < prevTotal) {
            rank = idx + 1;
          }
        }
        s[examKey]!.classRank = rank;
      });

      // Non-appearing / 0 marks students get rank '-'
      classStudents.forEach((s) => {
        if (s[examKey] && (!s[examKey]!.grandTotal || Number(s[examKey]!.grandTotal) <= 0)) {
          s[examKey]!.classRank = '-';
        }
      });
    });
  });

  return allStudents;
}

export function getInitialCachedStudents(): { db: Record<string, any[][]>; students: ParsedStudent[] } {
  const db = cachedData as unknown as Record<string, any[][]>;
  const students = parseSheetDatabase(db);
  return { db, students };
}

export async function fetchLiveGoogleSheetData(): Promise<{ db: Record<string, any[][]>; students: ParsedStudent[] }> {
  try {
    const res = await fetch(GOOGLE_SHEETS_EXPORT_URL);
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const newDb: Record<string, any[][]> = {};

    workbook.SheetNames.forEach((sheetName) => {
      const cleanKey = sheetName.trim().toLowerCase();
      if (cleanKey === 'formula' || cleanKey.includes('master') || cleanKey.includes('template')) return;
      const worksheet = workbook.Sheets[sheetName];
      if (worksheet) {
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          blankrows: false,
        });
        newDb[cleanKey] = rawJson;
      }
    });

    const students = parseSheetDatabase(newDb);
    return { db: newDb, students };
  } catch (err: any) {
    console.warn('Failed to fetch live results from Google Sheets, using cached data:', err.message);
    return getInitialCachedStudents();
  }
}
