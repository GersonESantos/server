import { FastifyInstance } from "fastify";
import { z } from 'zod';
export async function routes(app: FastifyInstance) {
  app.get('/health', {
    schema: {
      summary: 'Health Check',
      description: 'Verifica se o servidor está funcionando corretamente',
      tags: ['Health'],
      response: {
        200: z.object({
          status: z.string(),
          timestamp: z.string(),
          uptime: z.number(),
          environment: z.string(),
          version: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

     
})};

