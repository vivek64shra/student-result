import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  FileSpreadsheet, 
  Sparkles, 
  Printer, 
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { SemesterResult, UpcomingExam, StudentProfile } from '../types';

interface ExamsViewProps {
  student: StudentProfile;
  results: SemesterResult[];
  upcomingExams: UpcomingExam[];
  onOpenAdmitCard: () => void;
  onOpenMarksheet: (semesterResult: SemesterResult) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  student,
  results,
  upcomingExams,
  onOpenAdmitCard,
  onOpenMarksheet,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(results[0]?.semester || 5);

  const activeResult = results.find((r) => r.semester === selectedSemester) || results[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-purple-600" />
            <span>Examinations, Grades & Transcript</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Controller of Examinations (CoE) official grade sheets, credit registers, and upcoming exam hall tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAdmitCard}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Admit Card</span>
          </button>
        </div>
      </div>

      {/* CGPA & Academic Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-purple-800/40">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Overall CGPA</div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1 justify-center sm:justify-start">
              <span>{student.cgpa}</span>
              <span className="text-xs font-normal text-purple-300">/ 10.0</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">First Class with Distinction</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Credits Earned</div>
            <div className="text-3xl font-black text-white flex items-baseline gap-1 justify-center sm:justify-start">
              <span>{student.totalCredits}</span>
              <span className="text-xs font-normal text-purple-300">/ 160</span>
            </div>
            <div className="text-[11px] text-purple-200">86.2% of degree complete</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Active Backlogs</div>
            <div className="text-3xl font-black text-emerald-400">0</div>
            <div className="text-[11px] text-purple-200">Clean Academic Record</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Latest Sem SGPA</div>
            <div className="text-3xl font-black text-amber-300">{student.sgpaLastSem}</div>
            <div className="text-[11px] text-purple-200">Semester 5 Examination</div>
          </div>
        </div>
      </div>

      {/* Upcoming Exam Schedule Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Upcoming End-Semester Examinations (October 2026)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Please bring your Physical University ID Card & Printed Admit Card</p>
          </div>

          <button
            type="button"
            onClick={onOpenAdmitCard}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            Download Hall Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {upcomingExams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {exam.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Max: {exam.totalMarks} Marks
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {exam.subject}
              </h4>

              <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span><strong>Date:</strong> {exam.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>Timing:</strong> {exam.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span><strong>Venue:</strong> {exam.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gradebook / Semester Marksheet Viewer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Official Semester Grade Sheets</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a semester to review internal and external marks breakdown</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Semester selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {results.map((r) => (
                <button
                  key={r.semester}
                  type="button"
                  onClick={() => setSelectedSemester(r.semester)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedSemester === r.semester
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sem {r.semester}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenMarksheet(activeResult)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Official Transcript</span>
            </button>
          </div>
        </div>

        {/* Active Semester Meta */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900">
              Semester {activeResult.semester} ({activeResult.term})
            </div>
            <div className="text-[11px] text-slate-500">
              Credits Registered: {activeResult.creditsRegistered} • Credits Earned: {activeResult.creditsEarned}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Semester SGPA</div>
              <div className="text-xl font-extrabold text-indigo-600">{activeResult.sgpa}</div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {activeResult.resultStatus}
            </span>
          </div>
        </div>

        {/* Table of marks */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-3 px-3">Subject Code</th>
                <th className="py-3 px-3">Subject Title</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center">Internal (50)</th>
                <th className="py-3 px-3 text-center">External (50)</th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeResult.subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{sub.code}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{sub.name}</td>
                  <td className="py-3 px-3 text-center text-slate-600 font-semibold">{sub.credits}</td>
                  <td className="py-3 px-3 text-center text-slate-700">{sub.internalMarks}</td>
                  <td className="py-3 px-3 text-center text-slate-700">{sub.externalMarks}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{sub.totalMarks}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800">{sub.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
