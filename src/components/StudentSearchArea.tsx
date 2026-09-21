import React, { useState } from 'react';
import { Search, RefreshCw, Users, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ParsedStudent } from '../utils/reportCardParser';

interface StudentSearchAreaProps {
  onSearch: (query: string) => void;
  onSelectStudent: (student: ParsedStudent) => void;
  statusText: string;
  isLiveLoading: boolean;
  isLiveSuccess: boolean;
  onRefreshLive: () => void;
  allStudents: ParsedStudent[];
  onOpenDirectory: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn?: boolean;
}

export const StudentSearchArea: React.FC<StudentSearchAreaProps> = ({
  onSearch,
  onSelectStudent,
  statusText,
  isLiveLoading,
  isLiveSuccess,
  onRefreshLive,
  allStudents,
  onOpenDirectory,
  onOpenAdminLogin,
  isAdminLoggedIn,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      alert('Kripya Scholar No ya Roll No darj karein!');
      return;
    }
    onSearch(inputVal.trim());
  };

  return (
    <div className="search-area bg-gradient-to-b from-white via-slate-50 to-[#f3f6fa] p-5 sm:p-7 rounded-2xl text-center mb-6 border border-slate-200/90 shadow-md print:hidden">
      {/* Live Google Sheets Status Message */}
      <div className="inline-flex items-center justify-center gap-2 mb-5 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
        <p
          id="loadStatus"
          className={`font-semibold text-xs sm:text-sm m-0 flex items-center gap-2 ${
            isLiveSuccess ? 'text-emerald-700' : isLiveLoading ? 'text-[#1a73e8]' : 'text-red-600'
          }`}
        >
          {isLiveSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : isLiveLoading ? (
            <RefreshCw className="w-4 h-4 text-[#1a73e8] animate-spin shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{statusText}</span>
        </p>

        <button
          type="button"
          onClick={onRefreshLive}
          title="Google Sheets se dubara sync karein"
          className="p-1 rounded-full text-slate-400 hover:text-[#1a73e8] hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLiveLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Input Form matching HTML & improved styling */}
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
        <label htmlFor="rollNo" className="text-sm sm:text-base font-extrabold text-slate-800 shrink-0">
          ID Dalein (Scholar No / Roll No):
        </label>
        
        <div className="relative w-full sm:w-80">
          <input
            id="rollNo"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Scholar No ya Roll No daalein..."
            className="w-full pl-4 pr-4 py-3 text-base font-mono font-bold tracking-wide border-2 border-[#1a73e8] rounded-xl outline-none bg-white shadow-sm focus:ring-4 focus:ring-blue-100 transition-all text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#1a73e8] to-[#1258b5] hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-base rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>RESULT DEKHEIN</span>
        </button>
      </form>

      {/* Search Help Info, Student Directory Link & Admin / Pramukh Login */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
        <span>विद्यार्थी का स्कॉलर नंबर अथवा रोल नंबर दर्ज करें।</span>
        <button
          type="button"
          onClick={onOpenDirectory}
          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-amber-700" />
          <span>Sabhi {allStudents.length} Students Directory</span>
        </button>

        <button
          type="button"
          onClick={onOpenAdminLogin}
          className={`px-3 py-1 rounded-lg font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
            isAdminLoggedIn
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-indigo-900 hover:bg-indigo-950 text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isAdminLoggedIn ? 'Pramukh Dashboard (Active)' : 'Admin / Pramukh Login (Graph & Analytics)'}</span>
        </button>
      </div>
    </div>
  );
};

