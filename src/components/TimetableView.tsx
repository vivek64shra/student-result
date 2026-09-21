import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Printer, 
  Download, 
  Coffee, 
  Sparkles,
  Layers
} from 'lucide-react';
import { DaySchedule, StudentProfile } from '../types';

interface TimetableViewProps {
  student: StudentProfile;
  timetable: DaySchedule[];
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  student,
  timetable,
}) => {
  const [selectedDay, setSelectedDay] = useState<DaySchedule['day']>('Monday');

  const currentSchedule = timetable.find((t) => t.day === selectedDay) || timetable[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Class Timetable & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Section: <strong className="text-slate-800">{student.section}</strong> • Room: <strong className="text-slate-800">LT-301 (Technology Tower)</strong> • Academic Year: 2025-26
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {timetable.map((dayPlan) => {
          const isSelected = selectedDay === dayPlan.day;
          return (
            <button
              key={dayPlan.day}
              type="button"
              onClick={() => setSelectedDay(dayPlan.day)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {dayPlan.day}
              <span className="ml-2 text-[10px] opacity-75 font-normal">
                ({dayPlan.slots.length} slots)
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule Timeline Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Daily Schedule for {selectedDay}</span>
          </div>
          <span className="text-xs text-slate-500">
            Timings: 09:00 AM – 04:30 PM
          </span>
        </div>

        <div className="space-y-3">
          {currentSchedule.slots.map((slot, index) => {
            const isBreak = slot.type === 'Break';
            const isFirst = index === 0;

            if (isBreak) {
              return (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500"
                >
                  <div className="flex items-center gap-2.5 font-medium">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-slate-700">{slot.subject}</span>
                    <span>• Central Cafeteria & Student Commons</span>
                  </div>
                  <div className="font-mono text-slate-400">{slot.time}</div>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isFirst
                    ? 'bg-indigo-50/50 border-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-700 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Slot</span>
                    <span className="text-sm font-extrabold">{index + 1}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900">{slot.subject}</h3>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {slot.code}
                      </span>
                      {isFirst && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Slot
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-700 font-mono">{slot.time}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-medium text-slate-700">{slot.room}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.faculty}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span
                    className={`inline-block text-xs font-bold px-3 py-1.5 rounded-xl ${
                      slot.type === 'Lecture'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : slot.type === 'Lab'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {slot.type} Session
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
