import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Download, 
  Printer, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { FeeItem, StudentProfile } from '../types';

interface FeesViewProps {
  student: StudentProfile;
  fees: FeeItem[];
  onOpenReceipt: (feeItem: FeeItem) => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  student,
  fees,
  onOpenReceipt,
}) => {
  const currentSemesterFee = fees[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-sky-600" />
            <span>Fee Account & Payment Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accounts & Finance Directorate • Official transaction vouchers & clearance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>All Semester Dues Cleared</span>
          </div>
        </div>
      </div>

      {/* Account Clearance Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1 md:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Financial Status: Clean (No Arrears)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Semester {student.semester} Academic Registration Validated
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              No outstanding dues are pending against Roll No: <strong className="text-white font-mono">{student.rollNo}</strong>. You are permitted to register for courses and download examination admit cards.
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-center space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Semester 6 Paid</span>
            <div className="text-2xl font-black text-emerald-400">
              ₹87,500
            </div>
            <div className="text-[11px] text-slate-400">
              Receipt No: {currentSemesterFee.receiptNo}
            </div>
            <button
              type="button"
              onClick={() => onOpenReceipt(currentSemesterFee)}
              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              View Official Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Current Fee Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>Fee Structure Breakdown (Semester {currentSemesterFee.semester})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Approved by Finance Committee for Academic Session 2025-26</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            Paid Date: {currentSemesterFee.paidDate}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <th className="py-2.5 px-3">Fee Head / Component</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSemesterFee.breakdown.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-semibold text-slate-800">{item.item}</td>
                  <td className="py-3 px-3 text-slate-500">Regular Semester 6 Institutional Charges</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      PAID
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <td className="py-3 px-3" colSpan={2}>Grand Total Paid</td>
                <td className="py-3 px-3 text-right font-mono text-sm text-emerald-700">
                  ₹{currentSemesterFee.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                    SETTLED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction & Invoices Archive */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Payment History & Transaction Invoices
        </h3>

        <div className="space-y-3">
          {fees.map((fee) => (
            <div
              key={fee.id}
              className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{fee.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {fee.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Receipt No: <strong className="font-mono text-slate-700">{fee.receiptNo}</strong></span>
                  <span>•</span>
                  <span>Paid on: {fee.paidDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 font-mono">
                    ₹{fee.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">Net Banking / UPI</div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenReceipt(fee)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
