import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Popover } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface WeekViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onDateDoubleClick: (date: Date) => void;
  calendarData: {
    date: string;
    hasEvent: boolean;
    eventType?: 'work' | 'life' | 'family';
    events?: Array<{
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      type: 'work' | 'life' | 'family';
      description?: string;
    }>;
  }[];
  onEventClick?: (id: string) => void;
}

const defaultOnEventClick = (id: string) => {
  console.log('Event clicked:', id);
};

export default function WeekView({
  currentDate,
  onDateClick,
  onDateDoubleClick,
  calendarData,
  onEventClick
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForDate = (date: Date) => {
    return calendarData.filter(item => isSameDay(new Date(item.date), date));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 gap-1 p-2">
        {daysInWeek.map((day, i) => (
          <div key={i} className="text-center font-medium text-gray-500 py-2">
             {['日', '一', '二', '三', '四', '五', '六'][day.getDay()]}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto p-2">
        {daysInWeek.map((day, i) => {
          const dayEvents = getEventsForDate(day);
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className={cn(
                'border rounded-lg p-2 flex flex-col',
                isToday(day) ? 'bg-[#FFD1DC]/20 border-[#FFD1DC]' : 'bg-white border-gray-100',
                'hover:bg-gray-50 cursor-pointer transition-colors'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn(
                  'text-sm font-medium',
                  isPast ? 'text-gray-500' : isToday(day) ? 'text-[#FFD1DC]' : 'text-gray-800'
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              
               <div className="space-y-1 overflow-y-auto">
                  {dayEvents && dayEvents.map((dayData, idx) => (
                   dayData.events?.map((event, eventIdx) => (
                     <div
                       key={`${idx}-${eventIdx}`}
                       className={cn(
                         'text-xs p-1 rounded flex items-start w-full',
                          isPast ? 'bg-red-100 text-red-800' :
                          event.type === 'work' ? 'bg-[#B88EC8] text-white' :
                          event.type === 'life' ? 'bg-[#90E8C1] text-white' : 
                          event.type === 'family' ? 'bg-[#FFB6C1] text-white' :
                          'bg-[#FDEE89] text-gray-800'

                        )}
                        onClick={() => (onEventClick || defaultOnEventClick)(event.id)}
                       onDoubleClick={() => onDateDoubleClick(event)}
                     >
                       <span className="truncate">{event.title}</span>
                     </div>
                   ))
                 ))}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}