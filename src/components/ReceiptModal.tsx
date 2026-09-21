import React from 'react';
import { 
  X, 
  Printer, 
  GraduationCap, 
  CheckCircle2, 
  CreditCard 
} from 'lucide-react';
import { FeeItem, StudentProfile } from '../types';

interface ReceiptModalProps {
  student: StudentProfile;
  feeItem: FeeItem;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  student,
  feeItem,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              Accounts Voucher
            </span>
            <span className="text-xs text-slate-500">Official Fee Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
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

        {/* The Formal Receipt Document */}
        <div className="border-2 border-slate-800 p-6 rounded-xl space-y-5 bg-white text-slate-900">
          
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 text-white flex items-center justify-center font-black">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider uppercase">APEX UNIVERSITY</h1>
                <p className="text-[11px] text-slate-600 font-semibold">FINANCE & ACCOUNTS DEPARTMENT • RECEIPT VOUCHER</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                PAID & CLEARED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-300">
            <div>Receipt No: <strong className="font-mono text-indigo-900">{feeItem.receiptNo}</strong></div>
            <div>Date of Payment: <strong className="text-slate-800">{feeItem.paidDate}</strong></div>
            <div>Student Name: <strong className="text-slate-800">{student.name}</strong></div>
            <div>Roll Number: <strong className="font-mono text-slate-800">{student.rollNo}</strong></div>
            <div>Program: <strong className="text-slate-800">{student.program}</strong></div>
            <div>Semester: <strong className="text-slate-800">{feeItem.semester}th Semester</strong></div>
          </div>

          <table className="w-full text-left text-xs border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300">Sr.</th>
                <th className="p-2 border-r border-slate-300">Fee Particulars</th>
                <th className="p-2 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {feeItem.breakdown.map((b, i) => (
                <tr key={i}>
                  <td className="p-2 text-center border-r border-slate-200">{i + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-medium">{b.item}</td>
                  <td className="p-2 text-right font-mono font-bold">₹{b.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="p-2.5 text-right" colSpan={2}>Grand Total Received</td>
                <td className="p-2.5 text-right font-mono text-sm text-emerald-800">
                  ₹{feeItem.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <div>
              Payment Mode: <strong>Online Net Banking (HDFC Gateway)</strong>
              <br />
              Auth Ref: <span className="font-mono">TXN-2026-9912091</span>
            </div>
            <div className="text-center">
              <div className="font-serif italic font-bold text-slate-800">Finance Officer</div>
              <div className="text-[10px] border-t border-slate-400 pt-0.5">Apex University Accounts</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
