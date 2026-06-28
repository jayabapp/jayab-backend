import { NextFunction, Request, Response } from 'express';

export function CorsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV == 'development') return next();
  const origin = req.headers?.origin;
  const ip = req?.ip;

  //for safe remote test
  const xApiKey = req.headers?.['x-api-key'];
  if (xApiKey && xApiKey === process.env.X_API_KEY) return next();

  const allowed = [...new Set((process.env.ALLOWED_CORS_IP || '').split(',').concat('127.0.0.1'))];
  const bypass = [...new Set((process.env.ALLOWED_CORS_ROUTE || '').split(','))];
  const domainBypass = [...new Set((process.env.ALLOWED_CORS_DOMAIN || '').split(','))];

  if (domainBypass.some((domain) => origin?.includes(domain))) return next();
  if (bypass.some((r) => req.path.startsWith(r))) return next();
  if (allowed.includes(ip)) return next();

  return res.status(403).send(`
  <h1>403 Forbidden</h1>
  <p>Access denied. You are not allowed to access this resource.</p>`);
}
