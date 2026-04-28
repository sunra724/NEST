import type { Metadata } from 'next';
import { EmptyState, ErrorState } from '@/components/dashboard/PageStates';
import TimelineBoard from '@/components/dashboard/TimelineBoard';
import { loadJSON } from '@/lib/data';
import type { TimelineData } from '@/types';

export const metadata: Metadata = {
  title: '추진 일정 | 청년 N.E.S.T.',
};

export const dynamic = 'force-dynamic';

async function getTimelineData() {
  try {
    return await loadJSON<TimelineData>('timeline.json');
  } catch {
    return null;
  }
}

export default async function TimelinePage() {
  const timeline = await getTimelineData();

  if (!timeline) {
    return <ErrorState />;
  }

  if (!timeline.categories.length) {
    return <EmptyState />;
  }

  return <TimelineBoard timeline={timeline} />;
}
