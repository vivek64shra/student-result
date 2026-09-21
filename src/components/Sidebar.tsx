import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  CalendarDays, 
  BookOpen, 
  FileCheck2, 
  Award, 
  CreditCard, 
  Contact, 
  LifeBuoy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab, StudentProfile } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  student: StudentProfile;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  student,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance Tracker', icon: CheckCircle2, badge: `${student.attendancePercentage}%` },
    { id: 'timetable', label: 'Class Timetable', icon: CalendarDays },
    { id: 'courses', label: 'Courses & Syllabus', icon: BookOpen },
    { id: 'assignments', label: 'Assignments & Labs', icon: FileCheck2, badge: '2 Due' },
    { id: 'exams', label: 'Exams & Grades', icon: Award, badge: `CGPA ${student.cgpa}` },
    { id: 'fees', label: 'Fee & Dues Status', icon: CreditCard },
    { id: 'idcard', label: 'Digital Student ID', icon: Contact },
    { id: 'leave', label: 'Leave & Helpdesk', icon: LifeBuoy },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out flex flex-col justify-between overflow-y-auto lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Academic Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-indigo-700/80 text-white'
                        : item.id === 'attendance'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.id === 'assignments'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Student Academic Standing Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Standing: Good
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5 mt-1.5">
              <div className="flex justify-between">
                <span>Semester:</span>
                <span className="font-semibold text-slate-700">{student.semester}th Sem</span>
              </div>
              <div className="flex justify-between">
                <span>Earned Credits:</span>
                <span className="font-semibold text-slate-700">{student.totalCredits} / 160</span>
              </div>
              <div className="flex justify-between">
                <span>Advisor:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={student.academicAdvisor}>
                  {student.academicAdvisor.split('(')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
