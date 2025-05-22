import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CalendarEvent } from '@/types/calendar';
import { useCalendar } from '@/contexts/CalendarContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isNew] = useState(id === 'new');
  const { events } = useCalendar();

  useEffect(() => {
    if (!isNew) {
      const foundEvent = events.find(e => e.id === id);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        navigate('/');
        toast.error('事件不存在');
      }
    } else {
      setEvent({
        id: '',
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        type: 'work',
        description: ''
      });
    }
  }, [id, isNew, navigate, events]);

  const { addEvent, updateEvent, setEventReminder } = useCalendar();

  const handleSave = () => {
    if (!event) return;
    
    // 检查提醒时间是否合理
    if (event.reminder) {
      const eventTime = new Date(`${event.date}T${event.startTime}:00`);
      const reminderTime = new Date(eventTime.getTime() - event.reminder * 60 * 1000);
      if (reminderTime < new Date()) {
        toast.error('提醒时间已过，请重新设置');
        return;
      }
    }
    
    try {
      if (isNew) {
        const newEvent = {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          type: event.type,
          description: event.description,
          reminder: event.reminder
        };
        addEvent(newEvent);
        setEventReminder({ ...newEvent, id: '' }); // 设置提醒
      } else {
        updateEvent(event.id, {
          title: event.title,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          type: event.type,
          description: event.description,
          reminder: event.reminder
        });
        setEventReminder(event); // 更新提醒
      }
      toast.success('保存成功');
      navigate('/');
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#FFF9FB] p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-full bg-[#FFD1DC] text-white font-medium"
          >
            保存
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({...event, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                placeholder="输入事件标题"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <div className="relative">
                  <input
                    type="time"
                    value={event.startTime}
                    onChange={(e) => setEvent({...event, startTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                  />
                 
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <div className="relative">
                  <input
                    type="time"
                    value={event.endTime}
                    onChange={(e) => setEvent({...event, endTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent"
                  />
                  
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <div className="flex space-x-3">
                {['work', 'life', 'family'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setEvent({...event, type: type as any})}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${event.type === type ? 
                      type === 'work' ? 'bg-[#9D7BB0] text-white shadow-md' : 
                      type === 'life' ? 'bg-[#7DDFB5] text-white shadow-md' : 
                      'bg-[#FFA8B5] text-white shadow-md' : 
                      'bg-gray-100 text-gray-800 hover:bg-gray-200'} shadow-sm`}
                  >
                    {type === 'work' ? '工作' : type === 'life' ? '生活' : '家庭'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
              <textarea
                value={event.description || ''}
                onChange={(e) => setEvent({...event, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD1DC] focus:border-transparent min-h-[120px]"
                placeholder="输入事件详细描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">提醒</label>
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
          </div>
        </div>
      </div>
    </div>
  );
}