import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { Popover } from '@headlessui/react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { today } from '@/mock/calendar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';


interface MonthViewProps {
  currentDate: Date
  onDateClick: (date: Date) => void
  onDateDoubleClick: (date: Date) => void
  onMouseDown: (date: Date) => void
  onMouseEnter: (date: Date) => void
  onMouseUp: () => void
  rangeStart: Date | null
  rangeEnd: Date | null
  calendarData: {
    date: string
    hasEvent: boolean
    eventType?: 'work' | 'life' | 'family'
  }[]
  setSelectedFormDate: (date: Date) => void
}

export default function MonthView({
  currentDate,
  onDateClick,
  onDateDoubleClick,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  rangeStart,
  rangeEnd,
  calendarData,
setSelectedFormDate
}: MonthViewProps) {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // 计算包含前后月份补充日期的完整日期范围
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });


  const getEventsForDate = (date: Date) => {
    return calendarData?.filter(item => isSameDay(new Date(item.date), date)) || [];
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };


  return (
    <div className="grid grid-cols-7 gap-1 p-4">
      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
        <div key={day} className="text-center font-medium text-gray-500 py-2">
          {day}
        </div>
      ))}
      
       {daysInMonth.map((day, i) => {
        const dayEvents = getEventsForDate(day);
        const hasEvents = dayEvents.some(day => day.events?.length > 0);
        const eventType = dayEvents[0]?.events?.[0]?.type;
        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
        const isCurrentMonth = isSameMonth(day, currentDate);
        
        return (
             <div
               key={i}
               onClick={() => {
                 onDateClick(day);
                 setSelectedFormDate(day);
               }}
               onDoubleClick={() => onDateDoubleClick(day)}
              onMouseDown={() => onMouseDown(day)}
              onMouseEnter={() => onMouseEnter(day)}
              onMouseUp={onMouseUp}
               className={cn(
                 'h-24 p-1 border rounded-lg flex flex-col',
                 isCurrentMonth ? 
                   isToday(day) ? 'bg-[#FFD1DC] border-[#FFD1DC] hover:bg-[#FFD1DC]/90' : 'bg-white border-gray-100' 
                   : 'bg-gray-50 border-gray-100 text-gray-400',

                 rangeStart && rangeEnd && 
                   day >= (rangeStart < rangeEnd ? rangeStart : rangeEnd) && 
                   day <= (rangeStart < rangeEnd ? rangeEnd : rangeStart) ? 
                   'bg-[#FFD1DC]/30 border-[#FFD1DC]' : '',
                 'hover:bg-gray-50 cursor-pointer transition-colors'
               )}
          >
            <div className="flex justify-between items-start">
             <span className={cn(
               'text-sm font-medium',
               isPast ? 'text-gray-500' : isSameDay(day, today) ? 'text-gray-800' : 'text-gray-800'
             )}>{format(day, 'd')}</span>
              {hasEvents && (
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isPast ? 'bg-red-400' : 
                  eventType === 'work' ? 'bg-[#B88EC8]' :
                  eventType === 'life' ? 'bg-[#90E8C1]' : 'bg-[#FFB6C1]'
                )} />
              )}
            </div>
                  {dayEvents.map(dayData => {
                    const eventsToShow = expandedEvents[dayData.date]
                      ? dayData.events 
                      : dayData.events?.slice(0, 3) || [];
                    
                    return dayData.events?.length > 0 && (
                      <div key={dayData.date} className="mt-1 flex-1 overflow-auto">
                        <div className="max-h-20 overflow-y-auto space-y-1">
                          {eventsToShow.map((event, idx) => (
                            <div
                              key={`${dayData.date}-${idx}`}
                              className={cn(
                                'text-xs p-1 rounded flex items-start w-full',
                                isPast ? 'bg-red-100 text-red-800' :
                                event.type === 'work' ? 'bg-[#B88EC8] text-white' :
                                event.type === 'life' ? 'bg-[#90E8C1] text-white' : 
                                event.type === 'family' ? 'bg-[#FFB6C1] text-white' :
                                'bg-[#FDEE89] text-gray-800'

                              )}
                              onDoubleClick={() => onDateDoubleClick(event)}
                            >
                              <span className="truncate">
                                {event.title}
                              </span>
                            </div>
                          ))}
                        </div>
                        {dayData.events.length > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(dayData.date);
                            }}
                            className={cn(
                              'text-xs w-full text-left mt-1 px-1 py-0.5 rounded',
                              expandedEvents[dayData.date] 
                                ? 'text-gray-500 hover:text-gray-700' 
                                : 'text-[#FFD1DC] hover:text-[#ffb8c9]'
                            )}
                          >
                            {expandedEvents[dayData.date] ? '收起' : `查看全部 (${dayData.events.length})`}
                          </button>
                        )}
                      </div>
                    );
                  })}

          </div>
        );
      })}
    </div>
  );
}