import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calculator, 
  Info, 
  Calendar, 
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AttendanceSubject, StudentProfile } from '../types';

interface AttendanceViewProps {
  student: StudentProfile;
  attendance: AttendanceSubject[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  student,
  attendance,
}) => {
  // Safe bunk simulator state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('overall');
  const [simulatorMode, setSimulatorMode] = useState<'miss' | 'attend'>('miss');
  const [simulatedClasses, setSimulatedClasses] = useState<number>(2);

  // Calculate overall stats
  const totalAttended = attendance.reduce((sum, s) => sum + s.attended, 0);
  const totalClasses = attendance.reduce((sum, s) => sum + s.total, 0);
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

  // Simulator calculation
  let targetAttended = totalAttended;
  let targetTotal = totalClasses;
  let selectedSubjectName = 'All Subjects (Aggregate)';

  if (selectedSubjectId !== 'overall') {
    const sub = attendance.find((s) => s.id === selectedSubjectId);
    if (sub) {
      targetAttended = sub.attended;
      targetTotal = sub.total;
      selectedSubjectName = sub.name;
    }
  }

  let projectedAttended = targetAttended;
  let projectedTotal = targetTotal + simulatedClasses;

  if (simulatorMode === 'attend') {
    projectedAttended += simulatedClasses;
  }

  const projectedPercentage = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : 0;
  const percentageDelta = projectedPercentage - ((targetAttended / targetTotal) * 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>Attendance Portal & Monitoring</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official records updated daily by faculty after biometric & ERP roll calls.
          </p>
        </div>

        {/* 75% Rule Compliance Status */}
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            {overallPercentage.toFixed(1)}%
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900">Eligible for End-Term Exams</div>
            <div className="text-[11px] text-emerald-700">Satisfies 75% UGC/AICTE minimum criteria</div>
          </div>
        </div>
      </div>

      {/* Simulator Section: The Bunker & Shortage Calculator */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Attendance Planner & Bunker Simulator</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              Calculate How Many Classes You Can Safely Miss
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Plan your leaves, hackathons, or holidays without risking exam debarment.
            </p>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Target</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="overall">All Subjects Combined</option>
                  {attendance.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name.slice(0, 24)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Scenario Mode</label>
                <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSimulatorMode('miss')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      simulatorMode === 'miss' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    If I Miss / Bunk
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatorMode('attend')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      simulatorMode === 'attend' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    If I Attend
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Number of Classes ({simulatedClasses})
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={simulatedClasses}
                  onChange={(e) => setSimulatedClasses(parseInt(e.target.value) || 1)}
                  className="w-full accent-indigo-500 cursor-pointer h-8"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 text-center space-y-3">
            <div className="text-xs font-semibold text-slate-400">
              Projected Attendance for <br />
              <strong className="text-white text-sm">{selectedSubjectName}</strong>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="text-4xl font-black text-white">
                {projectedPercentage.toFixed(1)}%
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-lg ${
                projectedPercentage >= 75
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {projectedPercentage >= 75 ? 'Safe Status' : 'Debarred Risk (<75%)'}
              </div>
            </div>

            <p className="text-xs text-slate-300">
              {simulatorMode === 'miss' ? (
                projectedPercentage >= 75 ? (
                  <span>
                    You will still have <strong className="text-emerald-400">{projectedPercentage.toFixed(1)}%</strong>, comfortably above the 75% bar.
                  </span>
                ) : (
                  <span className="text-red-300 font-semibold">
                    Warning! Missing {simulatedClasses} classes drops your attendance below 75%.
                  </span>
                )
              ) : (
                <span>
                  Attending {simulatedClasses} consecutive classes boosts you by <strong className="text-emerald-400">+{percentageDelta.toFixed(1)}%</strong>.
                </span>
              )}
            </p>
          </div>

        </div>
      </div>

      {/* Subject-Wise Detailed Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Subject-Wise Attendance Breakdown ({attendance.length} Courses)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Academic Threshold: <strong>75.0%</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.map((sub) => {
            const percentage = (sub.attended / sub.total) * 100;
            const isSafe = percentage >= 75;
            
            // Calculate how many more classes can be missed safely
            // Formula: attended / (total + x) >= 0.75 => x <= (attended / 0.75) - total
            const maxCanMiss = Math.max(0, Math.floor((sub.attended / 0.75) - sub.total));
            // Or if below 75%, how many needed to reach 75%
            // (attended + y) / (total + y) >= 0.75 => y >= (0.75 * total - attended) / 0.25
            const neededToAttend = Math.max(0, Math.ceil((0.75 * sub.total - sub.attended) / 0.25));

            return (
              <div
                key={sub.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Subject Info */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {sub.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {sub.credits} Credits • {sub.type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {sub.name}
                  </h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Faculty: {sub.faculty}
                  </div>

                  {/* Attendance Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700">
                        {sub.attended} / {sub.total} Classes
                      </span>
                      <span className={isSafe ? 'text-emerald-600' : 'text-amber-600'}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isSafe ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                      {/* 75% marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                        style={{ left: '75%' }}
                        title="75% Minimum Bar"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Safety Status & Recent Log */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status:</span>
                    {isSafe ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        Can miss {maxCanMiss} class{maxCanMiss !== 1 ? 'es' : ''}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                        Attend next {neededToAttend} class{neededToAttend !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>

                  {/* Recent classes history */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Recent:</span>
                    <div className="flex items-center gap-1.5">
                      {sub.recentDates.map((r, i) => (
                        <span
                          key={i}
                          title={`${r.date}: ${r.status}`}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            r.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {r.status === 'Present' ? 'P' : 'A'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* University Attendance Regulations Callout */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-800">Apex University Attendance Policy:</div>
          <p>
            1. As per university ordinance, 75% attendance in theory and 80% in practical labs is mandatory to sit for the semester end examinations.
          </p>
          <p>
            2. In case of verified medical conditions (up to 10% relaxation), medical certificates endorsed by the university medical officer must be submitted to the HOD within 7 days of returning to campus.
          </p>
        </div>
      </div>

    </div>
  );
};
