import React, { useState } from 'react';
import { 
  Contact, 
  RotateCw, 
  Printer, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  GraduationCap,
  Phone,
  Home,
  Heart,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { StudentProfile } from '../types';

interface IdCardViewProps {
  student: StudentProfile;
}

export const IdCardView: React.FC<IdCardViewProps> = ({ student }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Contact className="w-6 h-6 text-indigo-600" />
            <span>Digital Student Smart ID Card</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official verifiable smart card with NFC/RFID & QR barcode for campus entry, library, and examination hall verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>{isFlipped ? 'View Front Side' : 'Flip to Back Side'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Card Showcase Arena */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-10 bg-slate-100 rounded-3xl border border-slate-200">
        
        {/* The Smart ID Card container */}
        <div className="w-full max-w-md perspective-1000 select-none">
          
          {!isFlipped ? (
            /* FRONT OF ID CARD */
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white border-2 border-indigo-500/40 relative">
              
              {/* Top University Brand Bar */}
              <div className="p-4 bg-gradient-to-r from-indigo-800 via-indigo-700 to-indigo-800 flex items-center justify-between border-b border-indigo-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-indigo-900 flex items-center justify-center font-black shadow">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold tracking-tight uppercase">APEX UNIVERSITY</h2>
                    <p className="text-[9px] text-indigo-200 tracking-wider">STUDENT IDENTITY CARD • NAAC A++</p>
                  </div>
                </div>

                {/* Smart Chip Graphic */}
                <div className="w-8 h-6 rounded-md bg-amber-300/80 border border-amber-400 flex items-center justify-center shadow-inner">
                  <div className="w-5 h-4 border border-amber-600/50 rounded-xs grid grid-cols-2 gap-0.5 opacity-80" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                <div className="flex gap-4 items-center">
                  
                  {/* Student Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-24 h-28 object-cover rounded-xl border-2 border-white shadow-md"
                    />
                    {/* Security hologram stamp */}
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 via-pink-400 to-sky-400 border border-white/60 shadow flex items-center justify-center text-[8px] font-black text-slate-900">
                      SEC
                    </div>
                  </div>

                  {/* Student Credentials */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {student.name}
                    </h3>
                    <div className="text-xs text-indigo-300 font-semibold">
                      {student.program}
                    </div>

                    <div className="pt-1.5 space-y-0.5 text-[11px] text-slate-300">
                      <div>
                        Roll No: <span className="font-mono font-bold text-amber-300">{student.rollNo}</span>
                      </div>
                      <div>
                        Enrollment: <span className="font-mono font-bold text-slate-200">{student.enrollmentNo}</span>
                      </div>
                      <div>
                        Department: <span className="font-medium text-slate-200">{student.department}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta details strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-center text-[10px]">
                  <div>
                    <span className="text-slate-400 block uppercase">Validity</span>
                    <span className="font-bold text-white">{student.batch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase">Blood Group</span>
                    <span className="font-bold text-red-400">{student.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase">Semester</span>
                    <span className="font-bold text-emerald-400">{student.semester}th Sem</span>
                  </div>
                </div>

                {/* Bottom Barcode & Verification */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  {/* Simulated barcode */}
                  <div className="space-y-0.5">
                    <div className="h-6 flex items-center gap-0.5">
                      {[1, 3, 2, 4, 1, 2, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1].map((w, i) => (
                        <span
                          key={i}
                          className="bg-white inline-block h-full"
                          style={{ width: `${w * 1.5}px` }}
                        />
                      ))}
                    </div>
                    <div className="font-mono text-[9px] text-slate-400 tracking-widest text-center">
                      *22BCSE1212*
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[9px] text-indigo-300 font-semibold">Authorized Registrar</div>
                    <div className="font-serif italic text-xs text-slate-300 font-bold">A. K. Singhal</div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* BACK OF ID CARD */
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-slate-200 border-2 border-slate-700 relative p-5 space-y-4 text-xs">
              
              <div className="text-center pb-2 border-b border-slate-800">
                <div className="font-bold text-white uppercase tracking-wider text-xs">Apex University Campus Guidelines</div>
                <div className="text-[10px] text-slate-400">Knowledge Park III, Institutional Area, Greater Noida, UP - 201306</div>
              </div>

              {/* Information Grid */}
              <div className="space-y-2 text-[11px] bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/70">
                <div>
                  <strong className="text-slate-400">Father's Name:</strong> {student.fatherName}
                </div>
                <div>
                  <strong className="text-slate-400">Hostel Address:</strong> {student.hostelRoom}
                </div>
                <div>
                  <strong className="text-slate-400">Residential Address:</strong> {student.address}
                </div>
                <div>
                  <strong className="text-slate-400">Emergency Phone:</strong> {student.phone}
                </div>
                <div>
                  <strong className="text-slate-400">Library Issue Code:</strong> <span className="font-mono text-amber-300">{student.libraryCardNo}</span>
                </div>
              </div>

              {/* Guidelines Bullet points */}
              <div className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                <p>1. This card is non-transferable and must be displayed on campus at all times.</p>
                <p>2. Loss of this card must be immediately reported to the Proctor's Office and ICT Cell.</p>
                <p>3. If found, please return to the Registrar's Office, Main Administration Block.</p>
              </div>

              {/* QR Code and verification */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white rounded-lg">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <div>Scan to Verify</div>
                    <div className="font-mono text-emerald-400 font-bold">portal.apex.edu/id/1212</div>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <span>Helpline: +91 (11) 2389-0000</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Helper text */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center gap-2">
          <RotateCw className="w-3.5 h-3.5" />
          <span>Click "Flip to Back Side" above to view emergency contacts and address.</span>
        </div>

      </div>

    </div>
  );
};
