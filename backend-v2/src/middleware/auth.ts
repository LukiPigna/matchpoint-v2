import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/database.js';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  userId: string;
  userRole: Role;
}

interface JwtPayload {
  userId: string;
  role: Role;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Token de autenticacion requerido', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userRole = payload.role;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Role Guards ───────────────────────────────────────────────────────────────────

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!roles.includes(authReq.userRole)) {
      return next(new AppError('No tenes permiso para realizar esta accion', 403));
    }
    next();
  };
};

export const requireOwnerOrAdmin = requireRole(Role.OWNER, Role.ADMIN);
export const requireAdmin = requireRole(Role.ADMIN);

// ─── Ownership Check Helper ─────────────────────────────────────────────────────

export const requireResourceOwner = (
  getOwnerId: (req: Request) => Promise<string | null>
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;

    // Admins bypass ownership checks
    if (authReq.userRole === Role.ADMIN) {
      return next();
    }

    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return next(new AppError('Recurso no encontrado', 404));
    }
    if (ownerId !== authReq.userId) {
      return next(new AppError('No tenes permiso para modificar este recurso', 403));
    }
    next();
  };
};
