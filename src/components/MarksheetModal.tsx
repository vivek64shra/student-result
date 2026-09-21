import React from 'react';
import { 
  X, 
  Printer, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  QrCode 
} from 'lucide-react';
import { SemesterResult, StudentProfile } from '../types';

interface MarksheetModalProps {
  student: StudentProfile;
  semesterResult: SemesterResult;
  onClose: () => void;
}

export const MarksheetModal: React.FC<MarksheetModalProps> = ({
  student,
  semesterResult,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Official Academic Transcript
            </span>
            <span className="text-xs text-slate-500">Semester {semesterResult.semester} Grade Card</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Transcript</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Grade Card Document */}
        <div className="border-4 border-double border-slate-800 p-6 sm:p-8 rounded-xl space-y-6 bg-white text-slate-900">
          
          {/* Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 text-white mx-auto flex items-center justify-center mb-2">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black tracking-wider uppercase text-indigo-950">
              APEX UNIVERSITY
            </h1>
            <p className="text-xs font-bold text-slate-600">ESTABLISHED UNDER UNIVERSITY ACT • NEW DELHI, INDIA</p>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 pt-1">
              STATEMENT OF GRADES & CUMULATIVE TRANSCRIPT
            </h2>
            <p className="text-xs font-semibold text-indigo-900">
              Semester {semesterResult.semester} Examination ({semesterResult.term})
            </p>
          </div>

          {/* Student Meta Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block">Candidate Name:</span>
              <strong className="text-slate-900 font-bold">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Roll Number:</span>
              <strong className="font-mono text-indigo-900 font-bold">{student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Enrollment No:</span>
              <strong className="font-mono text-slate-800 font-bold">{student.enrollmentNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Program:</span>
              <strong className="text-slate-800 font-bold">B.Tech CSE</strong>
            </div>
          </div>

          {/* Marks Table */}
          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Course Code</th>
                <th className="p-2 border-r border-slate-300">Course Title</th>
                <th className="p-2 border-r border-slate-300 text-center">Credits</th>
                <th className="p-2 border-r border-slate-300 text-center">Total (100)</th>
                <th className="p-2 border-r border-slate-300 text-center">Letter Grade</th>
                <th className="p-2 text-center">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {semesterResult.subjects.map((s) => (
                <tr key={s.code}>
                  <td className="p-2 font-mono font-bold text-indigo-900 border-r border-slate-200">{s.code}</td>
                  <td className="p-2 border-r border-slate-200 font-medium">{s.name}</td>
                  <td className="p-2 text-center border-r border-slate-200">{s.credits}</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200">{s.totalMarks}</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200 text-indigo-900">{s.grade}</td>
                  <td className="p-2 text-center font-bold">{s.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SGPA & Result Footer */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 block">Total Credits Earned:</span>
              <strong className="text-slate-900 text-sm">{semesterResult.creditsEarned} Credits</strong>
            </div>

            <div className="text-center">
              <span className="text-slate-600 block">Semester SGPA:</span>
              <strong className="text-indigo-900 text-lg font-black">{semesterResult.sgpa}</strong>
            </div>

            <div className="text-right">
              <span className="text-slate-600 block">Final Status:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px]">
                {semesterResult.resultStatus}
              </span>
            </div>
          </div>

          {/* Registrar & Controller Signature */}
          <div className="pt-6 flex items-end justify-between text-xs">
            <div>
              <div className="text-[10px] text-slate-500">Date of Declaration: 12 Jan 2026</div>
              <div className="text-[10px] text-slate-500">Security Hash: SHA256:89a19c...valid</div>
            </div>

            <div className="text-center">
              <div className="font-serif italic font-bold text-indigo-950 text-sm">Dr. S. K. Narayanan</div>
              <div className="text-[10px] text-slate-500 border-t border-slate-400 pt-0.5">Controller of Examinations</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
