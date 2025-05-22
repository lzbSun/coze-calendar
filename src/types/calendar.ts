import { z } from 'zod';

export const CalendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式不正确'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式不正确'),
  type: z.enum(['work', 'life', 'family', 'holiday']),
  description: z.string().optional(),
  reminder: z.union([z.literal(5), z.literal(15), z.literal(30)]).optional(),
  isHoliday: z.boolean().optional()
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
export type NewCalendarEvent = Omit<CalendarEvent, 'id'>;

// 日历天数据类型
export interface CalendarDayData {
  date: string;
  events: CalendarEvent[];
  hasEvent: boolean;
  eventType?: 'work' | 'life' | 'family' | 'holiday';
}

// ICS事件类型
export interface ICSEvent {
  title: string;
  startDate: string;
  endDate: string;
  description?: string;
}