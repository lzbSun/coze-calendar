import { format, addDays, subDays, isSameDay } from "date-fns";

export const today = new Date();

// 统一的数据结构
export interface CalendarDayData {
  date: string;
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    type: "work" | "life" | "family";
    description?: string;
    reminder?: number;
  }>;
  hasEvent: boolean;
  eventType?: "work" | "life" | "family";
}

// 生成初始事件数据
const initialEvents = [
  {
    id: "1",
    title: "团队会议",
    date: format(today, "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "11:30",
    type: "work" as const,
    description: "讨论项目进度和下一步计划",
    reminder: 15,
  },
  {
    id: "2",
    title: "团队会议2",
    date: format(today, "yyyy-MM-dd"),
    startTime: "12:00",
    endTime: "12:30",
    type: "work" as const,
    description: "讨论项目进度",
    reminder: 15,
  },
  {
    id: "3",
    title: "午餐会议",
    date: format(today, "yyyy-MM-dd"),
    startTime: "13:00",
    endTime: "14:00",
    type: "work" as const,
    description: "与客户共进午餐",
  },
  {
    id: "4",
    title: "项目评审",
    date: format(today, "yyyy-MM-dd"),
    startTime: "15:00",
    endTime: "16:30",
    type: "work" as const,
    description: "项目阶段性评审",
  },
  {
    id: "5",
    title: "购物",
    date: format(addDays(today, 2), "yyyy-MM-dd"),
    startTime: "15:00",
    endTime: "16:30",
    type: "life" as const,
    description: "购买日用品和食材",
  },
  {
    id: "6",
    title: "家庭聚餐",
    date: format(addDays(today, 4), "yyyy-MM-dd"),
    startTime: "18:00",
    endTime: "20:00",
    type: "family" as const,
    description: "庆祝妈妈生日",
    reminder: 30,
  },
];

// 生成日历数据
export function generateCalendarData(
  events: typeof initialEvents
): CalendarDayData[] {
  const days = [
    { date: today, events: [] },
    { date: addDays(today, 1), events: [] },
    { date: addDays(today, 2), events: [] },
    { date: addDays(today, 3), events: [] },
    { date: addDays(today, 4), events: [] },
    { date: addDays(today, 5), events: [] },
    { date: addDays(today, 6), events: [] },
    { date: subDays(today, 1), events: [] },
    { date: subDays(today, 2), events: [] },
    { date: subDays(today, 3), events: [] },
  ];

  // 将事件分配到对应的日期
  events.forEach((event) => {
    const day = days.find((d) => isSameDay(new Date(event.date), d.date));
    if (day) {
      day.events.push(event);
    } else {
      // 如果没有找到对应的日期，创建一个新的日期数据并添加到days数组中
      const newDay = {
        date: new Date(event.date),
        events: [event],
      };
      days.push(newDay);
    }
  });

  // 转换为最终数据结构
  return days.map((day) => ({
    date: format(day.date, "yyyy-MM-dd"),
    events: day.events,
    hasEvent: day.events.length > 0,
    eventType: day.events[0]?.type,
  }));
}

// 导出的统一数据
export const mockEvents = initialEvents;

export const mockCategories = [
  {
    id: "work",
    name: "工作",
    color: "#B88EC8",
  },
  {
    id: "life",
    name: "生活",
    color: "#90E8C1",
  },
  {
    id: "family",
    name: "家庭",
    color: "#FFB6C1",
  },
];
