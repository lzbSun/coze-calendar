import { CalendarEvent } from '@/types/calendar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useCalendar } from '@/contexts/CalendarContext';
import { useRef, useEffect, useState } from 'react';

interface EventListProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  onEventClick: (id: string) => void;
}

export default function EventList({
  isOpen,
  onClose,
  events,
  onEventClick,
}: EventListProps) {
  const { deleteEvent } = useCalendar();
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const handleDelete = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除"${event.title}"吗？`)) {
      deleteEvent(event.id);
      toast.success('事件已删除');
    }
  };

  const toggleExpand = (eventId: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // 移除手动DOM操作，让React处理清理
    };
  }, []);

  const getEventColor = (type: string) => {
    switch(type) {
      case 'work': return 'bg-[#B88EC8]';
      case 'life': return 'bg-[#90E8C1]';
      case 'family': return 'bg-[#FFB6C1]';
      default: return 'bg-[#FDEE89]';
    }
  };

  return isOpen ? (
    <motion.div
      ref={listRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-x-0 bottom-0 bg-white p-4 rounded-t-2xl shadow-lg max-h-[70vh] overflow-y-auto"
    >
      {events.map((event) => (
        <div 
          key={event.id}
          className="group p-3 rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 cursor-pointer"
          onClick={() => onEventClick(event.id)}
        >
          <div className="flex items-start">
            <div className={`w-3 h-3 rounded-full mt-1 mr-2 ${getEventColor(event.type)}`} />
            <div className="flex-1">
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-gray-500 mb-1">
                {event.startTime} - {event.endTime}
              </div>
              {expandedEvents[event.id] && event.description && (
                <div className="text-sm text-gray-600 mb-2">
                  {event.description}
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(event.id);
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                {expandedEvents[event.id] ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   handleDelete(event, e);
                 }}
                 className="p-1 text-gray-500 hover:text-[#FFD1DC]"
               >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  ) : null;
}