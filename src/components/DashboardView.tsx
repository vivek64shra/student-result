import React from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Calendar, 
  FileText, 
  AlertCircle, 
  ArrowUpRight, 
  CreditCard, 
  QrCode, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  User, 
  Award,
  ChevronRight,
  Download,
  AlertTriangle
} from 'lucide-react';
import { 
  StudentProfile, 
  AttendanceSubject, 
  Assignment, 
  NoticeItem, 
  ActiveTab,
  DaySchedule
} from '../types';

interface DashboardViewProps {
  student: StudentProfile;
  attendance: AttendanceSubject[];
  assignments: Assignment[];
  notices: NoticeItem[];
  timetable: DaySchedule[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNotice: (notice: NoticeItem) => void;
  onOpenAdmitCard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  student,
  attendance,
  assignments,
  notices,
  timetable,
  setActiveTab,
  onOpenNotice,
  onOpenAdmitCard,
}) => {
  // Pending assignments count
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  // Find today's schedule (default to Monday or Wednesday for preview rich schedule)
  const todaySchedule = timetable.find((t) => t.day === 'Monday')?.slots || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Academic Session 2025–26 • 6th Semester</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Enrollment: <span className="font-mono text-indigo-300 font-semibold">{student.enrollmentNo}</span> • Roll No: <span className="font-mono text-amber-300 font-semibold">{student.rollNo}</span>
              <br />
              Department of {student.department}
            </p>
          </div>

          {/* Quick Action Buttons in Banner */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('idcard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <QrCode className="w-4 h-4 text-indigo-300" />
              <span>Digital ID Card</span>
            </button>
            <button
              type="button"
              onClick={onOpenAdmitCard}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Exam Admit Card</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle backdrop design */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Attendance Card */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{student.attendancePercentage}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Safe (&gt;75%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>You can miss up to 4 more classes safely</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-auto" />
          </p>
        </div>

        {/* CGPA Card */}
        <div 
          onClick={() => setActiveTab('exams')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{student.cgpa}</span>
            <span className="text-xs font-medium text-slate-500">/ 10.0</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              Distinction
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Last Sem SGPA: <strong>{student.sgpaLastSem}</strong></span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-auto" />
          </p>
        </div>

        {/* Active Assignments */}
        <div 
          onClick={() => setActiveTab('assignments')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Assignments</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{pendingAssignments.length}</span>
            <span className="text-xs font-medium text-slate-500">Due this week</span>
          </div>
          <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Next due: 22 Sep (AI Lab)</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-auto" />
          </p>
        </div>

        {/* Fee Clearance Card */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Account Status</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">No Dues</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Paid
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Sem 6 tuition & hostel settled</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-auto" />
          </p>
        </div>

      </div>

      {/* Main Split Grid: Today's Schedule & University Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Classes & Timetable (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Today's Class Schedule (Monday)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Classes scheduled according to standard academic slotting</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Full Week</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slots list */}
          <div className="space-y-3 pt-1">
            {todaySchedule.slice(0, 5).map((slot, index) => {
              const isOngoing = index === 0; // Simulate first class ongoing for realism
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOngoing
                      ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-300/60'
                      : slot.type === 'Break'
                      ? 'bg-slate-50 border-dashed border-slate-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{slot.subject}</span>
                      {slot.code !== 'BREAK' && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {slot.code}
                        </span>
                      )}
                      {isOngoing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {slot.time}
                      </span>
                      {slot.room !== '-' && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {slot.room}
                        </span>
                      )}
                      {slot.faculty !== '-' && (
                        <span className="hidden sm:inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {slot.faculty}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                      slot.type === 'Lecture' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      slot.type === 'Lab' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      slot.type === 'Tutorial' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {slot.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Official Notice Board & Announcements (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Notice Board & Circulars</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Official
              </span>
            </div>

            <div className="space-y-3.5 pt-4">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onOpenNotice(notice)}
                  className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      notice.category === 'Examination' ? 'bg-amber-100 text-amber-800' :
                      notice.category === 'Placement' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{notice.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-950 font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Need Exam Datesheet PDF?</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenNotice(notices[0])}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                View Notice
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Action Dock */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Quick Academic Services
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Attendance</div>
            <div className="text-[11px] text-slate-500">Bunk Calculator</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Timetable</div>
            <div className="text-[11px] text-slate-500">Room LT-301</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <FileText className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Assignments</div>
            <div className="text-[11px] text-slate-500">Submit Project</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <Award className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Grade Cards</div>
            <div className="text-[11px] text-slate-500">Official Marksheet</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fees')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <CreditCard className="w-5 h-5 text-sky-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Fee Receipts</div>
            <div className="text-[11px] text-slate-500">Download Slips</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leave')}
            className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 text-left transition-all group cursor-pointer"
          >
            <User className="w-5 h-5 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">Apply Leave</div>
            <div className="text-[11px] text-slate-500">HOD Out-pass</div>
          </button>

        </div>
      </div>
    </div>
  );
};
