import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
  userId?: string;
  userRoles?: string[];
}

export function tenantContextMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const tenantHeader = req.headers['x-tenant-id'] as string;
  const defaultTenant = 'tnt_1234567890ab'; // Fallback for local dev testing

  req.tenantId = tenantHeader || defaultTenant;
  req.userId = 'usr_admin_default';
  req.userRoles = ['PROCUREMENT_OFFICER'];

  res.setHeader('X-Tenant-ID', req.tenantId);
  next();
}
