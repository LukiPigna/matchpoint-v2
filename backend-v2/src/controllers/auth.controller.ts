import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import { AppError } from '../utils/AppError.js';

export const authController = {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw AppError.badRequest('refreshToken requerido');
      const result = await authService.refreshToken(refreshToken);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw AppError.badRequest('refreshToken requerido');
      await authService.logout(refreshToken);
      res.json({ success: true, message: 'Sesion cerrada correctamente' });
    } catch (err) { next(err); }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId as string;
      const user = await authService.getMe(userId);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  },
};
