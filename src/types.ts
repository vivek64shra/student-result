export interface StudentProfile {
  id: string;
  rollNo: string;
  enrollmentNo: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  department: string;
  program: string;
  semester: number;
  section: string;
  batch: string;
  avatarUrl: string;
  cgpa: number;
  sgpaLastSem: number;
  totalCredits: number;
  attendancePercentage: number;
  academicAdvisor: string;
  bloodGroup: string;
  hostelRoom: string;
  libraryCardNo: string;
  fatherName: string;
  address: string;
}

export interface AttendanceSubject {
  id: string;
  code: string;
  name: string;
  faculty: string;
  attended: number;
  total: number;
  credits: number;
  type: 'Theory' | 'Practical' | 'Tutorial';
  recentDates: { date: string; status: 'Present' | 'Absent' }[];
}

export interface TimetableSlot {
  id: string;
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Break';
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  slots: TimetableSlot[];
}

export interface Assignment {
  id: string;
  subject: string;
  subjectCode: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  totalMarks: number;
  status: 'pending' | 'submitted' | 'graded';
  obtainedMarks?: number;
  feedback?: string;
  submittedFile?: string;
  submittedAt?: string;
}

export interface CourseUnit {
  unitNumber: number;
  title: string;
  topics: string[];
  notesCount: number;
  isCompleted: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: string;
  credits: number;
  progressPercent: number;
  description: string;
  units: CourseUnit[];
  studyResources: { title: string; type: 'PDF' | 'Slides' | 'Video' | 'Code'; size: string; link: string }[];
}

export interface ExamSubjectGrade {
  code: string;
  name: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
}

export interface SemesterResult {
  semester: number;
  term: string;
  sgpa: number;
  creditsRegistered: number;
  creditsEarned: number;
  resultStatus: 'PASS' | 'DISTINCTION';
  subjects: ExamSubjectGrade[];
}

export interface UpcomingExam {
  id: string;
  subject: string;
  code: string;
  date: string;
  time: string;
  room: string;
  totalMarks: number;
}

export interface FeeItem {
  id: string;
  title: string;
  semester: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  receiptNo?: string;
  breakdown: { item: string; amount: number }[];
}

export interface LeaveRequest {
  id: string;
  type: 'Medical' | 'Academic' | 'Personal' | 'Hostel Out-pass';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  appliedOn: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  approvedBy?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  category: 'Academic' | 'Examination' | 'Placement' | 'Events' | 'Fee';
  date: string;
  isImportant: boolean;
  department: string;
  content: string;
  downloadFile?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'attendance' 
  | 'timetable' 
  | 'courses' 
  | 'assignments' 
  | 'exams' 
  | 'fees' 
  | 'idcard' 
  | 'leave';
