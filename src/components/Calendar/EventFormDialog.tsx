import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarEvent, CalendarEventSchema } from '@/types/calendar';
import { toast } from 'sonner';
import { z } from 'zod';


interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  event?: CalendarEvent | null;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
}

export default function EventFormDialog({
  isOpen,
  onClose,
  date,
  event: propEvent,
  onSubmit,
}: EventFormDialogProps) {
  const [event, setEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: date && !isNaN(new Date(date).getTime()) ? format(new Date(date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    startTime: '09:00',
    endTime: '10:00',
    type: 'work',
    description: '',
    reminder: undefined
  });

  useEffect(() => {
    if (propEvent) {
      setEvent({
        title: propEvent.title,
        date: propEvent.date,
        startTime: propEvent.startTime,
        endTime: propEvent.endTime,
        type: propEvent.type,
        description: propEvent.description ?? '',
        reminder: propEvent.reminder
      });
    } else {
      resetForm();
    }
  }, [propEvent, isOpen]);

  const resetForm = () => {
    setEvent({
      title: '',
      date: date && !isNaN(new Date(date).getTime()) ? format(new Date(date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      startTime: '09:00',
      endTime: '10:00',
      type: 'work',
      description: '',
      reminder: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedEvent = CalendarEventSchema.parse(event);
			console.log(validatedEvent, 'validatedEvent')
      onSubmit(validatedEvent);
      resetForm();
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(`${err.path.join('.')}: ${err.message}`);
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          as={motion.div}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        >
           <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
               {event.id ? '编辑事件' : '添加新事件'}
               <span className="ml-2 text-sm font-normal text-gray-500">
                 {date && !isNaN(new Date(date).getTime()) ? format(new Date(date), 'yyyy年MM月dd日') : format(new Date(), 'yyyy年MM月dd日')}
               </span>
            </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                标题
              </label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({...event, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                placeholder="输入事件标题"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间
                </label>
                <input
                  type="time"
                  value={event.startTime}
                  onChange={(e) => setEvent({...event, startTime: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间
                </label>
                <input
                  type="time"
                  value={event.endTime}
                  onChange={(e) => setEvent({...event, endTime: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分类
              </label>
              <div className="flex space-x-3">
                {['work', 'life', 'family'].map((type) => (
                   <button
                    key={type}
                    type="button"
                    onClick={() => setEvent({...event, type: type as any})}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${event.type === type ? 
                      type === 'work' ? 'bg-[#9D7BB0] text-white' : 
                      type === 'life' ? 'bg-[#7DDFB5] text-white' : 
                      'bg-[#FFA8B5] text-white' : 
                      'bg-gray-100 text-gray-800'} shadow-sm`}
                  >
                    {type === 'work' ? '工作' : type === 'life' ? '生活' : '家庭'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={event.description}
                onChange={(e) => setEvent({...event, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent min-h-[100px]"
                placeholder="输入事件描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提醒
              </label>
              <div className="flex space-x-4">
                {[5, 15, 30].map((minutes) => (
                  <label key={minutes} className="flex items-center">
                    <input
                      type="radio"
                      name="reminder"
                      checked={event.reminder === minutes}
                      onChange={() => setEvent({...event, reminder: minutes as any})}
                      className="h-4 w-4 text-[#FFD1DC] focus:ring-[#FFD1DC]"
                    />
                    <span className="ml-2 text-gray-700">{minutes}分钟前</span>
                  </label>
                ))}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reminder"
                    checked={!event.reminder}
                    onChange={() => setEvent({...event, reminder: undefined})}
                    className="h-4 w-4 text-[#FFD1DC] focus:ring-[#FFD1DC]"
                  />
                  <span className="ml-2 text-gray-700">不提醒</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#FFD1DC] text-white hover:bg-[#ffb8c9]"
              >
                保存
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}