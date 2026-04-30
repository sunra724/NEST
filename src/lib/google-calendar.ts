import { getEnvValue } from '@/lib/auth';
import { getGoogleServiceAccountAccessToken } from '@/lib/google-service-account';
import type { CalendarEventItem, CalendarScheduleData } from '@/types';

const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
const TIME_ZONE = 'Asia/Seoul';
const DEFAULT_CALENDAR_NAME = '일정_NEST';

interface GoogleCalendarEvent {
  id?: string;
  status?: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
}

interface GoogleCalendarListEntry {
  id?: string;
  summary?: string;
}

function seoulDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function startOfSeoulDate(dateString: string) {
  return new Date(`${dateString}T00:00:00+09:00`);
}

function getWeekEnd(today: string) {
  const start = startOfSeoulDate(today);
  const weekday = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'short',
    })
      .format(start)
      .replace('Sun', '0')
      .replace('Mon', '1')
      .replace('Tue', '2')
      .replace('Wed', '3')
      .replace('Thu', '4')
      .replace('Fri', '5')
      .replace('Sat', '6'),
  );
  const daysUntilNextMonday = weekday === 0 ? 1 : 8 - weekday;
  return addDays(today, daysUntilNextMonday);
}

function dateRangeLabel(start: string, endExclusive: string) {
  const startDate = startOfSeoulDate(start);
  const endDate = startDate.getTime() >= startOfSeoulDate(endExclusive).getTime() ? startDate : startOfSeoulDate(addDays(endExclusive, -1));
  const formatter = new Intl.DateTimeFormat('ko-KR', { timeZone: TIME_ZONE, month: 'numeric', day: 'numeric' });
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function toEventTime(value: string, allDay: boolean) {
  return allDay ? startOfSeoulDate(value).getTime() : new Date(value).getTime();
}

function normalizeEvent(event: GoogleCalendarEvent): CalendarEventItem | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date ?? start;
  if (!start || !end) return null;

  return {
    id: event.id ?? `${start}-${event.summary ?? 'event'}`,
    title: event.summary?.trim() || '제목 없는 일정',
    start,
    end,
    allDay: Boolean(event.start?.date),
    location: event.location ?? '',
    htmlLink: event.htmlLink ?? '',
  };
}

function overlaps(event: CalendarEventItem, startDate: string, endDate: string) {
  const start = startOfSeoulDate(startDate).getTime();
  const end = startOfSeoulDate(endDate).getTime();
  const eventStart = toEventTime(event.start, event.allDay);
  const eventEnd = toEventTime(event.end, event.allDay);
  return eventStart < end && eventEnd > start;
}

function groupEvents(events: CalendarEventItem[], today: string) {
  const tomorrow = addDays(today, 1);
  const weekEnd = getWeekEnd(today);
  const monthEnd = addDays(today, 30);

  const todayEvents = events.filter((event) => overlaps(event, today, tomorrow));
  const weekEvents = events.filter((event) => !todayEvents.includes(event) && overlaps(event, tomorrow, weekEnd));
  const monthEvents = events.filter((event) => !todayEvents.includes(event) && !weekEvents.includes(event) && overlaps(event, weekEnd, monthEnd));

  return [
    {
      id: 'today' as const,
      title: '오늘 일정',
      helper: dateRangeLabel(today, tomorrow),
      events: todayEvents,
    },
    {
      id: 'week' as const,
      title: '이번 주 일정',
      helper: dateRangeLabel(tomorrow, weekEnd),
      events: weekEvents,
    },
    {
      id: 'month' as const,
      title: '앞으로 30일',
      helper: dateRangeLabel(weekEnd, monthEnd),
      events: monthEvents,
    },
  ];
}

async function findCalendarIdByName(accessToken: string) {
  const targetName = getEnvValue('GOOGLE_CALENDAR_NAME') ?? DEFAULT_CALENDAR_NAME;
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return '';
  }

  const data = (await response.json()) as { items?: GoogleCalendarListEntry[] };
  const matched = (data.items ?? []).find((calendar) => calendar.summary === targetName || calendar.id === targetName);
  return matched?.id ?? '';
}

async function fetchCalendarEvents(calendarId: string, today: string, accessToken: string) {
  const timeMin = startOfSeoulDate(today).toISOString();
  const timeMax = startOfSeoulDate(addDays(today, 30)).toISOString();
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    timeZone: TIME_ZONE,
    timeMin,
    timeMax,
    maxResults: '80',
  });

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      throw new Error('Google Calendar를 읽을 권한이 없습니다. 일정_NEST 캘린더를 서비스 계정 이메일에 공유했는지 확인하세요.');
    }
    throw new Error('Google Calendar API에서 일정을 읽지 못했습니다.');
  }

  const data = (await response.json()) as { items?: GoogleCalendarEvent[] };
  return (data.items ?? []).filter((event) => event.status !== 'cancelled').map(normalizeEvent).filter((event): event is CalendarEventItem => Boolean(event));
}

export async function loadNestCalendarSchedule(): Promise<CalendarScheduleData> {
  const configuredCalendarId = getEnvValue('GOOGLE_CALENDAR_ID') ?? getEnvValue('NEST_CALENDAR_ID') ?? '';
  const today = seoulDateString();

  try {
    const accessToken = await getGoogleServiceAccountAccessToken(GOOGLE_CALENDAR_SCOPE);
    if (!accessToken) {
      throw new Error('Google 서비스 계정 환경변수가 설정되지 않았습니다.');
    }

    const calendarId = configuredCalendarId || (await findCalendarIdByName(accessToken));
    if (!calendarId) {
      return {
        status: 'not_configured',
        calendarId,
        loadedAt: new Date().toISOString(),
        sections: groupEvents([], today),
        error: 'GOOGLE_CALENDAR_ID가 없고, 서비스 계정 캘린더 목록에서 일정_NEST를 찾지 못했습니다.',
      };
    }

    const events = await fetchCalendarEvents(calendarId, today, accessToken);
    return {
      status: 'ready',
      calendarId,
      loadedAt: new Date().toISOString(),
      sections: groupEvents(events, today),
    };
  } catch (error) {
    return {
      status: 'error',
      calendarId: configuredCalendarId,
      loadedAt: new Date().toISOString(),
      sections: groupEvents([], today),
      error: error instanceof Error ? error.message : 'Google Calendar 일정을 불러오지 못했습니다.',
    };
  }
}
