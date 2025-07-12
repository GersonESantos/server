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
// Registrar Swagger para documentação da API
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API Health Check - Fastify + Zod',
      description: 'Documentação completa da API de Health Check com validação de schemas usando Zod e TypeScript',
      version: '1.0.0',
      contact: {
        name: 'Desenvolvedor',
        email: 'dev@exemplo.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor de desenvolvimento'
      }
    ],
    tags: [
      {
        name: 'Root',
        description: 'Endpoint principal da aplicação'
      },
      {
        name: 'Health',
        description: 'Endpoints para monitoramento de saúde do servidor'
      },
      {
        name: 'Usuarios',
        description: 'Endpoints para gerenciamento de usuários'
      }
    ]
  }
});

// Registrar Swagger UI
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true
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
        documentacao: z.string(),
        endpoints: z.array(z.string())
      })
    }
  }
}, async (request, reply) => {
  return reply.status(200).send({
    message: 'API está funcionando!',
    api: 'Fastify Server com Swagger',
    version: '1.0.0',
    documentacao: '/docs',
    endpoints: ['/health', '/status', '/usuarios', '/docs']
  });
});

// Schema para exemplo de usuário
const usuarioSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string().email(),
  ativo: z.boolean()
});

const criarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ser válido'),
  ativo: z.boolean().optional().default(true)
});

// Endpoint de exemplo para demonstrar Swagger
app.post('/usuarios', {
  schema: {
    summary: 'Criar novo usuário',
    description: 'Endpoint de exemplo para demonstrar validação com Zod e documentação Swagger',
    tags: ['Usuarios'],
    body: criarUsuarioSchema,
    response: {
      201: usuarioSchema,
      400: z.object({
        error: z.string(),
        message: z.string(),
        timestamp: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { nome, email, ativo = true } = request.body as {
    nome: string;
    email: string;
    ativo?: boolean;
  };
  
  // Simulando criação de usuário
  const novoUsuario = {
    id: Math.floor(Math.random() * 1000),
    nome,
    email,
    ativo
  };

  return reply.status(201).send(novoUsuario);
});

// Endpoint para listar usuários
app.get('/usuarios', {
  schema: {
    summary: 'Listar usuários',
    description: 'Retorna uma lista de usuários cadastrados',
    tags: ['Usuarios'],
    response: {
      200: z.object({
        usuarios: z.array(usuarioSchema),
        total: z.number()
      })
    }
  }
}, async (request, reply) => {
  // Dados mockados para exemplo
  const usuariosMock = [
    { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', ativo: true },
    { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', ativo: true },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@exemplo.com', ativo: false }
  ];

  return reply.status(200).send({
    usuarios: usuariosMock,
    total: usuariosMock.length
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
    console.log(`📚 Documentação Swagger: http://${host}:${port}/docs`);
    console.log(`🏥 Health Check: http://${host}:${port}/health`);
    console.log(`📊 Status Detalhado: http://${host}:${port}/status`);
    
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

