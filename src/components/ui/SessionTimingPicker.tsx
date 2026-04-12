'use client';

import React, { useCallback } from 'react';
import type { DayOfWeek } from '@/types/database';

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const WEEKDAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const WEEKEND: DayOfWeek[] = ['SAT', 'SUN'];

interface SessionTimingPickerProps {
  startTime: string;
  endTime: string;
  days: DayOfWeek[];
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onDaysChange: (v: DayOfWeek[]) => void;
  startTimeError?: string;
  endTimeError?: string;
  daysError?: string;
}

export function SessionTimingPicker({
  startTime,
  endTime,
  days,
  onStartTimeChange,
  onEndTimeChange,
  onDaysChange,
  startTimeError,
  endTimeError,
  daysError,
}: SessionTimingPickerProps): React.ReactElement {
  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      if (days.includes(day)) {
        onDaysChange(days.filter((d) => d !== day));
      } else {
        onDaysChange([...days, day]);
      }
    },
    [days, onDaysChange]
  );

  const isAllSelected = ALL_DAYS.every((d) => days.includes(d));
  const isWeekdaysSelected = WEEKDAYS.every((d) => days.includes(d)) && !WEEKEND.some((d) => days.includes(d));
  const isWeekendSelected = WEEKEND.every((d) => days.includes(d)) && !WEEKDAYS.some((d) => days.includes(d));

  const applyPreset = useCallback(
    (preset: 'all' | 'weekdays' | 'weekend') => {
      if (preset === 'all') {
        onDaysChange(isAllSelected ? [] : [...ALL_DAYS]);
      } else if (preset === 'weekdays') {
        onDaysChange(isWeekdaysSelected ? [] : [...WEEKDAYS]);
      } else {
        onDaysChange(isWeekendSelected ? [] : [...WEEKEND]);
      }
    },
    [isAllSelected, isWeekdaysSelected, isWeekendSelected, onDaysChange]
  );

  return (
    <div className="space-y-3">
      {/* Time row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              startTimeError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {startTimeError && <p className="text-xs text-red-500 mt-1">{startTimeError}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              endTimeError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {endTimeError && <p className="text-xs text-red-500 mt-1">{endTimeError}</p>}
        </div>
      </div>

      {/* Days */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Available Days</label>

        {/* Preset chips */}
        <div className="flex gap-2 mb-2">
          {(
            [
              { key: 'all', label: 'All Days', active: isAllSelected },
              { key: 'weekdays', label: 'Weekdays', active: isWeekdaysSelected },
              { key: 'weekend', label: 'Weekend', active: isWeekendSelected },
            ] as const
          ).map(({ key, label, active }) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400 hover:text-brand-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Individual day toggles */}
        <div className="flex gap-1.5 flex-wrap">
          {ALL_DAYS.map((day) => {
            const selected = days.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-colors ${
                  selected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-400 hover:text-brand-600'
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>

        {daysError && <p className="text-xs text-red-500 mt-1">{daysError}</p>}

        {days.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {days.map((d) => DAY_LABELS[d]).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
