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
}

export interface ExamSectionData {
  title: string;
  classTheoryMax: number;
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

// URL for direct XLSX export of all sheets
export const GOOGLE_SHEETS_XLSX_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsD6nI9DvWnX3ln0S_w3_od-OSUJQHKxL-WqoSKsFduT2U9bhTI5o6xGGuZc33rQ/pub?output=xlsx';

export const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsD6nI9DvWnX3ln0S_w3_od-OSUJQHKxL-WqoSKsFduT2U9bhTI5o6xGGuZc33rQ/pub?output=csv';

// Helper to determine standard class name from sheet rows or sheet name
export function detectClassName(sheetName: string, rows: any[][]): string {
  if (rows && rows[0]) {
    // 1. Check F1 (index 5)
    const f1 = String(rows[0][5] || '');
    const m1 = f1.match(/\(([^)]+)\)/);
    if (m1 && m1[1] && m1[1].trim() !== 'म.प्र.') {
      return m1[1].trim();
    }

    // 2. Check row 0 column 0
    const r0 = String(rows[0][0] || '');
    const m2 = r0.match(/कक्षा\s*-\s*([A-Za-z0-9\s]+)/i);
    if (m2 && m2[1]) {
      return m2[1].trim();
    }
  }

  // Fallback to formatted sheetName
  const sn = sheetName.toUpperCase();
  if (sn === 'LKG') return 'LKG';
  if (sn.startsWith('9')) return `Class 9 (${sn.slice(1).toUpperCase()})`;
  if (sn.startsWith('10')) return `Class 10 (${sn.slice(2).toUpperCase()})`;
  if (sn.startsWith('11')) return `Class 11 (${sn.slice(2).toUpperCase()})`;
  if (sn.startsWith('12')) return `Class 12 (${sn.slice(2).toUpperCase()})`;
  return `Class ${sn}`;
}

export function parseSheetDatabase(db: Record<string, any[][]>): ParsedStudent[] {
  const allStudents: ParsedStudent[] = [];

  for (const sheetName in db) {
    if (sheetName.toLowerCase() === 'formula') continue;
    const rows = db[sheetName];
    if (!rows || rows.length < 5) continue;

    const rawRows = rows;
    const subHeader = rows[1] || [];
    const maxMarksRow = rows[3] || [];
    const classText = detectClassName(sheetName, rawRows);

    for (let i = 4; i < rows.length; i++) {
      const student = rows[i];
      if (!student || (!student[0] && !student[1] && !student[2])) continue;

      const scholarNo = String(student[0] || '').trim();
      const rollNo = String(student[1] || '').trim();
      const name = String(student[2] || '').trim();
      const fatherName = String(student[3] || '').trim();
      const mobile = String(student[4] || '').trim();

      // Skip empty row or invalid name
      if (!name || name === '0' || name === 'undefined' || name === 'null') continue;

      const parseSection = (
        title: string,
        startIdx: number,
        totalIdx: number,
        perIdx: number,
        rankIdx: number,
        resIdx: number,
        defaultSubjectMax = 50
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

        indices.forEach((idx) => {
          const subName = subHeader[idx] || `Subject ${(idx - startIdx) / 3 + 1}`;
          const theory = student[idx];
          const proj = student[idx + 1];
          const total = student[idx + 2];

          // Check if subject has meaningful data or if it should be hidden
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

          // If theory & proj are absent, and total is either absent or just empty placeholder / default formula "FAIL", hide this subject
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

            // Calculate Theory Max Marks dynamically from row 3 (top of class)
            const rawMaxVal = maxMarksRow[idx];
            const numRawMax = Number(rawMaxVal);
            const theoryMax = !isNaN(numRawMax) && numRawMax > 0 ? numRawMax : defaultSubjectMax;

            if (detectedClassTheoryMax === defaultSubjectMax && !isNaN(numRawMax) && numRawMax > 0) {
              detectedClassTheoryMax = numRawMax;
            }

            let projectMax = 0;
            let subjectMax = theoryMax;

            // In senior classes (9-12), if theory max is 75/80/70 and project is added, total max is 100
            if (isActualProj) {
              if (theoryMax === 75) {
                projectMax = 25;
                subjectMax = 100;
              } else if (theoryMax === 80) {
                projectMax = 20;
                subjectMax = 100;
              } else if (theoryMax === 70) {
                projectMax = 30;
                subjectMax = 100;
              } else if (theoryMax === 50) {
                projectMax = 0;
                subjectMax = 50;
              }
            }

            const subjectMin = Math.round(subjectMax * 0.33);
            const theoryMin = Math.round(theoryMax * 0.33);
            const projectMin = projectMax > 0 ? Math.round(projectMax * 0.33) : undefined;

            const numTotal = Number(total);
            const isDistn = !isNaN(numTotal) && numTotal >= Math.round(subjectMax * 0.75);
            if (isDistn) hasAnyDistn = true;

            if (!isNaN(numTotal) && numTotal > 0) {
              calculatedSum += numTotal;
            }
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
              total: hasTotal ? total : '0',
              isDistn,
            });
          }
        });

        if (rowsToDisplay.length === 0) return null;

        // Resolve Grand Total
        let rawTotal = student[totalIdx];
        let displayTotal: string | number = '0';
        if (rawTotal !== undefined && rawTotal !== null && rawTotal !== '#NAME?' && String(rawTotal).trim() !== '') {
          displayTotal = rawTotal;
        } else if (calculatedSum > 0) {
          displayTotal = calculatedSum;
        } else {
          displayTotal = student[totalIdx] || '0';
        }

        // Resolve Percentage
        let displayPer = '0.00';
        if (totalMaxMarks > 0 && calculatedSum > 0) {
          displayPer = ((calculatedSum / totalMaxMarks) * 100).toFixed(2);
        } else {
          const rawPer = student[perIdx];
          const numPer = parseFloat(String(rawPer));
          if (!isNaN(numPer) && numPer > 0) {
            displayPer = numPer.toFixed(2);
          }
        }

        const classRank = student[rankIdx] !== undefined && student[rankIdx] !== null ? student[rankIdx] : '-';
        const rawRes = student[resIdx] !== undefined && student[resIdx] !== null ? String(student[resIdx]) : '-';

        let result = rawRes;
        if (result === '#NAME?' || result === '-' || result === '') {
          result = parseFloat(displayPer) >= 33 ? 'PASS' : 'FAIL';
        }

        return {
          title,
          classTheoryMax: detectedClassTheoryMax,
          rows: rowsToDisplay,
          hasProject,
          hasAnyDistn,
          totalMaxMarks,
          totalMinMarks,
          grandTotal: displayTotal,
          percentage: displayPer,
          classRank,
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

  return allStudents;
}

export function getInitialCachedStudents(): { db: Record<string, any[][]>; students: ParsedStudent[] } {
  const db = cachedData as unknown as Record<string, any[][]>;
  const students = parseSheetDatabase(db);
  return { db, students };
}

export async function fetchLiveGoogleSheetData(): Promise<{
  db: Record<string, any[][]>;
  students: ParsedStudent[];
}> {
  try {
    // Attempt 1: Fetch full XLSX workbook with ALL 21 classes/sheets
    const response = await fetch(GOOGLE_SHEETS_XLSX_URL);
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const db: Record<string, any[][]> = {};
      wb.SheetNames.forEach((sn) => {
        if (sn.toLowerCase() !== 'formula') {
          db[sn] = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
        }
      });
      const students = parseSheetDatabase(db);
      if (students.length > 0) {
        return { db, students };
      }
    }
  } catch (err) {
    console.warn('XLSX multi-sheet fetch failed, falling back to cached/CSV:', err);
  }

  // Fallback to local cached data covering all 21 sheets
  return getInitialCachedStudents();
}

