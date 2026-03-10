import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ─── AppError (controlled errors) ──────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // ─── Zod validation errors ────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Datos invalidos',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // ─── JWT errors ─────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token expirado. Inicia sesion nuevamente.' });
    return;
  }
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Token invalido.' });
    return;
  }

  // ─── Prisma errors ───────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[])?.join(', ') ?? 'campo';
      res.status(409).json({ success: false, message: `Ya existe un registro con ese ${fields}.` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, message: 'Registro no encontrado.' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({ success: false, message: 'Referencia invalida.' });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Error de validacion en la base de datos.' });
    return;
  }

  // ─── Unknown errors ───────────────────────────────────────────────────────────
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  logger.error(`Unhandled error on ${req.method} ${req.path}:`, err);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : message,
  });
};
