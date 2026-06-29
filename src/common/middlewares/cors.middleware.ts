import { NextFunction, Request, Response } from 'express';
import { isIP } from 'net';

// لیست‌های comma-separated داخل env را تمیز می‌کند تا فاصله، مقدار خالی و مقدار تکراری مشکل ایجاد نکند.
const parseEnvList = (value?: string): string[] => {
  return [
    ...new Set(
      (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

// IP را برای مقایسه یکسان‌سازی می‌کند؛ IPv6 bracket شده و IPv4-mapped را هم پوشش می‌دهد.
const normalizeIp = (ip?: string): string => {
  let normalizedIp = (ip || '').trim().toLowerCase();

  if (normalizedIp.startsWith('[') && normalizedIp.endsWith(']')) {
    normalizedIp = normalizedIp.slice(1, -1);
  }

  if (normalizedIp.startsWith('::ffff:') && isIP(normalizedIp.replace('::ffff:', '')) === 4) {
    normalizedIp = normalizedIp.replace('::ffff:', '');
  }

  return normalizedIp;
};

// لیست IPهای env را با همان normalizeIp آماده مقایسه می‌کند؛ IPv4 و IPv6 هر دو پشتیبانی می‌شوند.
const parseIpEnvList = (value?: string): string[] => parseEnvList(value).map(normalizeIp);

const errorHtml = `
  <h1>403 Forbidden</h1>
  <p>Access denied. You are not allowed to access this resource.</p>`;

export function CorsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV == 'development') return next();
  const origin = req.headers?.origin;
  const ip = normalizeIp(req?.ip);

  // IPهای داخل BLOCKED_CORS_IP باید قبل از همه bypassها رد شوند.
  const blocked = parseIpEnvList(process.env.BLOCKED_CORS_IP);
  if (blocked.includes(ip)) {
    return res.status(403).send(errorHtml);
  }

  //for safe remote test
  const xApiKey = req.headers?.['x-api-key'];
  if (xApiKey && xApiKey === process.env.X_API_KEY) return next();

  const allowed = [...new Set(parseIpEnvList(process.env.ALLOWED_CORS_IP).concat('127.0.0.1'))];
  const bypass = parseEnvList(process.env.ALLOWED_CORS_ROUTE);
  const domainBypass = parseEnvList(process.env.ALLOWED_CORS_DOMAIN);

  if (domainBypass.some((domain) => origin?.includes(domain))) return next();
  if (bypass.some((r) => req.path.startsWith(r))) return next();
  if (allowed.includes(ip)) return next();

  return res.status(403).send(errorHtml);
}
