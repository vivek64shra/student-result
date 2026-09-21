import React from 'react';
import { 
  X, 
  Printer, 
  GraduationCap, 
  QrCode, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';
import { StudentProfile, UpcomingExam } from '../types';

interface AdmitCardModalProps {
  student: StudentProfile;
  upcomingExams: UpcomingExam[];
  onClose: () => void;
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({
  student,
  upcomingExams,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Official Document Preview
            </span>
            <span className="text-xs text-slate-500">Hall Ticket • Autumn Semester 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
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

        {/* The Formal Printable Admit Card */}
        <div className="border-2 border-slate-800 p-6 rounded-xl space-y-6 bg-white text-slate-900">
          
          {/* University Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-black">
                <GraduationCap className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wider uppercase">APEX UNIVERSITY</h1>
                <p className="text-xs font-semibold text-slate-600">CONTROLLER OF EXAMINATIONS (COE) • NEW DELHI</p>
                <p className="text-[11px] font-bold text-indigo-900 uppercase">END-TERM SEMESTER EXAMINATION ADMIT CARD (OCTOBER 2026)</p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <div className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 inline-block">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[9px] font-mono text-slate-500">VALIDATED HALL TICKET</div>
            </div>
          </div>

          {/* Student Candidate Information */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-300">
            <div className="sm:col-span-9 grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Candidate Name:</span>
                <strong className="text-sm font-black text-slate-900">{student.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Roll Number:</span>
                <strong className="text-sm font-mono font-black text-indigo-900">{student.rollNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Enrollment No:</span>
                <strong className="font-mono font-bold text-slate-800">{student.enrollmentNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Father's Name:</span>
                <strong className="font-bold text-slate-800">{student.fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Degree / Program:</span>
                <strong className="font-bold text-slate-800">{student.program}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Semester & Section:</span>
                <strong className="font-bold text-slate-800">Semester {student.semester} ({student.section})</strong>
              </div>
            </div>

            <div className="sm:col-span-3 flex justify-center sm:justify-end">
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="w-24 h-28 object-cover rounded-lg border-2 border-slate-700 shadow-sm"
              />
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Allotted Courses & Examination Hall
            </div>
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">Code</th>
                  <th className="p-2 border-r border-slate-300">Subject Name</th>
                  <th className="p-2 border-r border-slate-300">Date</th>
                  <th className="p-2 border-r border-slate-300">Time</th>
                  <th className="p-2">Exam Center / Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {upcomingExams.map((ex) => (
                  <tr key={ex.id}>
                    <td className="p-2 font-mono font-bold text-indigo-900 border-r border-slate-200">{ex.code}</td>
                    <td className="p-2 border-r border-slate-200">{ex.subject}</td>
                    <td className="p-2 border-r border-slate-200">{ex.date}</td>
                    <td className="p-2 border-r border-slate-200">{ex.time}</td>
                    <td className="p-2 font-semibold text-slate-800">{ex.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions & Signatures */}
          <div className="space-y-3 pt-2 text-[10px] text-slate-600 leading-normal">
            <div className="font-bold text-slate-800 uppercase">Important Candidate Instructions:</div>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Candidates must carry this printed admit card along with their original University Student ID card to enter the hall.</li>
              <li>No electronic devices, smartwatches, programmable calculators, or mobile phones are permitted in the exam hall.</li>
              <li>Candidate reporting time is strictly 30 minutes prior to the commencement of the exam.</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-slate-300 flex items-center justify-between text-xs">
            <div className="text-center">
              <div className="font-serif italic text-slate-800 font-bold mb-1">Vivek Sharma</div>
              <div className="text-[10px] text-slate-500 border-t border-slate-400 pt-0.5">Candidate Signature</div>
            </div>

            <div className="text-center">
              <div className="font-serif italic font-bold text-indigo-900 mb-1">Dr. S. K. Narayanan</div>
              <div className="text-[10px] text-slate-500 border-t border-slate-400 pt-0.5">Controller of Examinations (CoE)</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
