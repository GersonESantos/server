import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { swaggerConfig } from './config/swagger.js';
import apiRoutes from './routes/index.js';

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

// Configuração do Swagger
const swaggerOptions = {
  definition: swaggerConfig,
  apis: ['./src/routes/*.ts'] // Procurar comentários Swagger nos arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Configurar Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Express + Router',
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

// Usar as rotas da API
app.use('/api', apiRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando com Express Router!',
    documentation: '/docs',
    api: '/api'
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
      console.log('🚀 Servidor Express com Router rodando!');
      console.log(`📍 URL: http://${host}:${port}`);
      console.log(`📚 Documentação Swagger: http://${host}:${port}/docs`);
      console.log(`🔗 API Base: http://${host}:${port}/api`);
      console.log(`👤 Usuários: http://${host}:${port}/api/users`);
      console.log(`📋 Tarefas: http://${host}:${port}/api/tasks`);
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
