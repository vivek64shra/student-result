import React, { useState } from 'react';
import { 
  GraduationCap, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User, 
  QrCode, 
  CheckCircle2, 
  ChevronDown,
  Sparkles,
  FileText
} from 'lucide-react';
import { StudentProfile, NoticeItem, ActiveTab } from '../types';

interface HeaderProps {
  student: StudentProfile;
  notices: NoticeItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  notices,
  setActiveTab,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & University Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base">APEX UNIVERSITY</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    ERP Portal
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {student.program} • Sem {student.semester}
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right: Quick status pill & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Attendance Pill */}
            <div 
              onClick={() => setActiveTab('attendance')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100 transition-colors"
              title="Click to view Attendance breakdown"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Attendance: {student.attendancePercentage}% (Safe)</span>
            </div>

            {/* Quick CGPA Pill */}
            <div 
              onClick={() => setActiveTab('exams')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-200 transition-colors"
              title="Click to view Exam results"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>CGPA: {student.cgpa}</span>
            </div>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserDropdown(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
              </button>

              {/* Notifications Flyout */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span>University Announcements</span>
                    </div>
                    <span className="text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {notices.length} New
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notices.map((n) => (
                      <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            n.category === 'Examination' ? 'bg-amber-100 text-amber-800' :
                            n.category === 'Placement' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {n.category}
                          </span>
                          <span className="text-[11px] text-slate-400">{n.date}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-2">{n.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('dashboard');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Notice Board
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2.5 p-1 sm:pl-2.5 sm:pr-3 sm:py-1 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer"
              >
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-300"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                    {student.name}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {student.rollNo}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-indigo-50/30">
                    <div className="font-bold text-sm text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">Roll No: {student.rollNo}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{student.email}</div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('idcard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                    >
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>Digital Student ID Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('exams');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Download Marksheet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('leave');
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-sky-600" />
                      <span>Student Helpdesk & Leaves</span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out (Exit Portal)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
