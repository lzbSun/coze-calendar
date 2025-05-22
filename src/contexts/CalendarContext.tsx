import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import ConfettiAnimation from './ConfettiAnimation';
import { CalendarEvent } from '@/types/calendar';
import { generateCalendarData } from '@/mock/calendar';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { parseICSEvent } from '@/lib/utils';

interface CalendarContextType {
  events: CalendarEvent[];
  calendarData: ReturnType<typeof generateCalendarData>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  setEventReminder: (event: CalendarEvent) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarData, setCalendarData] = useState(() => generateCalendarData([]));
  const [timeoutIds, setTimeoutIds] = useState<Record<string, ReturnType<typeof setTimeout>>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化节假日事件
  useEffect(() => {
    if (isInitialized) return;

    const initHolidayEvents = async () => {
      try {
        const response = await fetch('https://www.shuyz.com/githubfiles/china-holiday-calender/master/holidayCal.ics');
        const icsContent = await response.text();
        const parsedEvents = parseICSEvent(icsContent);
        
        // 转换为CalendarEvent格式
        const holidayEvents = parsedEvents.map(event => ({
          id: uuidv4(),
          title: event.title || '节假日',
          date: event.startDate || format(new Date(), 'yyyy-MM-dd'),
          startTime: '00:00',
          endTime: '23:59',
          type: 'holiday',
          description: event.description || '法定节假日',
          isHoliday: true
        }));

        // 添加到事件列表
        setEvents(prevEvents => [...prevEvents, ...holidayEvents]);
        updateCalendarData([...events, ...holidayEvents]);
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化节假日事件失败:', error);
      }
    };

    initHolidayEvents();

    return () => {
      // 清除所有定时器和interval
      Object.values(timeoutIds).forEach(id => {
        if (typeof id === 'number') {
          clearInterval(id);
        } else {
          clearTimeout(id);
        }
      });
    };
  }, [isInitialized]);

  const updateCalendarData = (newEvents: CalendarEvent[]) => {
    setCalendarData(generateCalendarData(newEvents));
  };

  const showNotification = (event: CalendarEvent) => {
    toast(
      <div className="flex flex-col">
        <div className="font-medium">📅 {event.title}</div>
        <div className="text-sm">⏰ {event.startTime}-{event.endTime}</div>
        {event.description && <div className="text-sm">📝 {event.description}</div>}
      </div>,
      {
        duration: 10000,
        position: 'top-center',
        style: {
          backgroundColor: '#FFF9FB',
          border: '1px solid #FFD1DC',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }
    );
  };

  const setEventReminder = (event: CalendarEvent) => {
    if (!event.reminder) return;

    const eventTime = new Date(`${event.date}T${event.startTime}:00`);
    const reminderTime = new Date(eventTime.getTime() - event.reminder * 60 * 1000);
    const now = new Date();

    // 如果提醒时间已过，直接返回
    if (reminderTime <= now) return;

    // 使用setInterval定期检查
    const intervalId = setInterval(() => {
      const currentTime = new Date();
			console.log(currentTime, reminderTime, 'test');
      if (currentTime >= reminderTime) {
        showNotification(event);
        clearInterval(intervalId);
        
        // 清除intervalId记录
        setTimeoutIds(prev => {
          const newIds = { ...prev };
          delete newIds[event.id];
          return newIds;
        });
      }
    }, 1000 * 30); // 每30秒检查一次

    setTimeoutIds(prev => ({
      ...prev,
      [event.id]: intervalId
    }));
  };

  const [showConfetti, setShowConfetti] = useState(false);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents(prev => {
      const newEvents = [...prev, newEvent];
      updateCalendarData(newEvents);
      setEventReminder(newEvent);
      return newEvents;
    });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const updateEvent = (id: string, event: Omit<CalendarEvent, 'id'>) => {
    setEvents(prev => {
      const newEvents = prev.map(e => e.id === id ? { ...event, id } : e);
      updateCalendarData(newEvents);
      setEventReminder({ ...event, id });
      return newEvents;
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== id);
      updateCalendarData(newEvents);
      
      // 清除该事件的定时器或interval
      if (timeoutIds[id]) {
        if (typeof timeoutIds[id] === 'number') {
          clearInterval(timeoutIds[id] as number);
        } else {
          clearTimeout(timeoutIds[id] as ReturnType<typeof setTimeout>);
        }
        const newTimeoutIds = { ...timeoutIds };
        delete newTimeoutIds[id];
        setTimeoutIds(newTimeoutIds);
      }
      
      return newEvents;
    });
  };

  return (
    <CalendarContext.Provider 
      value={{ events, calendarData, addEvent, updateEvent, deleteEvent, setEventReminder }}
    >
      {children}
      {showConfetti && <ConfettiAnimation />}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}