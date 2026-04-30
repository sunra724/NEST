import { SignJWT, importPKCS8 } from 'jose';
import { getEnvValue } from '@/lib/auth';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function normalizePrivateKey(value: string) {
  let key = value.trim();
  key = key.replace(/^["']?private_key["']?\s*:\s*/i, '');
  key = key.replace(/,\s*$/g, '');
  key = key.replace(/^["']|["']$/g, '');
  key = key.replace(/\\n/g, '\n').trim();

  const begin = key.indexOf('-----BEGIN PRIVATE KEY-----');
  const endMarker = '-----END PRIVATE KEY-----';
  const end = key.indexOf(endMarker);
  if (begin >= 0 && end >= 0) {
    key = key.slice(begin, end + endMarker.length);
  }

  return key;
}

export async function getGoogleServiceAccountAccessToken(scope: string) {
  const email = getEnvValue('GOOGLE_SERVICE_ACCOUNT_EMAIL') ?? getEnvValue('GOOGLE_CLIENT_EMAIL');
  const privateKey = getEnvValue('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') ?? getEnvValue('GOOGLE_PRIVATE_KEY');

  if (!email || !privateKey) return null;

  const key = await importPKCS8(normalizePrivateKey(privateKey), 'RS256');
  const assertion = await new SignJWT({ scope })
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
