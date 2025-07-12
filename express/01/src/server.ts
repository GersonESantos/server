import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Criar instância do Express
const app = express();

// Middleware básico
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});
app.use(limiter);

// Schemas Zod
const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  environment: z.string(),
  version: z.string()
});

const statusResponseSchema = z.object({
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

const rootResponseSchema = z.object({
  message: z.string(),
  api: z.string(),
  version: z.string(),
  documentacao: z.string(),
  endpoints: z.array(z.string())
});

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

const usuariosResponseSchema = z.object({
  usuarios: z.array(usuarioSchema),
  total: z.number()
});

const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  timestamp: z.string()
});

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Health Check - Express + Zod',
      description: 'Documentação completa da API de Health Check com validação de schemas usando Zod e TypeScript no Express',
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
        url: 'http://localhost:3334',
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
    ],
    components: {
      schemas: {
        HealthResponse: zodToJsonSchema(healthResponseSchema),
        StatusResponse: zodToJsonSchema(statusResponseSchema),
        RootResponse: zodToJsonSchema(rootResponseSchema),
        Usuario: zodToJsonSchema(usuarioSchema),
        CriarUsuario: zodToJsonSchema(criarUsuarioSchema),
        UsuariosResponse: zodToJsonSchema(usuariosResponseSchema),
        ErrorResponse: zodToJsonSchema(errorResponseSchema)
      }
    }
  },
  apis: ['./src/server.ts']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de validação Zod
const validateBody = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
          timestamp: new Date().toISOString()
        });
        return;
      }
      next(error);
    }
  };
};

// Configurar Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Express + Zod',
  swaggerOptions: {
    docExpansion: 'list',
    deepLinking: false,
    displayRequestDuration: true
  }
}));

// Rota para JSON do Swagger
app.get('/docs.json', (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Rota raiz
 *     description: Endpoint principal da API
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RootResponse'
 */
app.get('/', (req: express.Request, res: express.Response) => {
  const response = {
    message: 'API está funcionando!',
    api: 'Express Server com Swagger',
    version: '1.0.0',
    documentacao: '/docs',
    endpoints: ['/health', '/status', '/usuarios', '/docs']
  };

  // Validar resposta
  const validatedResponse = rootResponseSchema.parse(response);
  res.status(200).json(validatedResponse);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check do servidor
 *     description: Verifica se o servidor está funcionando corretamente
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Status de saúde do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
app.get('/health', (req: express.Request, res: express.Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  // Validar resposta
  const validatedResponse = healthResponseSchema.parse(healthData);
  res.status(200).json(validatedResponse);
});

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Status detalhado do servidor
 *     description: Informações detalhadas sobre o servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Status detalhado do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatusResponse'
 */
app.get('/status', (req: express.Request, res: express.Response) => {
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

  // Validar resposta
  const validatedResponse = statusResponseSchema.parse(statusData);
  res.status(200).json(validatedResponse);
});

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuários
 *     description: Retorna uma lista de usuários cadastrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuariosResponse'
 */
app.get('/usuarios', (req: express.Request, res: express.Response) => {
  // Dados mockados para exemplo
  const usuariosMock = [
    { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', ativo: true },
    { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', ativo: true },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@exemplo.com', ativo: false }
  ];

  const response = {
    usuarios: usuariosMock,
    total: usuariosMock.length
  };

  // Validar resposta
  const validatedResponse = usuariosResponseSchema.parse(response);
  res.status(200).json(validatedResponse);
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     description: Endpoint de exemplo para demonstrar validação com Zod e documentação Swagger
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarUsuario'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/usuarios', validateBody(criarUsuarioSchema), (req: express.Request, res: express.Response) => {
  const { nome, email, ativo = true } = req.body as {
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

  // Validar resposta
  const validatedResponse = usuarioSchema.parse(novoUsuario);
  res.status(201).json(validatedResponse);
});

// Middleware de tratamento de erros
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Algo deu errado no servidor',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Rota ${req.originalUrl} não encontrada`,
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3334;
    const host = process.env.HOST || 'localhost';
    
    app.listen(port, host, () => {
      console.log('🚀 Servidor Express rodando!');
      console.log(`📍 URL: http://${host}:${port}`);
      console.log(`📚 Documentação Swagger: http://${host}:${port}/docs`);
      console.log(`🏥 Health Check: http://${host}:${port}/health`);
      console.log(`📊 Status Detalhado: http://${host}:${port}/status`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Recebido sinal ${signal}. Fechando servidor...`);
  
  try {
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
