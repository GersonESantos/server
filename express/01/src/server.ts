import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gabibi89*',
    database: 'bd_tasks'
});

// Verificar conexão MySQL
connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar com MySQL:', err);
    } else {
        console.log('✅ MySQL conectado com sucesso!');
    }
});

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

// Schemas para MySQL
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string()
});

const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  id_user: z.number(),
  created_at: z.string(),
  updated_at: z.string()
});

const connectionStatusSchema = z.object({
  message: z.string()
});

const usersCountSchema = z.object({
  users: z.number()
});

// Schemas para operações CRUD de usuários
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ser válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email deve ser válido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
});

const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string()
});

const messageResponseSchema = z.object({
  message: z.string(),
  id: z.number().optional()
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
      },
      {
        name: 'Database',
        description: 'Endpoints para operações com banco de dados MySQL'
      },
      {
        name: 'Authentication',
        description: 'Endpoints para autenticação e login'
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
        ErrorResponse: zodToJsonSchema(errorResponseSchema),
        User: zodToJsonSchema(userSchema),
        Task: zodToJsonSchema(taskSchema),
        ConnectionStatus: zodToJsonSchema(connectionStatusSchema),
        UsersCount: zodToJsonSchema(usersCountSchema),
        CreateUser: zodToJsonSchema(createUserSchema),
        UpdateUser: zodToJsonSchema(updateUserSchema),
        UserResponse: zodToJsonSchema(userResponseSchema),
        MessageResponse: zodToJsonSchema(messageResponseSchema)
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
 * /api:
 *   get:
 *     summary: Informações da API
 *     description: Endpoint com informações gerais da API
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RootResponse'
 */
app.get('/api', (req: express.Request, res: express.Response) => {
  const response = {
    message: 'API está funcionando!',
    api: 'Express Server com Swagger',
    version: '1.0.0',
    documentacao: '/docs',
    endpoints: ['/health', '/status', '/usuarios', '/user', '/login', '/docs']
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

// rotas MySQL
// ----------------------------------------
/**
 * @swagger
 * /:
 *   get:
 *     summary: Teste de conexão MySQL
 *     description: Verifica se a conexão com o banco MySQL está funcionando
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Status da conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               enum: ['MySQL connection OK.', 'MySQL connection error.']
 */
app.get("/", (req, res) => {
    connection.query("SELECT COUNT(*) users FROM users", (err, results) => {
        if (err) {
            res.send('MySQL connection error.');
        }
        res.send('MySQL connection OK.');
    })
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Listar todos os usuários
 *     description: Retorna lista completa de usuários do banco de dados
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.get("/user", (req, res) => {
    connection.query("SELECT * FROM users", (err, results) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else {
            res.json(results);
        }
    });
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Criar novo usuário
 *     description: Cria um novo usuário no banco de dados
 *     tags: [Database]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.post("/user", validateBody(createUserSchema), (req, res) => {
    const { name, email, password } = req.body;
    const query = "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
    
    connection.query(query, [name, email, password || null], (err, results: any) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else {
            res.status(201).json({
                message: 'Usuário criado com sucesso',
                id: results.insertId
            });
        }
    });
});

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Atualizar usuário completo
 *     description: Atualiza todos os campos de um usuário (requer todos os campos)
 *     tags: [Database]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CreateUser'
 *               - type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário
 *                 required: [id]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.put("/user", validateBody(createUserSchema.extend({ id: z.number() })), (req, res) => {
    const { id, name, email, password } = req.body;
    const query = "UPDATE users SET name = ?, email = ?, password = ?, updated_at = NOW() WHERE id = ?";
    
    connection.query(query, [name, email, password || null, id], (err, results: any) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else if (results.affectedRows === 0) {
            res.status(404).json({
                message: 'Usuário não encontrado'
            });
        } else {
            res.json({
                message: 'Usuário atualizado com sucesso',
                id: id
            });
        }
    });
});

/**
 * @swagger
 * /user:
 *   patch:
 *     summary: Atualizar usuário parcial
 *     description: Atualiza campos específicos de um usuário (campos opcionais)
 *     tags: [Database]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/UpdateUser'
 *               - type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID do usuário
 *                 required: [id]
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.patch("/user", validateBody(updateUserSchema.extend({ id: z.number() })), (req, res) => {
    const { id, name, email, password } = req.body;
    
    // Construir query dinâmica baseada nos campos fornecidos
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
        updates.push("name = ?");
        values.push(name);
    }
    if (email !== undefined) {
        updates.push("email = ?");
        values.push(email);
    }
    if (password !== undefined) {
        updates.push("password = ?");
        values.push(password);
    }
    
    if (updates.length === 0) {
        res.status(400).json({
            error: 'Validation Error',
            message: 'Pelo menos um campo deve ser fornecido para atualização',
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    updates.push("updated_at = NOW()");
    values.push(id);
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    
    connection.query(query, values, (err, results: any) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else if (results.affectedRows === 0) {
            res.status(404).json({
                message: 'Usuário não encontrado'
            });
        } else {
            res.json({
                message: 'Usuário atualizado com sucesso',
                id: id
            });
        }
    });
});

/**
 * @swagger
 * /user:
 *   delete:
 *     summary: Deletar usuário
 *     description: Remove um usuário do banco de dados
 *     tags: [Database]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID do usuário
 *             required: [id]
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.delete("/user", validateBody(z.object({ id: z.number() })), (req, res) => {
    const { id } = req.body;
    const query = "DELETE FROM users WHERE id = ?";
    
    connection.query(query, [id], (err, results: any) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else if (results.affectedRows === 0) {
            res.status(404).json({
                message: 'Usuário não encontrado'
            });
        } else {
            res.json({
                message: 'Usuário deletado com sucesso',
                id: id
            });
        }
    });
});

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     description: Retorna um usuário específico pelo ID
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.get("/user/:id", (req, res) => {
    connection.query("SELECT * FROM users WHERE id = ?", [req.params.id], (err, results) => {
        if (err) {
            res.send('MySQL connection error.');
        }
        res.json(results);
    })
});

/**
 * @swagger
 * /user/{id}/tasks:
 *   get:
 *     summary: Listar tarefas de um usuário
 *     description: Retorna todas as tarefas associadas a um usuário específico
 *     tags: [Database]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de tarefas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'MySQL connection error.'
 */
app.get("/user/:id/tasks/", (req, res) => {
    connection.query("SELECT * FROM tasks WHERE id_user = ?", [req.params.id], (err, results) => {
        if (err) {
            res.send('MySQL connection error.');
        }
        res.json(results);
    })
});

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Login por email
 *     description: Busca usuário por email para autenticação
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email do usuário
 *         example: 'user@example.com'
 *     responses:
 *       200:
 *         description: Dados do usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Erro de conexão MySQL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'MySQL connection error.'
 */
app.get("/login", (req, res) => {
    const email = req.query.email;
    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            res.status(500).send('MySQL connection error.');
        } else {
            res.json(results);
        }
    });
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
