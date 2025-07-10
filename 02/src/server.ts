import fastify from 'fastify';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

// Criar instância do Fastify com TypeProvider do Zod
const app = fastify({
  logger: true, // Habilita logs
}).withTypeProvider<ZodTypeProvider>();

// Configurar compiladores do Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Registrar plugin de CORS
await app.register(import('@fastify/cors'), {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Adicione suas origens permitidas
  credentials: true
});
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Typed API',
      description: 'API com tipagem estática usando Zod',
      version: '1.0.0'
    }
  }
});
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});
// Schema de resposta para Health Check
const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string()
});

// Rota de Health Check
app.get('/health', {
  schema: {
    summary: 'Health Check do servidor',
    description: 'Verifica se o servidor está funcionando corretamente',
    tags: ['Health'],
    response: {
      200: healthResponseSchema
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

  return reply.status(200).send(healthData);
});

// Rota adicional para status detalhado
app.get('/status', {
  schema: {
    summary: 'Status detalhado do servidor',
    description: 'Informações detalhadas sobre o servidor',
    tags: ['Health'],
    response: {
      200: z.object({
        status: z.string(),
        timestamp: z.string(),
        uptime: z.number(),
        memory: z.object({
          used: z.number(),
          total: z.number(),
          percentage: z.number()
        }),
        cpu: z.object({
          usage: z.number()
        }),
        environment: z.string(),
        version: z.string(),
        nodeVersion: z.string()
      })
    }
  }
}, async (request, reply) => {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  
  const statusData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: usedMemory,
      total: totalMemory,
      percentage: Math.round((usedMemory / totalMemory) * 100)
    },
    cpu: {
      usage: process.cpuUsage().user / 1000000 // Converter para segundos
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    nodeVersion: process.version
  };

  return reply.status(200).send(statusData);
});

// Rota raiz
app.get('/', {
  schema: {
    summary: 'Rota raiz',
    description: 'Endpoint principal da API',
    tags: ['Root'],
    response: {
      200: z.object({
        message: z.string(),
        api: z.string(),
        version: z.string(),
        endpoints: z.array(z.string())
      })
    }
  }
}, async (request, reply) => {
  return reply.status(200).send({
    message: 'API está funcionando!',
    api: 'Fastify Server',
    version: '1.0.0',
    endpoints: ['/health', '/status']
  });
});

// Handler para erros não capturados
app.setErrorHandler((error, request, reply) => {
  app.log.error(error);
  
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Algo deu errado no servidor',
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    const host = process.env.HOST || 'localhost';
    
    await app.listen({ port, host });
    
    console.log('🚀 Servidor HTTP rodando!');
    console.log(`📍 URL: http://${host}:${port}`);
    console.log(`🏥 Health Check: http://${host}:${port}/health`);
    console.log(`📊 Status: http://${host}:${port}/status`);
    
  } catch (error) {
    app.log.error(error);
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Recebido sinal ${signal}. Fechando servidor...`);
  
  try {
    await app.close();
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fechar servidor:', error);
    process.exit(1);
  }
};

// Listeners para sinais de shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar aplicação
start();

