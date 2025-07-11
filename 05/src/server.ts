import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import usuariosRoutes from './routes.js';

// Inicializar servidor
const start = async () => {
  // Criar instância do Fastify
  const app = fastify({
    logger: true
  });

  // Registrar CORS
  await app.register(import('@fastify/cors'), {
    origin: true
  });

  // Registrar Swagger
  await app.register(fastifySwagger, {
    swagger: {
      info: {
        title: 'API de Usuários',
        description: 'API para gerenciamento de usuários com CRUD completo',
        version: '1.0.0'
      },
      host: 'localhost:3333',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        {
          name: 'Usuarios',
          description: 'Endpoints para gerenciamento de usuários'
        }
      ]
    }
  });

  // Registrar Swagger UI
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: true
    }
  });

  // Registrar rotas de usuários
  await app.register(usuariosRoutes);

  try {
    await app.listen({ port: 3333, host: 'localhost' });
    console.log('🚀 Servidor rodando em http://localhost:3333');
    console.log('📚 Swagger em http://localhost:3333/docs');
    console.log('📄 JSON em http://localhost:3333/docs/json');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

start();
