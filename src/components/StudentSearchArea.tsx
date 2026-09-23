import React, { useState } from 'react';
import { Search, RefreshCw, Users, Sparkles, Calendar, Globe, MessageSquareText, ExternalLink } from 'lucide-react';
import { ParsedStudent } from '../utils/reportCardParser';
import { MAIN_SCHOOL_WEBSITE_URL } from './LoginPage';

interface StudentSearchAreaProps {
  onSearch: (query: string) => void;
  onSelectStudent: (student: ParsedStudent) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
  allStudents: ParsedStudent[];
  onOpenDirectory: () => void;
  onOpenAdminLogin: () => void;
  isAdminLoggedIn?: boolean;
}

export const StudentSearchArea: React.FC<StudentSearchAreaProps> = ({
  onSearch,
  onSelectStudent,
  lastUpdated,
  onRefresh,
  allStudents,
  onOpenDirectory,
  onOpenAdminLogin,
  isAdminLoggedIn,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      alert('कृपया स्कॉलर नंबर अथवा रोल नंबर दर्ज करें!');
      return;
    }
    onSearch(inputVal.trim());
  };

  const handleRefreshClick = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  return (
    <div className="search-area bg-gradient-to-b from-white via-slate-50 to-[#f3f6fa] p-4 sm:p-7 rounded-2xl text-center mb-6 border border-slate-200/90 shadow-md print:hidden">
      {/* Official Timestamp Indicator */}
      <div className="inline-flex items-center justify-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700">
        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>
          अंतिम परीक्षा अद्यतन: <strong className="text-slate-900 font-bold">{lastUpdated || '21 सितम्बर 2026, 07:30 PM'}</strong>
        </span>
        {onRefresh && (
          <button
            type="button"
            onClick={handleRefreshClick}
            title="रिकॉर्ड्स रीफ्रेश करें"
            className="ml-1 p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
      </div>

      {/* Search Input Form matching mobile & desktop standards */}
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
        <label htmlFor="rollNo" className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 shrink-0">
          स्कॉलर नंबर / रोल नंबर:
        </label>
        
        <div className="relative w-full sm:w-80">
          <input
            id="rollNo"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="स्कॉलर नं. अथवा रोल नं. डालें..."
            className="w-full px-4 py-3 text-base font-mono font-bold tracking-wide border-2 border-[#1a73e8] rounded-xl outline-none bg-white shadow-xs focus:ring-4 focus:ring-blue-100 transition-all text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#1a73e8] to-[#1258b5] hover:from-blue-700 hover:to-blue-800 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>परिणाम देखें</span>
        </button>
      </form>

      {/* Quick Links */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-500">
        <span>विद्यार्थी का स्कॉलर नंबर अथवा रोल नंबर दर्ज करें।</span>
        <a
          href={MAIN_SCHOOL_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          title="फीडबैक भेजें"
        >
          <MessageSquareText className="w-3.5 h-3.5 text-amber-800" />
          <span>फीडबैक / Any Query ↗</span>
        </a>

        <a
          href={MAIN_SCHOOL_WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          title="मुख्य विद्यालय पोर्टल"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>मुख्य वेबसाइट ↗</span>
        </a>

        <button
          type="button"
          onClick={onOpenDirectory}
          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-amber-700" />
          <span>सभी {allStudents.length} विद्यार्थी सूची</span>
        </button>

        <button
          type="button"
          onClick={onOpenAdminLogin}
          className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
            isAdminLoggedIn
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-indigo-900 hover:bg-indigo-950 text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isAdminLoggedIn ? 'प्रप्रमुख डैशबोर्ड (सक्रिय)' : 'प्रशासक लॉगिन'}</span>
        </button>
      </div>
    </div>
  );
};


