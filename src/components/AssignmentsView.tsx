import React, { useState } from 'react';
import { 
  FileCheck2, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X, 
  Sparkles, 
  Paperclip,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Assignment, StudentProfile } from '../types';

interface AssignmentsViewProps {
  student: StudentProfile;
  assignments: Assignment[];
  onUpdateAssignment: (assignmentId: string, updatedData: Partial<Assignment>) => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  student,
  assignments,
  onUpdateAssignment,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [activeSubmitModal, setActiveSubmitModal] = useState<Assignment | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleOpenSubmit = (assignment: Assignment) => {
    setActiveSubmitModal(assignment);
    setSelectedFileName(`${student.name.replace(/\s+/g, '_')}_${assignment.subjectCode}_Assignment.pdf`);
    setSubmissionNotes('');
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitModal) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onUpdateAssignment(activeSubmitModal.id, {
        status: 'submitted',
        submittedFile: selectedFileName || 'Submission_File.pdf',
        submittedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      setIsSubmitting(false);
      setActiveSubmitModal(null);

      // Trigger celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log(err);
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-amber-500" />
            <span>Assignments & Lab Submissions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit coursework, track evaluation feedback, and view grading rubrics.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
              {f === 'pending' && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px]">
                  {assignments.filter((a) => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List Grid */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => {
          const isPending = assignment.status === 'pending';
          const isGraded = assignment.status === 'graded';
          const isSubmitted = assignment.status === 'submitted';

          return (
            <div
              key={assignment.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {assignment.subjectCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {assignment.subject}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isSubmitted
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {assignment.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Deadlines & Marks */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Due: <strong className="text-slate-800">{assignment.dueDate}</strong></span>
                  </span>
                  <span>•</span>
                  <span>Max Marks: <strong className="text-slate-800">{assignment.totalMarks}</strong></span>
                  
                  {assignment.submittedAt && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">
                        Submitted on: {assignment.submittedAt}
                      </span>
                    </>
                  )}
                </div>

                {/* Graded Feedback Callout */}
                {isGraded && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Graded Score: {assignment.obtainedMarks} / {assignment.totalMarks} Marks
                      </span>
                      <span className="font-semibold text-emerald-700">
                        ({(((assignment.obtainedMarks || 0) / assignment.totalMarks) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    {assignment.feedback && (
                      <p className="text-slate-600 italic">
                        "{assignment.feedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-start gap-2">
                {isPending && (
                  <button
                    type="button"
                    onClick={() => handleOpenSubmit(assignment)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Submit Work</span>
                  </button>
                )}

                {isSubmitted && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                    <Check className="w-4 h-4" />
                    <span>Under Review</span>
                  </div>
                )}

                {isGraded && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Completed</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {activeSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Submit Assignment</h3>
                  <p className="text-xs text-slate-500">{activeSubmitModal.subjectCode} • {activeSubmitModal.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmitModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              {/* File upload simulator */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attach Solution File (PDF, ZIP, IPYNB, DOCX)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-center bg-slate-50/50 cursor-pointer">
                  <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-slate-800">
                    {selectedFileName || 'Click to select project file'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    File selected: <span className="font-mono text-indigo-600">{selectedFileName}</span> (2.4 MB)
                  </div>
                </div>
              </div>

              {/* Student Remarks / Repository Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Submission Notes or GitHub Repository Link (Optional)
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. GitHub URL: https://github.com/vivek1212/cnn-mnist-classifier with instructions..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Honor Pledge */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  id="honor-pledge"
                  defaultChecked
                  className="w-4 h-4 rounded mt-0.5 accent-indigo-600"
                />
                <label htmlFor="honor-pledge" className="cursor-pointer">
                  I certify that this submission is my own original work and adheres strictly to the Apex University Academic Integrity Code.
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubmitModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
