import { CalendarClock, MapPin, TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CalendarEventItem, CalendarScheduleData, CalendarScheduleSection } from '@/types';

interface GoogleCalendarScheduleProps {
  schedule: CalendarScheduleData;
}

function formatEventTime(event: CalendarEventItem) {
  if (event.allDay) {
    return '종일';
  }

  const start = new Date(event.start);
  const end = new Date(event.end);
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function EventRow({ event }: { event: CalendarEventItem }) {
  return (
    <li className="rounded-lg border border-slate-200 px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{event.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{formatEventTime(event)}</span>
            {event.location ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            ) : null}
          </div>
        </div>
        {event.htmlLink ? (
          <a href={event.htmlLink} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700">
            열기
          </a>
        ) : null}
      </div>
    </li>
  );
}

function ScheduleColumn({ section }: { section: CalendarScheduleSection }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{section.title}</h3>
          <p className="mt-1 text-xs text-slate-500">{section.helper}</p>
        </div>
        <Badge variant={section.events.length > 0 ? 'info' : 'pending'}>{section.events.length}건</Badge>
      </div>
      {section.events.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">등록된 일정이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {section.events.slice(0, 8).map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </article>
  );
}

export default function GoogleCalendarSchedule({ schedule }: GoogleCalendarScheduleProps) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded bg-[#6366F1]" />
          <h2 className="text-lg font-semibold">실제 운영 일정</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarClock className="h-4 w-4" />
          <span>Google Calendar 일정_NEST 기준</span>
        </div>
      </div>

      {schedule.status !== 'ready' ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{schedule.error ?? 'Google Calendar 일정을 불러오지 못했습니다.'}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {schedule.sections.map((section) => (
          <ScheduleColumn key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}
