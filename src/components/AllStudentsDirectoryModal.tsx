import React, { useState, useMemo } from 'react';
import { X, Search, GraduationCap, ArrowRight, UserCheck } from 'lucide-react';
import { ParsedStudent } from '../utils/reportCardParser';

interface AllStudentsDirectoryModalProps {
  students: ParsedStudent[];
  onSelectStudent: (student: ParsedStudent) => void;
  onClose: () => void;
}

export const AllStudentsDirectoryModal: React.FC<AllStudentsDirectoryModalProps> = ({
  students,
  onSelectStudent,
  onClose,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredStudents = useMemo(() => {
    if (!filterQuery.trim()) return students;
    const q = filterQuery.toLowerCase().trim();
    return students.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.scholarNo.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.mobile.includes(q)
      );
    });
  }, [students, filterQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1a73e8]" />
              <span>School Students Directory ({students.length} Students)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any student to view their official academic report card.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter Input */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by Student Name, Scholar No, Roll No, or Father's Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1a73e8]"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Koi student nahi mila matching "{filterQuery}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3">Scholar No</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Father's Name</th>
                    <th className="py-2.5 px-3">Mobile</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((s, idx) => (
                    <tr
                      key={`${s.scholarNo}-${idx}`}
                      className="hover:bg-blue-50/70 transition-colors cursor-pointer"
                      onClick={() => {
                        onSelectStudent(s);
                        onClose();
                      }}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {s.scholarNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#1a73e8]">
                        {s.rollNo}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {s.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {s.fatherName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {s.mobile}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-[#1a73e8] hover:bg-blue-700 text-white font-semibold rounded text-xs inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
