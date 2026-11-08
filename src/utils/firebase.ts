import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDoc, 
  getDocFromServer,
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

// Initialize Firestore targeting the provisioned database ID
// In browser environments, enabling force long-polling prevents proxy/iframe WebSocket hangs
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: typeof window !== 'undefined',
  }, config.firestoreDatabaseId);
} catch {
  try {
    dbInstance = config.firestoreDatabaseId 
      ? getFirestore(app, config.firestoreDatabaseId)
      : getFirestore(app);
  } catch {
    dbInstance = getFirestore(app);
  }
}

export const db = dbInstance;
export const auth = getAuth(app);

/**
 * Utility to prevent Firestore network calls from hanging indefinitely
 */
async function withTimeout<T>(promise: Promise<T>, ms: number = 4000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Firestore request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

// Connection test as required by Firebase integration guidelines
if (typeof window !== 'undefined') {
  (async () => {
    try {
      await withTimeout(getDocFromServer(doc(db, 'test', 'connection')), 2500);
    } catch {
      // Quietly allow offline mode without disrupting UI
    }
  })();
}

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

export interface AttendanceDayStatus {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string; // 'सोमवार', 'रविवार' etc.
  status: 'present' | 'absent' | 'holiday' | 'sunday';
  statusHindi: string; // 'उपस्थित', 'अनुपस्थित', 'विद्यालय अवकाश', 'रविवार'
  reason?: string;
  isSchoolWorkingDay: boolean;
}

export interface FirestoreStudentAttendance {
  scholarNo: string;
  rollNo?: string;
  studentName?: string;
  className?: string;
  session: string;
  totalAbsentDays: number;
  absentDates: FirestoreAbsentRecord[];
  // Present & School Calendar Analytics
  schoolWorkingDates?: string[];
  totalWorkingDays?: number;
  totalPresentDays?: number;
  attendancePercentage?: string;
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
 * Normalizes class name for accurate matching between marksheet and attendance registers
 * e.g. "12TH (COM)", "12th commerce", "12TH COM" -> "12THCOM"
 */
export function normalizeClassName(cls?: string): string {
  if (!cls) return '';
  return String(cls)
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
    .replace(/COMMERCE/g, 'COM')
    .replace(/MATHEMATICS/g, 'MATH')
    .replace(/BIOLOGY/g, 'BIO')
    .replace(/SCIENCE/g, 'SCI');
}

export function isMatchingClass(docClass?: string, targetClass?: string): boolean {
  const normDoc = normalizeClassName(docClass);
  const normTarget = normalizeClassName(targetClass);
  if (!normDoc || !normTarget) return false;
  return normDoc === normTarget || normDoc.includes(normTarget) || normTarget.includes(normDoc);
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// In-memory cache for attendance records collection to ensure instantaneous switching between siblings
let cachedAttendanceDocs: any[] | null = null;
let lastAttendanceFetchTimestamp = 0;

export function invalidateAttendanceCache(): void {
  cachedAttendanceDocs = null;
  lastAttendanceFetchTimestamp = 0;
}

/**
 * Automatically fetch student attendance from Firestore:
 * Synchronizes directly with the teacher attendance app database
 * Collection `attendance_records`
 */
export async function getStudentAttendanceFromFirestore(
  scholarNo: string | number,
  studentClass?: string,
  forceRefresh: boolean = false
): Promise<FirestoreStudentAttendance | null> {
  const rawScholar = String(scholarNo ?? '').trim();
  const cleanScholar = rawScholar.toLowerCase();
  if (!cleanScholar) return null;

  const numScholar = parseInt(cleanScholar.replace(/\D/g, ''), 10);
  const isNumeric = !isNaN(numScholar);

  if (forceRefresh) {
    invalidateAttendanceCache();
    try {
      localStorage.removeItem(`mdhsss_firestore_att_${cleanScholar}`);
    } catch {}
  }

  // Instant Cache Check: If cached locally within current session, return immediately
  if (!forceRefresh) {
    try {
      const cachedRaw = localStorage.getItem(`mdhsss_firestore_att_${cleanScholar}`);
      if (cachedRaw) {
        const cachedParsed: FirestoreStudentAttendance = JSON.parse(cachedRaw);
        if (cachedParsed && Array.isArray(cachedParsed.absentDates)) {
          // Trigger background refresh without blocking UI
          setTimeout(() => {
            fetchFreshAttendanceFromFirestore(cleanScholar, rawScholar, numScholar, isNumeric, studentClass).catch(() => {});
          }, 150);
          return cachedParsed;
        }
      }
    } catch {}
  }

  return await fetchFreshAttendanceFromFirestore(cleanScholar, rawScholar, numScholar, isNumeric, studentClass);
}

async function fetchFreshAttendanceFromFirestore(
  cleanScholar: string,
  rawScholar: string,
  numScholar: number,
  isNumeric: boolean,
  studentClass?: string
): Promise<FirestoreStudentAttendance | null> {
  const absentRecordsMap = new Map<string, FirestoreAbsentRecord>();
  const workingDatesSet = new Set<string>();
  const todayKey = getTodayDateKey();

  let detectedStudentName = '';
  let detectedClassName = studentClass || '';
  let detectedRollNo = '';

  try {
    const now = Date.now();
    let recordsDataList = cachedAttendanceDocs;

    // Fetch from Firestore attendance_records if cache is empty or older than 3 minutes
    if (!recordsDataList || now - lastAttendanceFetchTimestamp > 180000) {
      const colRef = collection(db, 'attendance_records');
      const allRecordsSnap = await withTimeout(getDocs(colRef), 4500);
      const list: any[] = [];
      allRecordsSnap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      cachedAttendanceDocs = list;
      lastAttendanceFetchTimestamp = now;
      recordsDataList = list;
    }

    recordsDataList.forEach((data: any) => {
      const dateStr = extractDateString(data.date || data.attendanceDate || data.markedDate || data.savedDate || data.id);
      if (!dateStr || dateStr < '2026-10-20') return;

      const isSameClass = isMatchingClass(data.className, detectedClassName || studentClass);

      const nos: any[] = Array.isArray(data.absentScholarNos) ? data.absentScholarNos : [];
      const absentsList: any[] = Array.isArray(data.absents) ? data.absents : [];
      const presentsList: any[] = Array.isArray(data.presentScholarNos) ? data.presentScholarNos : [];

      const isScholarInNos = nos.some((item) => matchesScholarValue(item, cleanScholar, numScholar));
      const isScholarInAbsents = absentsList.some((item) => matchesScholarValue(item?.scholarNo || item, cleanScholar, numScholar));
      const isScholarInPresents = presentsList.some((item) => matchesScholarValue(item, cleanScholar, numScholar));

      // 1. If scholar is marked ABSENT in this class record
      if (isScholarInNos || isScholarInAbsents) {
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

        // Only past/today dates count towards completed working days
        if (dateStr <= todayKey) {
          workingDatesSet.add(dateStr);
        }
      } 
      // 2. If scholar is explicitly recorded as PRESENT
      else if (isScholarInPresents) {
        if (data.className && !detectedClassName) detectedClassName = data.className;
        if (dateStr <= todayKey) {
          workingDatesSet.add(dateStr);
        }
      } 
      // 3. If class attendance was taken on this date and student is not in absent list
      else if (isSameClass) {
        if (dateStr <= todayKey) {
          workingDatesSet.add(dateStr);
        }
      }
    });
  } catch (err: any) {
    console.warn('Firestore attendance_records fetch notice (using cache/offline mode):', err?.message || err);
  }

  // Compile absent dates sorted chronologically
  const compiledAbsentDates = Array.from(absentRecordsMap.values()).sort((a, b) => {
    const da = parseAnyDate(a.date);
    const db = parseAnyDate(b.date);
    return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
  });

  const sortedWorkingDates = Array.from(workingDatesSet).sort((a, b) => {
    const da = parseAnyDate(a);
    const db = parseAnyDate(b);
    return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
  });

  const totalWorkingDays = sortedWorkingDates.length;
  // Absent days up to today
  const totalAbsentDays = compiledAbsentDates.filter(d => d.date <= todayKey).length;
  const totalPresentDays = Math.max(0, totalWorkingDays - totalAbsentDays);
  const attendancePercentage = totalWorkingDays > 0 
    ? ((totalPresentDays / totalWorkingDays) * 100).toFixed(1) 
    : '100.0';

  const result: FirestoreStudentAttendance = {
    scholarNo: cleanScholar,
    rollNo: detectedRollNo,
    studentName: detectedStudentName,
    className: detectedClassName,
    session: '2026-27',
    totalAbsentDays,
    absentDates: compiledAbsentDates,
    schoolWorkingDates: sortedWorkingDates,
    totalWorkingDays,
    totalPresentDays,
    attendancePercentage,
    lastUpdated: new Date().toLocaleString('hi-IN'),
    dataSource: 'attendance_records',
  };

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
      collection(db, 'attendance_records'),
      where('absentScholarNos', 'array-contains', cleanScholar)
    );

    const unsubRecords = onSnapshot(
      q,
      async () => {
        const fresh = await getStudentAttendanceFromFirestore(cleanScholar);
        if (fresh) onUpdate(fresh);
      },
      (error) => {
        // If client is offline or backend unreachable, Firestore operates in offline mode
        if (error?.message?.includes('offline') || error?.code === 'unavailable' || error?.message?.includes('backend')) {
          return;
        }
        handleFirestoreError(error, OperationType.GET, 'attendance_records');
      }
    );
    unsubs.push(unsubRecords);
  } catch (err) {
    console.warn('Notice: Unable to bind attendance_records listener (offline mode):', err);
  }

  try {
    // 2. Also listen to direct /attendance/{cleanScholar}
    const docRef = doc(db, 'attendance', cleanScholar);
    const unsubDoc = onSnapshot(
      docRef,
      async (snap) => {
        if (snap.exists()) {
          const fresh = await getStudentAttendanceFromFirestore(cleanScholar);
          if (fresh) onUpdate(fresh);
        }
      },
      () => {
        // Silent error for optional single doc / offline
      }
    );
    unsubs.push(unsubDoc);
  } catch {}

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
    await withTimeout(setDoc(doc(db, 'attendance', cleanScholar), updatedPayload), 4000);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${cleanScholar}`);
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
    await withTimeout(setDoc(doc(db, 'attendance', cleanScholar), updatedPayload), 4000);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `attendance/${cleanScholar}`);
  }

  try {
    localStorage.setItem(`mdhsss_firestore_att_${cleanScholar}`, JSON.stringify(updatedPayload));
  } catch {}

  return updatedPayload;
}
