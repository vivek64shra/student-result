import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  FileText, 
  UserCheck, 
  MessageSquare,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { LeaveRequest, StudentProfile } from '../types';

interface LeaveSupportViewProps {
  student: StudentProfile;
  leaves: LeaveRequest[];
  onApplyLeave: (newLeave: LeaveRequest) => void;
}

export const LeaveSupportView: React.FC<LeaveSupportViewProps> = ({
  student,
  leaves,
  onApplyLeave,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leave' | 'helpdesk'>('leave');

  // Leave Form state
  const [leaveType, setLeaveType] = useState<LeaveRequest['type']>('Academic');
  const [fromDate, setFromDate] = useState('2026-09-25');
  const [toDate, setToDate] = useState('2026-09-27');
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Helpdesk form state
  const [queryCategory, setQueryCategory] = useState('Academics');
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySent, setQuerySent] = useState(false);

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      type: leaveType,
      fromDate: fromDate,
      toDate: toDate,
      days: 3,
      reason: reason,
      appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending',
    };

    onApplyLeave(newRequest);
    setReason('');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
  };

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) return;

    setQuerySent(true);
    setQuerySubject('');
    setQueryMessage('');
    setTimeout(() => setQuerySent(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-indigo-600" />
            <span>Leave Applications & Student Helpdesk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit academic out-passes, medical leaves, and raise support tickets directly to faculty advisors.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('leave')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'leave'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Apply Leave
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('helpdesk')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'helpdesk'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Raise Support Ticket
          </button>
        </div>
      </div>

      {activeSubTab === 'leave' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Apply Leave Form (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Apply for New Leave / Out-pass
              </h2>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Advisor: {student.academicAdvisor.split('(')[0]}
              </span>
            </div>

            {isSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Leave application submitted to Department HOD for approval!</span>
              </div>
            )}

            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Nature / Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveRequest['type'])}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Academic">Academic (Hackathon, Conference, Workshop)</option>
                  <option value="Medical">Medical (Illness with doctor prescription)</option>
                  <option value="Personal">Personal / Family Urgent Leave</option>
                  <option value="Hostel Out-pass">Hostel Out-pass (Weekend Night Stay)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Leave / Out-pass
                </label>
                <textarea
                  rows={4}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why leave is requested, event details, or health condition..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Leave to HOD</span>
              </button>
            </form>
          </div>

          {/* Past Leaves History (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Leave Request History ({leaves.length})
              </h2>
              <span className="text-xs text-slate-500">Official Portal Log</span>
            </div>

            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{leave.type} Leave</span>
                      <span className="text-xs text-slate-500">
                        ({leave.days} day{leave.days > 1 ? 's' : ''})
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : leave.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {leave.reason}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Duration: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong>
                    </span>
                    {leave.approvedBy && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        Approved by HOD
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Support Ticket Sub-Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Raise Academic or Hostel Grievance Ticket
            </h2>

            {querySent && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ticket #TK-8942 logged. Student Support Cell will respond within 24 business hours.</span>
              </div>
            )}

            <form onSubmit={handleSubmitQuery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
                <select
                  value={queryCategory}
                  onChange={(e) => setQueryCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Academics">Department HOD / Academic Advisor</option>
                  <option value="Examination">Controller of Examinations (CoE)</option>
                  <option value="Accounts">Fee Accounts & Billing Department</option>
                  <option value="Hostel">Chief Hostel Warden & Mess Committee</option>
                  <option value="Library">Central Library Book Circulation</option>
                  <option value="IT">ICT ERP Technical Helpdesk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={querySubject}
                  onChange={(e) => setQuerySubject(e.target.value)}
                  placeholder="Brief headline of your issue..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                  placeholder="Provide all relevant details, course codes, or reference receipts..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Grievance Ticket</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              Campus Emergency & Cell Directory
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Academic Dean's Office</div>
                <div className="text-slate-500">Block A, Room 201 • Phone: +91 (11) 2389-1001</div>
                <div className="text-indigo-600 font-mono">dean.academics@apexuniversity.edu.in</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Examination Cell Helpline</div>
                <div className="text-slate-500">Admin Tower, 1st Floor • Phone: +91 (11) 2389-1004</div>
                <div className="text-indigo-600 font-mono">coe.support@apexuniversity.edu.in</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">24x7 University Ambulance & Dispensary</div>
                <div className="text-slate-500">Opposite Sports Complex • Emergency: 1800-420-9999</div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Anti-Ragging & Women Grievance Cell</div>
                <div className="text-slate-500">Toll-Free National Hotline: 1800-180-5522 (Strict Zero Tolerance)</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
