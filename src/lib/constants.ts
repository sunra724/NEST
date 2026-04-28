export const NEST_COLORS = {
  N: { primary: '#3B82F6', light: '#DBEAFE', label: '마음충전소' },
  E: { primary: '#10B981', light: '#D1FAE5', label: '캠퍼스타운 챌린지' },
  S: { primary: '#F59E0B', light: '#FEF3C7', label: '둥지 시드머니' },
  T: { primary: '#EF4444', light: '#FEE2E2', label: '안심전월세 지킴이' },
  common: { bg: '#F8FAFC', text: '#1E293B', accent: '#6366F1' },
} as const;

export const PROGRAM_IDS = ['N', 'E', 'S', 'T'] as const;
export type ProgramId = (typeof PROGRAM_IDS)[number];
