/**
 * Student Session Persistence Manager
 * Ensures students remain logged in across browser closes, device reboots, and page reloads
 * for 30 days without having to re-enter scholar number and roll number every time.
 */

import { ParsedStudent } from './reportCardParser';

export const STUDENT_SESSION_STORAGE_KEY = 'mdes_student_session_v2';
export const SESSION_VALIDITY_DAYS = 30; // 30 days auto-login session

export interface StoredStudentSession {
  scholarNo: string;
  rollNo: string;
  name: string;
  fatherName: string;
  className: string;
  savedAt: number;
  expiresAt: number;
  autoLogin: boolean;
}

/**
 * Saves authenticated student credentials and profile in localStorage.
 */
export function saveStudentSession(student: ParsedStudent, autoLogin: boolean = true): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    const now = Date.now();
    const expiresAt = now + SESSION_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

    const session: StoredStudentSession = {
      scholarNo: String(student.scholarNo || '').trim(),
      rollNo: String(student.rollNo || '').trim(),
      name: student.name || '',
      fatherName: student.fatherName || '',
      className: student.className || '',
      savedAt: now,
      expiresAt,
      autoLogin,
    };

    localStorage.setItem(STUDENT_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save student session:', err);
  }
}

/**
 * Retrieves valid stored student session if not expired.
 * Returns null if expired or missing.
 */
export function getStoredStudentSession(): StoredStudentSession | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;

    const raw = localStorage.getItem(STUDENT_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session: StoredStudentSession = JSON.parse(raw);
    if (!session || !session.scholarNo || !session.rollNo) {
      localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
      return null;
    }

    // Check expiration
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clears stored session on user logout.
 */
export function clearStudentSession(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.removeItem(STUDENT_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
}
