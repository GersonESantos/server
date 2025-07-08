import fastify from 'fastify';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  zodTypeProvider,
} from 'fastify-type-provider-zod';

import { fastifyCors } from '@fastify/cors';

const app = fastify({
  // Adiciona os compiladores de serialização e validação do Zod
  serializerCompiler,
  validatorCompiler,
}).withTypeProvider<zodTypeProvider>();

// Registra o plugin de CORS para permitir requisições de outras origens
app.register(fastifyCors, {
  origin: '*', // Em produção, restrinja para o seu domínio de frontend
});

// Rota de Health Check
app.get('/health', {
  schema: {
    summary: 'Verifica se o servidor está no ar',
    tags: ['Health'],
    response: {
      200: z.object({
        status: z.string(),
      }),
    },
  },
}, async (request, reply) => {
  return reply.status(200).send({ status: 'ok' });
});

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP server running on http://localhost:3333');
});

