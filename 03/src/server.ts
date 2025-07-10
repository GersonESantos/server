import fastify from 'fastify';
import { z, ZodError } from 'zod';
import { randomUUID } from 'node:crypto';
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

// --- Schemas ---

// Schema de erro genérico, incluindo detalhes de validação opcionais
const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
  issues: z.any().optional(), // Para erros de validação do Zod
});

// Schemas para Health Check
const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string()
});

const statusDetailResponseSchema = z.object({
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
});

// Schemas para Usuários
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});

const createUserBodySchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
});

const updateUserBodySchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
});

const userParamsSchema = z.object({
  id: z.string().uuid({ message: 'ID do usuário inválido.' }),
});

// --- "Banco de Dados" em memória ---
type User = z.infer<typeof userSchema>;

const users: User[] = [];

// --- Rotas ---

// Rota de Health Check
app.get('/health', {
  schema: {
    summary: 'Health Check do servidor',
    description: 'Verifica se o servidor está funcionando corretamente',
    tags: ['Health'],
    response: { 200: healthResponseSchema }
  }
}, async (request, reply) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
    version: '1.0.0'
  };

  return reply.status(200).send(healthData);
});

app.get('/status', {
  schema: {
    summary: 'Status detalhado do servidor',
    description: 'Informações detalhadas sobre o servidor',
    tags: ['Health'],
    response: {
      200: statusDetailResponseSchema
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
    environment: process.env.NODE_ENV ?? 'development',
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
    endpoints: ['/health', '/status', '/users']
  });
});

// --- Rotas de Usuários (CRUD) ---

// Criar usuário (POST)
app.post('/users', {
  schema: {
    summary: 'Cria um novo usuário',
    description: 'Cria um novo usuário com nome e e-mail.',
    tags: ['Users'],
    body: createUserBodySchema,
    response: {
      201: userSchema,
      409: errorResponseSchema,
    }
  }
}, async (request, reply) => {
  const { name, email } = request.body;

  const emailInUse = users.some(user => user.email === email);
  if (emailInUse) {
    return reply.status(409).send({
      statusCode: 409,
      error: 'Conflict',
      message: 'Este e-mail já está em uso.'
    });
  }

  const newUser: User = {
    id: randomUUID(),
    name,
    email,
    createdAt: new Date(),
  };

  users.push(newUser);
  return reply.status(201).send(newUser);
});

// Listar todos os usuários (GET)
app.get('/users', {
  schema: {
    summary: 'Lista todos os usuários',
    description: 'Retorna uma lista com todos os usuários cadastrados.',
    tags: ['Users'],
    response: {
      200: z.array(userSchema),
    }
  }
}, async (request, reply) => {
  return reply.status(200).send(users);
});

// Buscar usuário por ID (GET)
app.get('/users/:id', {
  schema: {
    summary: 'Busca um usuário por ID',
    description: 'Retorna os dados de um usuário específico.',
    tags: ['Users'],
    params: userParamsSchema,
    response: {
      200: userSchema,
      404: errorResponseSchema,
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  const user = users.find(u => u.id === id);

  if (!user) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Usuário não encontrado.'
    });
  }

  return reply.status(200).send(user);
});

// Atualizar usuário (PUT)
app.put('/users/:id', {
  schema: {
    summary: 'Atualiza um usuário',
    description: 'Atualiza os dados (nome e/ou e-mail) de um usuário existente.',
    tags: ['Users'],
    params: userParamsSchema,
    body: updateUserBodySchema,
    response: {
      200: userSchema,
      404: errorResponseSchema,
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Usuário não encontrado.'
    });
  }

  const updatedUser = {
    ...users[userIndex],
    ...request.body,
  };

  users[userIndex] = updatedUser;
  return reply.status(200).send(updatedUser);
});

// Deletar usuário (DELETE)
app.delete('/users/:id', {
  schema: {
    summary: 'Deleta um usuário',
    description: 'Remove um usuário do sistema pelo seu ID.',
    tags: ['Users'],
    params: userParamsSchema,
    response: {
      204: z.null(),
      404: errorResponseSchema,
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Usuário não encontrado.'
    });
  }

  users.splice(userIndex, 1);
  return reply.status(204).send();
});

// --- Tratamento de Erros e Inicialização ---

// Handler para erros
app.setErrorHandler((error, request, reply) => {
  // Trata erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Erro de validação.',
      issues: error.flatten().fieldErrors,
    });
  }

  // Loga o erro para depuração
  app.log.error(error);

  // Resposta genérica para outros erros
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'Ocorreu um erro inesperado no servidor.',
  });
});

// Inicializar servidor
const start = async () => {
  try {
    // --- Registro de Plugins ---
    // É uma boa prática registrar todos os plugins dentro do mesmo escopo assíncrono
    // para garantir a ordem de carregamento e evitar "top-level await".

    // Registrar plugin de CORS
    await app.register(import('@fastify/cors'), {
      origin: ['http://localhost:3000', 'http://localhost:5173'], // Adicione suas origens permitidas
      credentials: true
    });

    // Registrar Swagger
    app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Sample API with Swagger',
          description: 'API de exemplo com documentação Swagger, Fastify e Zod.',
          version: '1.0.0'
        },
        tags: [
          { name: 'Root', description: 'Rotas principais' },
          { name: 'Health', description: 'Rotas de verificação de saúde' },
          { name: 'Users', description: 'Rotas para gerenciamento de usuários' }
        ],
      }
    });

    // Registrar a UI do Swagger
    app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });

    // Iniciar o listener do servidor
    const port = Number(process.env.PORT) || 3333;
    const host = '0.0.0.0'; // Ouve em todas as interfaces de rede
    
    await app.listen({ port, host });
    
    app.log.info(`🚀 Servidor HTTP rodando em http://localhost:${port}`);
    app.log.info(`📚 Documentação Swagger disponível em http://localhost:${port}/docs`);
    
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`🛑 Recebido sinal ${signal}. Fechando servidor...`);
  
  try {
    await app.close();
    app.log.info('✅ Servidor fechado com sucesso');
    process.exit(0);
  } catch (error) {
    app.log.error('❌ Erro ao fechar servidor:', error);
    process.exit(1);
  }
};

// Listeners para sinais de shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar aplicação
start();
