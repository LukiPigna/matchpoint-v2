import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  });

if (env.NODE_ENV === 'development') {
  (prisma as PrismaClient & { $on: Function }).$on('query', (e: { query: string; duration: number }) => {
    logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

(prisma as PrismaClient & { $on: Function }).$on('error', (e: { message: string }) => {
  logger.error(`Prisma error: ${e.message}`);
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
