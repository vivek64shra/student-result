import React, { useState } from 'react';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Video, 
  Code, 
  CheckCircle2, 
  ExternalLink, 
  User, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Course, StudentProfile } from '../types';

interface CoursesViewProps {
  student: StudentProfile;
  courses: Course[];
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  student,
  courses,
}) => {
  const [expandedCourseId, setExpandedCourseId] = useState<string>(courses[0]?.id || '');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const toggleCourse = (id: string) => {
    setExpandedCourseId(expandedCourseId === id ? '' : id);
  };

  const handleDownloadResource = (resourceTitle: string) => {
    setDownloadNotice(`Downloading "${resourceTitle}" to your local device...`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span>Courses & Study Materials</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access course syllabi, unit topics, lecture slide decks, and prescribed reference readings.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
          Total Credits Enrolled: 22 Credits
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadNotice}</span>
          </span>
          <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded font-bold uppercase">Success</span>
        </div>
      )}

      {/* Course Accordion List */}
      <div className="space-y-4">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleCourse(course.id)}
                className="p-6 cursor-pointer hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {course.credits} Credits • Core Subject
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {course.progressPercent}% Syllabus Covered
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {course.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.faculty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="w-28 hidden sm:block">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{course.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-6">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Units & Syllabus */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Course Curriculum & Units
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.units.map((unit) => (
                        <div
                          key={unit.unitNumber}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              Unit {unit.unitNumber}: {unit.title}
                            </span>
                            {unit.isCompleted ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                                Ongoing
                              </span>
                            )}
                          </div>

                          <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                            {unit.topics.map((t, idx) => (
                              <li key={idx} className="line-clamp-1">{t}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Downloadable Study Resources */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Study Materials & Lecture Downloads
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {course.studyResources.map((res, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              {res.type === 'PDF' && <FileText className="w-4 h-4" />}
                              {res.type === 'Slides' && <BookOpen className="w-4 h-4" />}
                              {res.type === 'Video' && <Video className="w-4 h-4" />}
                              {res.type === 'Code' && <Code className="w-4 h-4" />}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-800 truncate" title={res.title}>
                                {res.title}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {res.type} • {res.size}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadResource(res.title)}
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
