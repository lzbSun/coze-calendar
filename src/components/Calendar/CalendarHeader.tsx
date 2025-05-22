import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onDateChange: (date: Date) => void;
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onDateChange,
}: CalendarHeaderProps) {
  const handlePrev = () => {
    if (view === 'month') {
      onDateChange(subMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    } else if (view === 'day') {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      onDateChange(addMonths(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    } else if (view === 'day') {
      onDateChange(addDays(currentDate, 1));
    }
  };

  const getHeaderTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'yyyy年M月');
    } else if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'M月d日')} - ${format(end, 'M月d日')}`;
    } else if (view === 'day') {
      return format(currentDate, 'yyyy年MM月dd日');
    }
    return format(currentDate, 'yyyy年M月');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-b-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {getHeaderTitle()}
          </h2>
          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1 rounded-full text-sm bg-[#FFD1DC] text-white hover:bg-[#ffb8c9]"
          >
            今天
          </button>
        </div>

        <div className="flex space-x-2">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1 rounded-full text-sm',
                view === v
                  ? 'bg-[#FFD1DC] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
               {v === 'month' ? '月' : v === 'week' ? '周' : '日'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}