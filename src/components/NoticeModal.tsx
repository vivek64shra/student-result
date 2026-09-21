import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Building, 
  CheckCircle2 
} from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeModalProps {
  notice: NoticeItem;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notice,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
              notice.category === 'Examination' ? 'bg-amber-100 text-amber-800' :
              notice.category === 'Placement' ? 'bg-purple-100 text-purple-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {notice.category}
            </span>
            <span className="text-xs text-slate-500">{notice.date}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {notice.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Issued by: <strong>{notice.department}</strong></span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>{notice.content}</p>
            <p className="text-[11px] text-slate-500">
              For any queries, students may reach out to their class representatives or respective faculty coordinators.
            </p>
          </div>

          {notice.downloadFile && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-indigo-950 truncate">{notice.downloadFile}</div>
                  <div className="text-[10px] text-indigo-700">Official Circular Circular Document (PDF)</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}

          {downloaded && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Official attachment downloaded successfully!</span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
