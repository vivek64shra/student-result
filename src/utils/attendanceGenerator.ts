import { ParsedStudent, SCHOOL_INFO } from './reportCardParser';
import { 
  getStudentAttendanceFromFirestore, 
  addStudentAbsentDateToFirestore, 
  removeStudentAbsentDateFromFirestore,
  FirestoreAbsentRecord,
  subscribeToStudentAttendance 
} from './firebase';

export { subscribeToStudentAttendance };

export interface AbsentDateRecord {
  id: string;
  date: string; // e.g. "2026-09-15" or "15-Sep-2026"
  dayName: string; // e.g. "सोमवार"
  reason?: string; // e.g. "अस्वस्थ / मेडिकल", "पारिवारिक कार्य", "बिना सूचना"
  session: string; // "2026-27"
  markedAt: string;
}

export interface StudentAbsenteeSummary {
  scholarNo: string;
  rollNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  academicSession: string;
  absentDates: AbsentDateRecord[];
  totalAbsentDays: number;
  hasAbsenceRecorded: boolean;
  schoolWorkingDates?: string[];
  totalWorkingDays?: number;
  totalPresentDays?: number;
  attendancePercentage?: string;
  isLoading?: boolean;
}

const STORAGE_KEY = 'mdhsss_student_absent_records_v1';
export const CURRENT_SESSION = '2026-27';

// Read persistent absent records for a specific scholar number from local cache
export function getStudentAbsentDates(scholarNo: string | number): AbsentDateRecord[] {
  if (typeof window === 'undefined') return [];
  const cleanScholar = String(scholarNo ?? '').trim().toLowerCase();
  if (!cleanScholar) return [];

  // 1. First check Firestore local cache
  try {
    const firestoreCache = localStorage.getItem(`mdhsss_firestore_att_${cleanScholar}`);
    if (firestoreCache) {
      const parsed = JSON.parse(firestoreCache);
      if (Array.isArray(parsed.absentDates)) {
        return parsed.absentDates;
      }
    }
  } catch {}

  // 2. Check general storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const allRecords: Record<string, AbsentDateRecord[]> = JSON.parse(raw);
    return allRecords[cleanScholar] || [];
  } catch (err) {
    console.warn('Failed to parse absent records:', err);
    return [];
  }
}

// Add an absent date entry for a scholar number (Syncs to Cloud Firestore + Local Cache)
export async function addStudentAbsentDate(
  scholarNo: string | number,
  dateStr: string,
  reason: string = 'अनुपस्थित (Absent)',
  metadata?: { studentName?: string; className?: string; rollNo?: string }
): Promise<AbsentDateRecord[]> {
  const cleanScholar = String(scholarNo ?? '').trim().toLowerCase();
  if (!cleanScholar || !dateStr) return [];

  // 1. Sync to Firebase Cloud Firestore
  try {
    const cloudRes = await addStudentAbsentDateToFirestore(cleanScholar, dateStr, reason, metadata);
    if (cloudRes && Array.isArray(cloudRes.absentDates)) {
      return cloudRes.absentDates;
    }
  } catch (err) {
    console.warn('Firestore add absent error, falling back to local storage:', err);
  }

  // 2. Fallback to local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allRecords: Record<string, AbsentDateRecord[]> = raw ? JSON.parse(raw) : {};
    const studentList = allRecords[cleanScholar] || [];

    const existingIndex = studentList.findIndex((r) => r.date === dateStr);
    const parsedDate = new Date(dateStr);
    const dayNames = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const dayName = !isNaN(parsedDate.getTime()) ? dayNames[parsedDate.getDay()] : 'कार्य दिवस';

    const newRecord: AbsentDateRecord = {
      id: `${cleanScholar}_${dateStr}_${Date.now()}`,
      date: dateStr,
      dayName,
      reason: reason.trim() || 'अनुपस्थित (Absent)',
      session: CURRENT_SESSION,
      markedAt: new Date().toLocaleString('hi-IN'),
    };

    if (existingIndex >= 0) {
      studentList[existingIndex] = newRecord;
    } else {
      studentList.push(newRecord);
    }

    studentList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    allRecords[cleanScholar] = studentList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    return studentList;
  } catch (err) {
    console.warn('Failed to add absent date locally:', err);
    return [];
  }
}

// Remove an absent record (Syncs to Cloud Firestore + Local Cache)
export async function removeStudentAbsentDate(scholarNo: string | number, recordId: string): Promise<AbsentDateRecord[]> {
  const cleanScholar = String(scholarNo ?? '').trim().toLowerCase();
  if (!cleanScholar) return [];

  // 1. Sync to Firebase Cloud Firestore
  try {
    const cloudRes = await removeStudentAbsentDateFromFirestore(cleanScholar, recordId);
    if (cloudRes && Array.isArray(cloudRes.absentDates)) {
      return cloudRes.absentDates;
    }
  } catch (err) {
    console.warn('Firestore remove error, removing locally:', err);
  }

  // 2. Fallback local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const allRecords: Record<string, AbsentDateRecord[]> = JSON.parse(raw);
    const studentList = (allRecords[cleanScholar] || []).filter((r) => r.id !== recordId && r.date !== recordId);
    allRecords[cleanScholar] = studentList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    return studentList;
  } catch (err) {
    console.warn('Failed to remove absent date locally:', err);
    return [];
  }
}

export function getStudentAbsenteeSummary(student: ParsedStudent): StudentAbsenteeSummary {
  const cleanScholar = String(student.scholarNo ?? '').trim().toLowerCase();
  let cachedFirestore: any = null;
  try {
    const raw = localStorage.getItem(`firestore_att_${cleanScholar}`);
    if (raw) cachedFirestore = JSON.parse(raw);
  } catch (e) {}

  const absentDates = (cachedFirestore?.absentDates && cachedFirestore.absentDates.length > 0)
    ? cachedFirestore.absentDates
    : getStudentAbsentDates(student.scholarNo);
  const totalAbsentDays = absentDates.length;

  return {
    scholarNo: student.scholarNo,
    rollNo: student.rollNo,
    studentName: student.name,
    fatherName: student.fatherName,
    className: student.className,
    academicSession: CURRENT_SESSION,
    absentDates,
    totalAbsentDays,
    hasAbsenceRecorded: totalAbsentDays > 0,
    schoolWorkingDates: cachedFirestore?.schoolWorkingDates || [],
    totalWorkingDays: cachedFirestore?.totalWorkingDays || 0,
    totalPresentDays: cachedFirestore?.totalPresentDays || 0,
    attendancePercentage: cachedFirestore?.attendancePercentage || '100.0',
    isLoading: false,
  };
}

// Fetch live attendance data asynchronously from Firebase Cloud Firestore using scholar number & class
export async function fetchLiveStudentAttendance(student: ParsedStudent, forceRefresh: boolean = false): Promise<StudentAbsenteeSummary> {
  const cleanScholar = String(student.scholarNo ?? '').trim().toLowerCase();
  
  try {
    const cloudData = await getStudentAttendanceFromFirestore(cleanScholar, student.className, forceRefresh);
    if (cloudData) {
      const totalAbsentDays = cloudData.absentDates.length;
      return {
        scholarNo: student.scholarNo,
        rollNo: student.rollNo,
        studentName: student.name,
        fatherName: student.fatherName,
        className: student.className,
        academicSession: CURRENT_SESSION,
        absentDates: cloudData.absentDates,
        totalAbsentDays,
        hasAbsenceRecorded: totalAbsentDays > 0,
        schoolWorkingDates: cloudData.schoolWorkingDates || [],
        totalWorkingDays: cloudData.totalWorkingDays || 0,
        totalPresentDays: cloudData.totalPresentDays || 0,
        attendancePercentage: cloudData.attendancePercentage || '100.0',
        isLoading: false,
      };
    }
  } catch (err) {
    console.warn('Live fetch student attendance error:', err);
  }

  return getStudentAbsenteeSummary(student);
}
