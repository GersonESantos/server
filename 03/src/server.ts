import fastify from 'fastify';
import { z } from 'zod';

export async function routes(app: fastify.FastifyInstance) {
  app.get('/user', () => {
    return {
      id: 'user-1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    };
  });
    app.post('/user', {
        schema: {
          body: z.object({
            id: z.string().uuid(),
            name: z.string().min(2).max(100),
            email: z.string().email()
          })
        }
      }, async (request, reply) => {
        const userData = request.body;
        // Save userData to the database or perform other actions
        return reply.status(201).send(userData);
      });}