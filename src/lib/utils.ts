import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ICS事件解析器
export function parseICSEvent(icsContent: string) {
  const events = [];
  const lines = icsContent.split('\n');
  let currentEvent = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (trimmedLine.startsWith('END:VEVENT')) {
      if (currentEvent) {
        events.push(currentEvent);
        currentEvent = null;
      }
    } else if (currentEvent) {
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':');
      
      switch (key) {
        case 'SUMMARY':
          currentEvent.title = value;
          break;
        case 'DTSTART;VALUE=DATE':
        case 'DTSTART':
          currentEvent.startDate = parseICSDate(value);
          break;
        case 'DTEND;VALUE=DATE':
        case 'DTEND':
          currentEvent.endDate = parseICSDate(value);
          break;
        case 'DESCRIPTION':
          currentEvent.description = value;
          break;
      }
    }
  }

  return events;
}

function parseICSDate(icsDate: string) {
  try {
    // 处理格式如: 20230601 或 20230601T090000
    const cleanDate = icsDate.split('T')[0];
    const year = cleanDate.substring(0, 4);
    const month = cleanDate.substring(4, 6);
    const day = cleanDate.substring(6, 8);
    
    // 验证日期有效性
    const dateObj = new Date(`${year}-${month}-${day}`);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid ICS date:', icsDate);
      return format(new Date(), 'yyyy-MM-dd');
    }
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing ICS date:', error);
    return format(new Date(), 'yyyy-MM-dd');
  }
}
