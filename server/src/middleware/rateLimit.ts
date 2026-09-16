import { Request, Response, NextFunction } from 'express';

const limitMap = new Map<string, { count: number, resetTime: number }>();

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const max = 100;

  let record = limitMap.get(ip);

  if (!record || record.resetTime < now) {
    record = { count: 1, resetTime: now + windowMs };
    limitMap.set(ip, record);
    next();
  } else {
    record.count++;
    if (record.count > max) {
      res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
    } else {
      next();
    }
  }
};
