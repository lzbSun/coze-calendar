import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface DayViewProps {
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onDateDoubleClick: (event: any) => void;
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

export default function DayView({
  currentDate,
  onDateClick,
  onDateDoubleClick,
  calendarData,
  onEventClick
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = calendarData.filter(item => isSameDay(new Date(item.date), currentDate));
  const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">
          {format(currentDate, 'yyyy年MM月dd日')}
          {isToday(currentDate) && (
            <span className="ml-2 text-sm font-normal text-[#FFD1DC]">今天</span>
          )}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-gray-100 min-h-16">
            <div className="w-16 py-2 text-right pr-2 text-sm text-gray-500">
              {hour}:00
            </div>
            <div className="flex-1 p-2">
                {dayEvents
                  .filter(dayData => dayData.events?.some(event => 
                    event.startTime && parseInt(event.startTime.split(':')[0]) === hour
                  ))
                  .flatMap(dayData => 
                    dayData.events
                      ?.filter(event => parseInt(event.startTime.split(':')[0]) === hour)
                      .map((event, idx) => (
                        <div
                          key={idx}
                         onClick={() => (onEventClick || defaultOnEventClick)(event.id)}
                         onDoubleClick={() => onDateDoubleClick(event)}
                         className={cn(
                            'p-2 rounded-lg mb-2 cursor-pointer',
                             isPast ? 'bg-red-100 text-red-800' :
                             event.type === 'work' ? 'bg-[#B88EC8] text-white' :
                             event.type === 'life' ? 'bg-[#90E8C1] text-white' : 
                             event.type === 'family' ? 'bg-[#FFB6C1] text-white' :
                             'bg-[#FDEE89] text-gray-800'

                           )}
                        >
                          <div className="flex items-start">
                            <input 
                              type="checkbox" 
                              className="mr-2 h-4 w-4 rounded border-gray-300 text-[#FFD1DC] focus:ring-[#FFD1DC] mt-0.5"
                            />
                            <div>
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs">
                                {event.startTime} - {event.endTime}
                              </div>
                              {event.description && (
                                <div className="text-xs mt-1 text-gray-600">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}