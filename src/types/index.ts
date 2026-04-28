export interface ProgramSummary {
  id: string;
  name: string;
  tagline: string;
  budget: number;
  budgetRatio: number;
  target: string;
  scale: string;
  period: string;
}

export interface OverviewData {
  projectName: string;
  subtitle: string;
  organization: string;
  operator: string;
  supervisor: string;
  period: { start: string; end: string };
  totalBudget: number;
  totalBeneficiaries: number;
  nestMeaning: Record<string, { en: string; ko: string }>;
  programs: ProgramSummary[];
  lastUpdated: string;
}

export interface KpiItem {
  id: string;
  label: string;
  target: number;
  current: number;
  unit: string;
}

export interface KpiData {
  programs: Record<string, { name: string; kpis: KpiItem[] }>;
  common: { kpis: KpiItem[] };
  aggregate: Record<string, { target: number; current: number; unit?: string }>;
}

export interface BudgetProgram {
  id: string;
  name: string;
  budget: number;
  spent: number;
  direct: number;
  indirect: number;
  labor: number;
}

export interface BudgetData {
  totalBudget: number;
  byCategory: Record<string, { budget: number; spent: number; ratio: number }>;
  byProgram: BudgetProgram[];
  directCostDetail: Record<string, { budget: number; spent: number; label: string }>;
  monthlyExecution: { month: string; planned: number; actual: number }[];
  laborDetail: {
    total: number;
    pmSalary: number;
    managerSalary: number;
    overhead: number;
    staff: { name: string; title: string; program: string; role: string; rate?: string }[];
  };
  lastUpdated: string;
}

export type TaskStatus = 'completed' | 'in_progress' | 'pending';

export interface TimelineTask {
  name: string;
  months: number[];
  status: TaskStatus;
}

export interface TimelineCategory {
  id: string;
  label: string;
  color: string;
  tasks: TimelineTask[];
}

export interface TimelineData {
  categories: TimelineCategory[];
}

export interface ProgramDetailData {
  id: string;
  name: string;
  purpose: string;
  cohorts?: { label: string; period: string; capacity: number; status: string }[];
  tracks?: Record<string, { label: string; teams: number; budgetPerTeam: number; period: string; focus: string }>;
  stages?: { name: string; duration: string; activities?: string[] }[];
  kpis?: KpiItem[];
  budget?: number;
  partners?: string[];
  connections?: { target: string; desc: string }[];
  participants: ProgramParticipant[];
  participantSummary?: {
    total: number;
    byCohort: { label: string; count: number }[];
  };
  [key: string]: unknown;
}

export interface ProgramParticipant {
  id: string;
  name: string;
  contact?: string;
  cohort?: string;
  joinedAt?: string;
  note?: string;
  registeredAt: string;
  [key: string]: unknown;
}
