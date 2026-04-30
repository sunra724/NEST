import { SignJWT, importPKCS8 } from 'jose';
import { getEnvValue } from '@/lib/auth';
import { recomputeBudgetSpent } from '@/lib/budget-utils';
import type { BudgetData, BudgetDetailApprovalStatus } from '@/types';

const DEFAULT_SPREADSHEET_ID = '1MBs3E6adF_wK5qlr092eB6l7jfLLLItNFMkwrHkzGWg';
const DEFAULT_SHEET_NAME = '대시보드_입력';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const STATUS_LABELS: Record<BudgetDetailApprovalStatus, string> = {
  not_requested: '품의 전',
  requested: '품의 요청',
  approved: '품의 승인',
  paid: '지출완료',
  needs_review: '보완필요',
};

export interface BudgetSheetRow {
  rowNumber: number;
  id: string;
  actualAmountWon?: number;
  approvalStatus?: BudgetDetailApprovalStatus;
  memo?: string;
}

export interface BudgetSheetSkippedRow {
  rowNumber: number;
  id?: string;
  reason: string;
}

export interface BudgetSheetChange {
  id: string;
  programId: string;
  item: string;
  before: {
    actualAmountWon: number;
    approvalStatus: BudgetDetailApprovalStatus;
    memo: string;
  };
  after: {
    actualAmountWon: number;
    approvalStatus: BudgetDetailApprovalStatus;
    memo: string;
  };
}

export interface BudgetSheetPreview {
  spreadsheetId: string;
  sheetName: string;
  totalRows: number;
  changes: BudgetSheetChange[];
  skipped: BudgetSheetSkippedRow[];
}

interface ParsedRows {
  rows: BudgetSheetRow[];
  skipped: BudgetSheetSkippedRow[];
}

export function getBudgetSheetConfig() {
  return {
    spreadsheetId: getEnvValue('BUDGET_SPREADSHEET_ID') ?? DEFAULT_SPREADSHEET_ID,
    sheetName: getEnvValue('BUDGET_SYNC_SHEET_NAME') ?? DEFAULT_SHEET_NAME,
  };
}

export function getBudgetSheetTemplateUrl() {
  const { spreadsheetId, sheetName } = getBudgetSheetConfig();
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0&range=${encodeURIComponent(sheetName)}`;
}

export function getStatusLabel(status: BudgetDetailApprovalStatus) {
  return STATUS_LABELS[status];
}

function normalizeHeader(value: string) {
  return value.replace(/\s+/g, '').trim().toLowerCase();
}

function findColumn(headers: string[], aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeHeader);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeHeader(header)));
}

function parseAmount(value: string) {
  const normalized = value.replace(/[,\s원₩]/g, '').trim();
  if (!normalized) return undefined;
  const number = Number(normalized);
  if (!Number.isFinite(number) || number < 0) return null;
  return number;
}

function normalizeStatus(value: string): BudgetDetailApprovalStatus | null | undefined {
  const normalized = value.replace(/\s+/g, '').trim().toLowerCase();
  if (!normalized) return undefined;

  const byLabel: Record<string, BudgetDetailApprovalStatus> = {
    not_requested: 'not_requested',
    requested: 'requested',
    approved: 'approved',
    paid: 'paid',
    needs_review: 'needs_review',
    품의전: 'not_requested',
    미요청: 'not_requested',
    품의요청: 'requested',
    요청: 'requested',
    품의승인: 'approved',
    승인: 'approved',
    지출완료: 'paid',
    지급완료: 'paid',
    완료: 'paid',
    보완필요: 'needs_review',
    검토필요: 'needs_review',
    확인필요: 'needs_review',
  };

  return byLabel[normalized] ?? null;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

async function getServiceAccountAccessToken() {
  const email = getEnvValue('GOOGLE_SERVICE_ACCOUNT_EMAIL') ?? getEnvValue('GOOGLE_CLIENT_EMAIL');
  const privateKey = getEnvValue('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') ?? getEnvValue('GOOGLE_PRIVATE_KEY');

  if (!email || !privateKey) return null;

  const key = await importPKCS8(privateKey.replace(/\\n/g, '\n'), 'RS256');
  const assertion = await new SignJWT({ scope: GOOGLE_SHEETS_SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(email)
    .setSubject(email)
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error('Google 서비스 계정 인증에 실패했습니다. 환경변수의 이메일과 private key를 확인하세요.');
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Google 서비스 계정 access token을 받을 수 없습니다.');
  }

  return data.access_token;
}

async function fetchSheetValuesWithServiceAccount(spreadsheetId: string, sheetName: string, accessToken: string) {
  const range = `'${sheetName.replace(/'/g, "''")}'!A:Z`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      throw new Error('Google Sheet를 읽을 권한이 없습니다. 시트를 서비스 계정 이메일에 공유했는지 확인하세요.');
    }
    throw new Error('Google Sheets API에서 데이터를 읽지 못했습니다.');
  }

  const data = (await response.json()) as { values?: string[][] };
  return data.values ?? [];
}

async function fetchPublicCsvValues(spreadsheetId: string, sheetName: string) {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Google Sheet를 서버에서 읽을 수 없습니다. 시트를 링크 공개로 바꾸거나 Google 서비스 계정 환경변수를 설정하세요.');
  }

  return parseCsv(await response.text());
}

async function fetchBudgetSheetValues() {
  const { spreadsheetId, sheetName } = getBudgetSheetConfig();
  const accessToken = await getServiceAccountAccessToken();

  if (accessToken) {
    return {
      spreadsheetId,
      sheetName,
      values: await fetchSheetValuesWithServiceAccount(spreadsheetId, sheetName, accessToken),
    };
  }

  return {
    spreadsheetId,
    sheetName,
    values: await fetchPublicCsvValues(spreadsheetId, sheetName),
  };
}

function parseBudgetSheetRows(values: string[][]): ParsedRows {
  if (values.length === 0) {
    return { rows: [], skipped: [{ rowNumber: 1, reason: '시트가 비어 있습니다.' }] };
  }

  const headers = values[0].map((value) => value.trim());
  const idColumn = findColumn(headers, ['id', 'ID', '대시보드ID', '항목ID']);
  const amountColumn = findColumn(headers, ['실집행액', '실지출액', '집행액', '지출액']);
  const statusColumn = findColumn(headers, ['품의상태', '품의 상태', '상태']);
  const memoColumn = findColumn(headers, ['보탬e메모', '보탬e 메모', '메모', '비고']);

  if (idColumn === -1) {
    return { rows: [], skipped: [{ rowNumber: 1, reason: 'id 열을 찾을 수 없습니다.' }] };
  }

  const rows: BudgetSheetRow[] = [];
  const skipped: BudgetSheetSkippedRow[] = [];

  values.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const id = (row[idColumn] ?? '').trim();
    if (!id) return;

    const nextRow: BudgetSheetRow = { rowNumber, id };
    const amountText = amountColumn >= 0 ? (row[amountColumn] ?? '').trim() : '';
    const statusText = statusColumn >= 0 ? (row[statusColumn] ?? '').trim() : '';
    const memoText = memoColumn >= 0 ? (row[memoColumn] ?? '').trim() : '';

    if (amountText) {
      const amount = parseAmount(amountText);
      if (amount === null) {
        skipped.push({ rowNumber, id, reason: `실집행액 형식 오류: ${amountText}` });
        return;
      }
      nextRow.actualAmountWon = amount;
    }

    if (statusText) {
      const status = normalizeStatus(statusText);
      if (status === null) {
        skipped.push({ rowNumber, id, reason: `품의상태 형식 오류: ${statusText}` });
        return;
      }
      nextRow.approvalStatus = status;
    }

    if (memoText) {
      nextRow.memo = memoText;
    }

    rows.push(nextRow);
  });

  return { rows, skipped };
}

export async function readBudgetSheetRows() {
  const { spreadsheetId, sheetName, values } = await fetchBudgetSheetValues();
  const parsed = parseBudgetSheetRows(values);
  return {
    spreadsheetId,
    sheetName,
    totalRows: parsed.rows.length,
    ...parsed,
  };
}

export function previewBudgetSheetChanges(data: BudgetData, rows: BudgetSheetRow[], baseSkipped: BudgetSheetSkippedRow[] = []): BudgetSheetPreview {
  const { spreadsheetId, sheetName } = getBudgetSheetConfig();
  const itemsById = new Map((data.detailItems ?? []).map((item) => [item.id, item]));
  const changes: BudgetSheetChange[] = [];
  const skipped = [...baseSkipped];

  for (const row of rows) {
    const item = itemsById.get(row.id);
    if (!item) {
      skipped.push({ rowNumber: row.rowNumber, id: row.id, reason: '대시보드 예산 항목 id와 일치하지 않습니다.' });
      continue;
    }

    const after = {
      actualAmountWon: row.actualAmountWon ?? item.actualAmountWon,
      approvalStatus: row.approvalStatus ?? item.approvalStatus,
      memo: row.memo ?? item.memo,
    };

    const changed = after.actualAmountWon !== item.actualAmountWon || after.approvalStatus !== item.approvalStatus || after.memo !== item.memo;
    if (!changed) continue;

    changes.push({
      id: row.id,
      programId: item.programId,
      item: item.item,
      before: {
        actualAmountWon: item.actualAmountWon,
        approvalStatus: item.approvalStatus,
        memo: item.memo,
      },
      after,
    });
  }

  return {
    spreadsheetId,
    sheetName,
    totalRows: rows.length,
    changes,
    skipped,
  };
}

export function applyBudgetSheetChanges(data: BudgetData, rows: BudgetSheetRow[], baseSkipped: BudgetSheetSkippedRow[] = []) {
  const preview = previewBudgetSheetChanges(data, rows, baseSkipped);
  const itemsById = new Map((data.detailItems ?? []).map((item) => [item.id, item]));

  for (const change of preview.changes) {
    const item = itemsById.get(change.id);
    if (!item) continue;
    item.actualAmountWon = change.after.actualAmountWon;
    item.approvalStatus = change.after.approvalStatus;
    item.memo = change.after.memo;
  }

  recomputeBudgetSpent(data);
  return preview;
}
