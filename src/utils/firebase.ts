import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  Firestore,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';
import { SCHOOL_INFO } from './reportCardParser';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Support both named firestoreDatabaseId and default Firestore with automatic fallback
let primaryDb: Firestore;
let fallbackDb: Firestore;

try {
  primaryDb = config.firestoreDatabaseId 
    ? getFirestore(app, config.firestoreDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Initializing primary Firestore with custom ID failed, falling back to default:', e);
  primaryDb = getFirestore(app);
}

try {
  fallbackDb = getFirestore(app);
} catch (e) {
  fallbackDb = primaryDb;
}

export const db = primaryDb;
export const auth = getAuth(app);

// Error handling types for Firestore operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

export interface FirestoreAbsentRecord {
  id: string;
  date: string;
  dayName: string;
  reason: string;
  session: string;
  markedAt: string;
  className?: string;
  teacherName?: string;
}

export interface FirestoreStudentAttendance {
  scholarNo: string;
  rollNo?: string;
  studentName?: string;
  className?: string;
  session: string;
  totalAbsentDays: number;
  absentDates: FirestoreAbsentRecord[];
  lastUpdated?: string;
  dataSource?: 'attendance_records' | 'attendance' | 'local';
}

const dayNames = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

export function parseAnyDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      const d = dateVal.toDate();
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof dateVal.seconds === 'number') {
      const d = new Date(dateVal.seconds * 1000);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const str = String(dateVal).trim();
  if (!str) return null;

  // Format 1: YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // Format 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length <= 2 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  return null;
}

export function extractDateString(dateVal: any): string {
  if (!dateVal) return '';
  if (typeof dateVal === 'object') {
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toISOString().split('T')[0];
    }
    if (typeof dateVal.seconds === 'number') {
      return new Date(dateVal.seconds * 1000).toISOString().split('T')[0];
    }
  }
  return String(dateVal).trim();
}

export function getDayName(dateVal: any): string {
  const d = parseAnyDate(dateVal);
  if (d && !isNaN(d.getTime())) {
    return dayNames[d.getDay()];
  }
  return 'कार्य दिवस';
}

function matchesScholarValue(val: any, cleanScholar: string, numScholar: number): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'number') {
    return !isNaN(numScholar) && val === numScholar;
  }
  const s = String(val).trim().toLowerCase().replace(/\s+/g, '');
  if (s === cleanScholar) return true;
  if (!isNaN(numScholar)) {
    const parsed = parseInt(s.replace(/\D/g, ''), 10);
    if (!isNaN(parsed) && parsed === numScholar) return true;
  }
  return false;
}

/**
 * Normalizes any raw document data from Firestore into FirestoreStudentAttendance
 */
function normalizeAttendanceDoc(scholarNo: string, data: any): FirestoreStudentAttendance {
  if (!data) {
    return {
      scholarNo,
      session: '2026-27',
      totalAbsentDays: 0,
      absentDates: [],
    };
  }

  let absentDates: FirestoreAbsentRecord[] = [];

  // 1. If data.absentDates is an array
  if (Array.isArray(data.absentDates)) {
    absentDates = data.absentDates.map((item: any, idx: number) => {
      const itemDate = extractDateString(typeof item === 'string' ? item : (item.date || item.dateStr || ''));
      if (typeof item === 'string') {
        return {
          id: `${scholarNo}_${itemDate}_${idx}`,
          date: itemDate,
          dayName: getDayName(itemDate),
          reason: 'अनुपस्थित (Absent)',
          session: data.session || '2026-27',
          markedAt: new Date().toLocaleString('hi-IN'),
        };
      }
      return {
        id: item.id || `${scholarNo}_${itemDate}_${idx}`,
        date: itemDate,
        dayName: item.dayName || getDayName(itemDate),
        reason: item.reason || 'अनुपस्थित (Absent)',
        session: item.session || data.session || '2026-27',
        markedAt: item.markedAt || '',
        className: item.className || '',
        teacherName: item.teacherName || '',
      };
    }).filter((r: FirestoreAbsentRecord) => Boolean(r.date));
  } 
  // 2. If data.dates is an array
  else if (Array.isArray(data.dates)) {
    absentDates = data.dates.map((d: any, idx: number) => {
      const dateStr = extractDateString(d);
      return {
        id: `${scholarNo}_${dateStr}_${idx}`,
        date: dateStr,
        dayName: getDayName(dateStr),
        reason: 'अनुपस्थित (Absent)',
        session: data.session || '2026-27',
        markedAt: '',
      };
    }).filter((r: any) => Boolean(r.date));
  }

  return {
    scholarNo,
    rollNo: data.rollNo || '',
    studentName: data.studentName || '',
    className: data.className || '',
    session: data.session || '2026-27',
    totalAbsentDays: absentDates.length,
    absentDates,
    lastUpdated: data.lastUpdated || '',
    dataSource: 'attendance',
  };
}

/**
 * Automatically fetch student attendance from Firestore:
 * Synchronizes directly with the teacher attendance app database
 * (collections `attendance_records`, `daily_attendance`, `attendance`, `student_attendance`, `students`).
 */
export async function getStudentAttendanceFromFirestore(
  scholarNo: string | number
): Promise<FirestoreStudentAttendance | null> {
  const rawScholar = String(scholarNo ?? '').trim();
  const cleanScholar = rawScholar.toLowerCase();
  if (!cleanScholar) return null;

  const numScholar = parseInt(cleanScholar.replace(/\D/g, ''), 10);
  const isNumeric = !isNaN(numScholar);

  const databases = [primaryDb, fallbackDb];
  const absentRecordsMap = new Map<string, FirestoreAbsentRecord>();

  let detectedStudentName = '';
  let detectedClassName = '';
  let detectedRollNo = '';

  for (const currentDb of databases) {
    try {
      // -----------------------------------------------------------------------
      // SOURCE 1: attendance_records & daily_attendance (Teacher daily registers)
      // Teachers mark daily class attendance: docs contain date, className, teacherName, absentScholarNos
      // -----------------------------------------------------------------------
      const targetCollections = ['attendance_records', 'daily_attendance'];

      for (const colName of targetCollections) {
        try {
          const searchQueries = [
            query(collection(currentDb, colName), where('absentScholarNos', 'array-contains', cleanScholar)),
          ];

          if (rawScholar !== cleanScholar) {
            searchQueries.push(
              query(collection(currentDb, colName), where('absentScholarNos', 'array-contains', rawScholar))
            );
          }

          if (isNumeric) {
            searchQueries.push(
              query(collection(currentDb, colName), where('absentScholarNos', 'array-contains', numScholar))
            );
          }

          for (const q of searchQueries) {
            try {
              const querySnap = await getDocs(q);
              querySnap.forEach((docSnap) => {
                const data = docSnap.data();
                const dateStr = extractDateString(data.date || data.attendanceDate || data.markedDate || data.savedDate || docSnap.id);
                if (!dateStr) return;

                let reasonStr = `कक्षा ${data.className || ''} - दैनिक उपस्थिति पंजी में अनुपस्थित (शिक्षक: ${data.teacherName || 'कक्षाध्यापक'})`;
                if (Array.isArray(data.absents)) {
                  const matchedAbsentObj = data.absents.find((a: any) => {
                    return matchesScholarValue(a?.scholarNo, cleanScholar, numScholar);
                  });

                  if (matchedAbsentObj) {
                    if (matchedAbsentObj.name && !detectedStudentName) detectedStudentName = matchedAbsentObj.name;
                    if (matchedAbsentObj.rollNo && !detectedRollNo) detectedRollNo = matchedAbsentObj.rollNo;
                    if (matchedAbsentObj.reason) reasonStr = matchedAbsentObj.reason;
                  }
                }

                if (data.className && !detectedClassName) detectedClassName = data.className;

                const recordId = `${cleanScholar}_${dateStr}`;
                absentRecordsMap.set(dateStr, {
                  id: recordId,
                  date: dateStr,
                  dayName: getDayName(dateStr),
                  reason: reasonStr,
                  session: '2026-27',
                  markedAt: data.savedAtFormatted || data.updatedAt || new Date().toLocaleString('hi-IN'),
                  className: data.className || '',
                  teacherName: data.teacherName || '',
                });
              });
            } catch (queryErr) {
              // Ignore single index errors
            }
          }

          // Full collection scan if query returned 0 items
          if (absentRecordsMap.size === 0) {
            try {
              const allRecordsSnap = await getDocs(collection(currentDb, colName));
              allRecordsSnap.forEach((docSnap) => {
                const data = docSnap.data();
                const dateStr = extractDateString(data.date || data.attendanceDate || data.markedDate || data.savedDate || docSnap.id);
                if (!dateStr) return;

                const nos: any[] = Array.isArray(data.absentScholarNos) ? data.absentScholarNos : [];
                const absentsList: any[] = Array.isArray(data.absents) ? data.absents : [];
                const recordsList: any[] = Array.isArray(data.records) ? data.records : (Array.isArray(data.students) ? data.students : []);

                const isScholarInNos = nos.some((item) => matchesScholarValue(item, cleanScholar, numScholar));
                const isScholarInAbsents = absentsList.some((item) => matchesScholarValue(item?.scholarNo || item, cleanScholar, numScholar));
                const isScholarInRecords = recordsList.some((item) => {
                  if (matchesScholarValue(item?.scholarNo || item?.id, cleanScholar, numScholar)) {
                    const st = String(item?.status || '').trim().toLowerCase();
                    return st === 'a' || st === 'absent' || st === 'अनुपस्थित';
                  }
                  return false;
                });

                if (isScholarInNos || isScholarInAbsents || isScholarInRecords) {
                  let reasonStr = `कक्षा ${data.className || ''} - दैनिक उपस्थिति पंजी में अनुपस्थित (शिक्षक: ${data.teacherName || 'कक्षाध्यापक'})`;
                  
                  const matchedObj = absentsList.find((a: any) => matchesScholarValue(a?.scholarNo || a, cleanScholar, numScholar));
                  if (matchedObj) {
                    if (matchedObj.name && !detectedStudentName) detectedStudentName = matchedObj.name;
                    if (matchedObj.rollNo && !detectedRollNo) detectedRollNo = matchedObj.rollNo;
                    if (matchedObj.reason) reasonStr = matchedObj.reason;
                  }

                  if (data.className && !detectedClassName) detectedClassName = data.className;

                  absentRecordsMap.set(dateStr, {
                    id: `${cleanScholar}_${dateStr}`,
                    date: dateStr,
                    dayName: getDayName(dateStr),
                    reason: reasonStr,
                    session: '2026-27',
                    markedAt: data.savedAtFormatted || data.updatedAt || new Date().toLocaleString('hi-IN'),
                    className: data.className || '',
                    teacherName: data.teacherName || '',
                  });
                }
              });
            } catch (scanErr) {
              // Ignore scan permission error
            }
          }
        } catch (colErr) {
          // Ignore
        }
      }

      // -----------------------------------------------------------------------
      // SOURCE 2: Individual documents in /attendance, /student_attendance, /students
      // -----------------------------------------------------------------------
      const docTargets = [
        { col: 'attendance', id: cleanScholar },
        { col: 'attendance', id: rawScholar },
        { col: 'student_attendance', id: cleanScholar },
        { col: 'students', id: cleanScholar },
      ];

      if (isNumeric) {
        docTargets.push({ col: 'attendance', id: String(numScholar) });
        docTargets.push({ col: 'student_attendance', id: String(numScholar) });
        docTargets.push({ col: 'students', id: String(numScholar) });
      }

      for (const target of docTargets) {
        try {
          const docRef = doc(currentDb, target.col, target.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const directSummary = normalizeAttendanceDoc(cleanScholar, docSnap.data());
            directSummary.absentDates.forEach((rec) => {
              if (!absentRecordsMap.has(rec.date)) {
                absentRecordsMap.set(rec.date, rec);
              }
            });
            if (directSummary.studentName && !detectedStudentName) detectedStudentName = directSummary.studentName;
            if (directSummary.className && !detectedClassName) detectedClassName = directSummary.className;
            if (directSummary.rollNo && !detectedRollNo) detectedRollNo = directSummary.rollNo;
          }
        } catch (docErr) {
          // doc may not exist
        }
      }

      if (absentRecordsMap.size > 0) {
        break;
      }
    } catch (err: any) {
      console.warn('Firestore fetch attendance attempt notice:', err?.message || err);
    }
  }

  // Compile absent dates sorted chronologically
  const compiledAbsentDates = Array.from(absentRecordsMap.values()).sort((a, b) => {
    const da = parseAnyDate(a.date);
    const db = parseAnyDate(b.date);
    const timeA = da ? da.getTime() : 0;
    const timeB = db ? db.getTime() : 0;
    return timeA - timeB;
  });

  const result: FirestoreStudentAttendance = {
    scholarNo: cleanScholar,
    rollNo: detectedRollNo,
    studentName: detectedStudentName,
    className: detectedClassName,
    session: '2026-27',
    totalAbsentDays: compiledAbsentDates.length,
    absentDates: compiledAbsentDates,
    lastUpdated: new Date().toLocaleString('hi-IN'),
    dataSource: compiledAbsentDates.length > 0 ? 'attendance_records' : 'attendance',
  };

  // Cache locally for offline and instant retrieval
  try {
    localStorage.setItem(`mdhsss_firestore_att_${cleanScholar}`, JSON.stringify(result));
  } catch {}

  return result;
}

/**
 * Real-time listener for student attendance from Firestore
 * Subscribes to changes in `attendance_records` for this scholar number
 */
export function subscribeToStudentAttendance(
  scholarNo: string | number,
  onUpdate: (attendance: FirestoreStudentAttendance) => void
): () => void {
  const rawScholar = String(scholarNo ?? '').trim();
  const cleanScholar = rawScholar.toLowerCase();
  if (!cleanScholar) return () => {};

  const unsubs: Unsubscribe[] = [];

  try {
    // 1. Listen to attendance_records matching this scholar number
    const q = query(
      collection(primaryDb, 'attendance_records'),
      where('absentScholarNos', 'array-contains', cleanScholar)
    );

    const unsubRecords = onSnapshot(
      q,
      async () => {
        const fresh = await getStudentAttendanceFromFirestore(cleanScholar);
        if (fresh) onUpdate(fresh);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'attendance_records');
      }
    );
    unsubs.push(unsubRecords);
  } catch (err) {
    console.warn('Unable to bind attendance_records listener:', err);
  }

  try {
    // 2. Also listen to direct /attendance/{cleanScholar}
    const docRef = doc(primaryDb, 'attendance', cleanScholar);
    const unsubDoc = onSnapshot(
      docRef,
      async (snap) => {
        if (snap.exists()) {
          const fresh = await getStudentAttendanceFromFirestore(cleanScholar);
          if (fresh) onUpdate(fresh);
        }
      },
      (error) => {
        // Silent error for optional single doc
      }
    );
    unsubs.push(unsubDoc);
  } catch (err) {}

  return () => {
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch {}
    });
  };
}

/**
 * Add an absent record to Firestore
 */
export async function addStudentAbsentDateToFirestore(
  scholarNo: string | number,
  dateStr: string,
  reason: string = 'अनुपस्थित (Absent)',
  metadata?: { studentName?: string; className?: string; rollNo?: string }
): Promise<FirestoreStudentAttendance> {
  const cleanScholar = String(scholarNo ?? '').trim().toLowerCase();
  const current = (await getStudentAttendanceFromFirestore(cleanScholar)) || {
    scholarNo: cleanScholar,
    session: '2026-27',
    totalAbsentDays: 0,
    absentDates: [],
  };

  const newEntry: FirestoreAbsentRecord = {
    id: `${cleanScholar}_${dateStr}_${Date.now()}`,
    date: dateStr,
    dayName: getDayName(dateStr),
    reason: reason.trim() || 'अनुपस्थित (Absent)',
    session: '2026-27',
    markedAt: new Date().toLocaleString('hi-IN'),
    className: metadata?.className || current.className || '',
  };

  // Avoid duplicate date
  const filtered = current.absentDates.filter((r) => r.date !== dateStr);
  filtered.push(newEntry);
  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const updatedPayload: FirestoreStudentAttendance = {
    scholarNo: cleanScholar,
    rollNo: metadata?.rollNo || current.rollNo || '',
    studentName: metadata?.studentName || current.studentName || '',
    className: metadata?.className || current.className || '',
    session: '2026-27',
    totalAbsentDays: filtered.length,
    absentDates: filtered,
    lastUpdated: new Date().toLocaleString('hi-IN'),
    dataSource: 'attendance',
  };

  // Save to Firestore /attendance/{cleanScholar}
  try {
    await setDoc(doc(primaryDb, 'attendance', cleanScholar), updatedPayload);
  } catch (err: any) {
    try {
      await setDoc(doc(fallbackDb, 'attendance', cleanScholar), updatedPayload);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `attendance/${cleanScholar}`);
    }
  }

  // Also cache locally
  try {
    localStorage.setItem(`mdhsss_firestore_att_${cleanScholar}`, JSON.stringify(updatedPayload));
  } catch {}

  return updatedPayload;
}

/**
 * Delete an absent record from Firestore
 */
export async function removeStudentAbsentDateFromFirestore(
  scholarNo: string | number,
  recordId: string
): Promise<FirestoreStudentAttendance> {
  const cleanScholar = String(scholarNo ?? '').trim().toLowerCase();
  const current = await getStudentAttendanceFromFirestore(cleanScholar);
  if (!current) {
    return {
      scholarNo: cleanScholar,
      session: '2026-27',
      totalAbsentDays: 0,
      absentDates: [],
    };
  }

  const filtered = current.absentDates.filter((r) => r.id !== recordId && r.date !== recordId);
  const updatedPayload: FirestoreStudentAttendance = {
    ...current,
    session: '2026-27',
    totalAbsentDays: filtered.length,
    absentDates: filtered,
    lastUpdated: new Date().toLocaleString('hi-IN'),
  };

  try {
    await setDoc(doc(primaryDb, 'attendance', cleanScholar), updatedPayload);
  } catch (err) {
    try {
      await setDoc(doc(fallbackDb, 'attendance', cleanScholar), updatedPayload);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `attendance/${cleanScholar}`);
    }
  }

  try {
    localStorage.setItem(`mdhsss_firestore_att_${cleanScholar}`, JSON.stringify(updatedPayload));
  } catch {}

  return updatedPayload;
}
