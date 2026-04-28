import type { DashboardDocumentKey } from '@/lib/data-store';
import type { ProgramDetailData, ProgramParticipant } from '@/types';

interface ParticipantSummary {
  total: number;
  byCohort: { label: string; count: number }[];
}

interface PublicProgramDetailData extends Omit<ProgramDetailData, 'participants'> {
  participantSummary: ParticipantSummary;
  participants: Pick<ProgramParticipant, 'cohort'>[];
}

function summarizeParticipants(participants: ProgramParticipant[]): ParticipantSummary {
  const byCohort = participants.reduce<Record<string, number>>((acc, participant) => {
    const label = participant.cohort?.trim() || '미분류';
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: participants.length,
    byCohort: Object.entries(byCohort).map(([label, count]) => ({ label, count })),
  };
}

function sanitizeProgramDocument(data: ProgramDetailData): PublicProgramDetailData {
  const participants = data.participants ?? [];

  return {
    ...data,
    participantSummary: summarizeParticipants(participants),
    participants: participants.map((participant) => ({
      cohort: participant.cohort,
    })),
  };
}

export function sanitizePublicDocument<T>(key: DashboardDocumentKey, data: T): T {
  if (!key.startsWith('program-')) {
    return data;
  }

  return sanitizeProgramDocument(data as ProgramDetailData) as T;
}
