import { NextRequest, NextResponse } from 'next/server';
import { isDashboardDocumentKey, readDocument } from '@/lib/data-store';
import { verifyToken } from '@/lib/auth';
import { sanitizePublicDocument } from '@/lib/public-data';

export const runtime = 'nodejs';

async function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  return (await verifyToken(token)) !== null;
}

export async function GET(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;

  if (!isDashboardDocumentKey(key)) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  try {
    const data = await readDocument(key);
    const responseData = (await isAdminRequest(request)) ? data : sanitizePublicDocument(key, data);
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
}
