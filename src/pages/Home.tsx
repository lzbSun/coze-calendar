import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '@/components/Calendar/Calendar';
import FloatingButton from '@/components/Calendar/FloatingButton';
import EventFormDialog from '@/components/Calendar/EventFormDialog';
import { useCalendar } from '@/contexts/CalendarContext';

export default function Home() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { events, calendarData, addEvent, updateEvent, deleteEvent } = useCalendar();
  const navigate = useNavigate();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedFormDate, setSelectedFormDate] = useState(new Date());

  const handleAddEvent = () => {
    setSelectedFormDate(selectedDate || currentDate);
    setIsFormDialogOpen(true);
  };

  const handleEventClick = (id: string) => {
    navigate(`/event/${id}`);
  };

  return (
    <div className="relative h-screen bg-[#FFF9FB] overflow-hidden">
      <Calendar 
        view={view}
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDateChange={setCurrentDate}
        onSelectDate={setSelectedDate}
        onViewChange={setView}
        calendarData={calendarData}
        events={events}
        onEventClick={handleEventClick}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        navigate={navigate}
      />
      <EventFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        date={selectedFormDate}
        onSubmit={addEvent}
      />
    </div>
  );
}