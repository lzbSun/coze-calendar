import { motion } from 'framer-motion';
import { useState } from 'react';
import { isSameDay, parseISO, format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import EventList from './EventList';
import EventFormDialog from './EventFormDialog';
import { CalendarEvent } from '@/types/calendar';
import { toast } from 'sonner';
import { parseICSEvent } from '@/lib/utils';

interface CalendarProps {
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  onSelectDate: (date: Date | null) => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  calendarData: {
    date: string;
    hasEvent: boolean;
    eventType?: 'work' | 'life' | 'family';
  }[];
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdateEvent: (id: string, event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}



export default function Calendar({
  view,
  currentDate,
  selectedDate,
  onDateChange,
  onSelectDate,
  onViewChange,
  calendarData,
  events,
  onEventClick,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}: CalendarProps) {
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedFormDate, setSelectedFormDate] = useState<Date>(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const importHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.shuyz.com/githubfiles/china-holiday-calender/master/holidayCal.ics');
      const icsContent = await response.text();
      const parsedEvents = parseICSEvent(icsContent);
      
      // 过滤6月份事件
      const juneEvents = parsedEvents.filter(event => {
        try {
          if (!event.startDate) return false;
          const eventDate = parseISO(event.startDate);
          return eventDate.getMonth() === 5; // 6月是5 (0-based)
        } catch (error) {
          console.error('Error filtering June events:', error);
          return false;
        }
      });

      // 转换为CalendarEvent格式
      const calendarEvents = juneEvents.map(event => ({
        id: uuidv4(),
        title: event.title || '节假日',
        date: event.startDate || format(new Date(), 'yyyy-MM-dd'),
        startTime: '00:00',
        endTime: '23:59',
        type: 'holiday',
        description: event.description || '法定节假日',
        isHoliday: true
      }));

      // 添加到日历
      if (calendarEvents.length > 0) {
        calendarEvents.forEach(event => onAddEvent(event));
        toast.success(`成功添加 ${calendarEvents.length} 个节假日事件`);
      } else {
        toast.warning('未找到6月份的节假日数据');
      }
    } catch (error) {
      toast.error('导入节假日失败');
      console.error('Error importing holidays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    onSelectDate(date);
    setIsEventListOpen(true);
  };

  const handleMouseDown = (date: Date) => {
    setIsSelectingRange(true);
    setRangeStart(date);
    setRangeEnd(date);
  };

  const handleMouseEnter = (date: Date) => {
    if (isSelectingRange) {
      setRangeEnd(date);
    }
  };

  const handleMouseUp = () => {
    if (isSelectingRange && rangeStart && rangeEnd) {
      if (!isSameDay(rangeStart, rangeEnd)) {
        setSelectedFormDate(rangeStart);
        setIsFormDialogOpen(true);
      }
      setIsSelectingRange(false);
      setRangeStart(null);
      setRangeEnd(null);
    }
  };

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const handleDateDoubleClick = (date: Date) => {
    setSelectedFormDate(date);
    setIsFormDialogOpen(true);
  };

  const handleEventDoubleClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedFormDate(new Date(event.date));
    setIsFormDialogOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('确定要删除这个事件吗？')) {
      onDeleteEvent(id);
      toast.success('事件已删除');
    }
  };

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    onAddEvent(event);
    toast.success('事件添加成功');
  };

  const filteredEvents = selectedDate
    ? events.filter(
        (event) =>
          new Date(event.date).toDateString() === selectedDate.toDateString()
      )
    : [];

  return (
    <div className="h-full flex flex-col">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={onViewChange}
        onDateChange={onDateChange}
      />
      <motion.div
        key={view}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden"
      >
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onDateDoubleClick={handleDateDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseUp={handleMouseUp}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              calendarData={calendarData}
              setSelectedFormDate={setSelectedFormDate}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              onDateClick={handleDateClick}
              calendarData={calendarData}
              onEventClick={onEventClick}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              onDateClick={handleDateClick}
              onDateDoubleClick={handleDateDoubleClick}
              calendarData={calendarData}
            />
          )}
      </motion.div>

      <EventList
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        events={filteredEvents}
        onEventClick={onEventClick}
      />
      <EventFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
          setEditingEvent(null);
        }}
        date={selectedFormDate}
        event={editingEvent}
        onSubmit={editingEvent ? 
          (event) => {
            onUpdateEvent(editingEvent.id, event);
            setEditingEvent(null);
          } : 
          handleAddEvent}
      />
    </div>
  );
}