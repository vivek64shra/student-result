import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  X, 
  Filter, 
  GraduationCap, 
  Search, 
  BookOpen, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { ParsedStudent, SCHOOL_INFO } from '../utils/reportCardParser';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: ParsedStudent[];
  onSelectStudent: (student: ParsedStudent) => void;
  onLogout: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
  onLogout,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<'quarterly' | 'halfYearly' | 'annual'>('quarterly');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Group statistics by class
  const classList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.className || s.sheetName));
    return Array.from(set).sort();
  }, [students]);

  // 2. Compute aggregate metrics per class and overall
  const classStats = useMemo(() => {
    const statsMap: Record<
      string,
      {
        className: string;
        sheetName: string;
        total: number;
        appeared: number;
        passed: number;
        failed: number;
        avgPercentage: number;
        topStudent: { name: string; per: number; scholar: string } | null;
      }
    > = {};

    classList.forEach((cls) => {
      statsMap[cls] = {
        className: cls,
        sheetName: '',
        total: 0,
        appeared: 0,
        passed: 0,
        failed: 0,
        avgPercentage: 0,
        topStudent: null,
      };
    });

    students.forEach((s) => {
      const cls = s.className || s.sheetName;
      if (!statsMap[cls]) {
        statsMap[cls] = {
          className: cls,
          sheetName: s.sheetName,
          total: 0,
          appeared: 0,
          passed: 0,
          failed: 0,
          avgPercentage: 0,
          topStudent: null,
        };
      }

      statsMap[cls].total++;
      statsMap[cls].sheetName = s.sheetName;

      const examData = s[selectedExam];
      if (examData && examData.rows.length > 0) {
        statsMap[cls].appeared++;
        const per = parseFloat(examData.percentage);
        const validPer = !isNaN(per) ? per : 0;
        statsMap[cls].avgPercentage += validPer;

        const isPass =
          String(examData.result).toUpperCase().includes('PASS') ||
          String(examData.result).toUpperCase().includes('FIRST') ||
          validPer >= 33;

        if (isPass) {
          statsMap[cls].passed++;
        } else {
          statsMap[cls].failed++;
        }

        if (
          !statsMap[cls].topStudent ||
          validPer > statsMap[cls].topStudent!.per
        ) {
          statsMap[cls].topStudent = {
            name: s.name,
            per: validPer,
            scholar: s.scholarNo,
          };
        }
      }
    });

    // Compute averages
    Object.values(statsMap).forEach((st) => {
      if (st.appeared > 0) {
        st.avgPercentage = Number((st.avgPercentage / st.appeared).toFixed(1));
      }
    });

    return Object.values(statsMap);
  }, [students, classList, selectedExam]);

  // Overall totals
  const overallMetrics = useMemo(() => {
    let totalStudents = students.length;
    let totalAppeared = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let sumPer = 0;

    classStats.forEach((c) => {
      totalAppeared += c.appeared;
      totalPassed += c.passed;
      totalFailed += c.failed;
      sumPer += c.avgPercentage * c.appeared;
    });

    const passRate = totalAppeared > 0 ? ((totalPassed / totalAppeared) * 100).toFixed(1) : '0';
    const overallAvg = totalAppeared > 0 ? (sumPer / totalAppeared).toFixed(1) : '0';

    return {
      totalStudents,
      totalAppeared,
      totalPassed,
      totalFailed,
      passRate,
      overallAvg,
    };
  }, [students, classStats]);

  // Filtered student list for drilling down
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'ALL' || (s.className || s.sheetName) === selectedClass;
      if (!matchClass) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.scholarNo.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q)
      );
    });
  }, [students, selectedClass, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn print:hidden">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-indigo-900/60 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded font-black tracking-wide">
                  PRAMUKH DASHBOARD
                </span>
                <span className="text-xs text-indigo-200">
                  {SCHOOL_INFO.schoolName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                सभी कक्षाओं का संपूर्ण परिणाम & एनालिटिक्स (All 21 Classes)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Exam selector */}
            <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedExam('quarterly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedExam === 'quarterly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                त्रैमासिक (Quarterly)
              </button>
              <button
                type="button"
                onClick={() => setSelectedExam('halfYearly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedExam === 'halfYearly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                अर्द्धवार्षिक (Half-Yearly)
              </button>
              <button
                type="button"
                onClick={() => setSelectedExam('annual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedExam === 'annual'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                वार्षिक (Annual)
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Quick Metrics KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span>कुल विद्यार्थी</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {overallMetrics.totalStudents}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">21 Class Sheets</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>परीक्षा सम्मिलित</span>
              </div>
              <div className="text-2xl font-black text-indigo-950 font-mono">
                {overallMetrics.totalAppeared}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Assessed Students</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>उत्तीर्ण (Passed)</span>
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {overallMetrics.totalPassed}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Pass Rate: {overallMetrics.passRate}%
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>अनुत्तीर्ण (Failed)</span>
              </div>
              <div className="text-2xl font-black text-red-600 font-mono">
                {overallMetrics.totalFailed}
              </div>
              <div className="text-[11px] text-red-500 mt-0.5">Needs Attention</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <span>औसत प्रतिशत</span>
              </div>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {overallMetrics.overallAvg}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">School Average</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-1">
                <Award className="w-4 h-4 text-purple-600" />
                <span>कुल कक्षाएं</span>
              </div>
              <div className="text-2xl font-black text-purple-700 font-mono">
                {classList.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">LKG to 12th</div>
            </div>
          </div>

          {/* Graphical Representation: Bar Graph of All Classes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1a73e8]" />
                  <span>सभी कक्षाओं का पास प्रतिशत ग्राफ़ (Pass Percentage Graph)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  हर कक्षा का उत्तीर्ण प्रतिशत बार चार्ट के रूप में सिंगल क्लिक में देखें
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span>75%+ (Excellent)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                  <span>50-74% (Good)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-red-400 inline-block"></span>
                  <span>&lt;50% (Low)</span>
                </span>
              </div>
            </div>

            {/* Visual Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {classStats.map((st) => {
                const passRatio = st.appeared > 0 ? (st.passed / st.appeared) * 100 : 0;
                const barColor =
                  passRatio >= 75
                    ? 'bg-emerald-500'
                    : passRatio >= 50
                    ? 'bg-[#1a73e8]'
                    : 'bg-red-400';

                return (
                  <div
                    key={st.className}
                    onClick={() => setSelectedClass(selectedClass === st.className ? 'ALL' : st.className)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedClass === st.className
                        ? 'bg-blue-50/80 border-[#1a73e8] shadow-sm ring-2 ring-blue-100'
                        : 'bg-slate-50/70 border-slate-200/90 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {st.className}
                      </span>
                      <span className="font-mono font-bold text-slate-600">
                        {st.passed}/{st.appeared} Passed ({passRatio.toFixed(0)}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, Math.max(2, passRatio))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70">
                      <span>औसत: <b>{st.avgPercentage}%</b></span>
                      {st.topStudent && (
                        <span className="truncate max-w-[130px] text-indigo-900 font-semibold" title={st.topStudent.name}>
                          Topper: {st.topStudent.name.split(' ')[0]} ({st.topStudent.per}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drilldown Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-xs sm:text-sm font-bold text-slate-700">कक्षा फ़िल्टर:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ALL">सभी कक्षाएं (All {students.length} Students)</option>
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input in admin */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="विद्यार्थी नाम या रोल नंबर..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white outline-none focus:border-[#1a73e8]"
                />
              </div>
            </div>

            {/* Students Data Grid */}
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-300 z-10">
                  <tr>
                    <th className="py-2.5 px-3">कक्षा</th>
                    <th className="py-2.5 px-3">Scholar No</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">विद्यार्थी का नाम</th>
                    <th className="py-2.5 px-3">पिता का नाम</th>
                    <th className="py-2.5 px-3 text-center">पूर्णांक / प्राप्तांक</th>
                    <th className="py-2.5 px-3 text-center">प्रतिशत</th>
                    <th className="py-2.5 px-3 text-center">परिणाम</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        कोई विद्यार्थी नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const exam = s[selectedExam];
                      const isPass = exam && (
                        String(exam.result).toUpperCase().includes('PASS') ||
                        String(exam.result).toUpperCase().includes('FIRST')
                      );

                      return (
                        <tr
                          key={`${s.scholarNo}-${s.sheetName}-${idx}`}
                          className="hover:bg-blue-50/70 transition-colors"
                        >
                          <td className="py-2 px-3 font-semibold text-slate-700">
                            {s.className || s.sheetName}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {s.scholarNo}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-[#1a73e8]">
                            {s.rollNo}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-950">
                            {s.name}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {s.fatherName}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-slate-700">
                            {exam ? `${exam.grandTotal} / ${exam.totalMaxMarks}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                            {exam ? `${exam.percentage}%` : '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {exam ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                  isPass
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {exam.result}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStudent(s);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-[#1a73e8] hover:bg-blue-700 text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              Report Card
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredStudents.length} of {students.length} students</span>
              <span>Single Click to inspect or print individual marksheet</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
