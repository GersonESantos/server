import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
app.use(express.json());

// --- Configuração do Swagger ---

const swaggerOptions = {
  // Definição da especificação OpenAPI
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Exemplo com Express',
      version: '1.0.0',
      description: 'Documentação de uma API simples criada com Express e documentada com Swagger',
      contact: {
        name: 'Desenvolvedor',
        email: 'dev@exemplo.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    tags: [
      {
        name: 'Usuários',
        description: 'Endpoints para gerenciamento de usuários'
      }
    ]
  },
  // Caminho para os arquivos que contêm as anotações da API
  // Podem ser seus arquivos de rotas
  apis: ['./src/server.js'], 
};

// Gera a especificação do Swagger com base nas opções
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve a documentação do Swagger na rota /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- Rotas da Aplicação ---

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Retorna uma lista de usuários
 *     tags: [Usuários]
 *     description: Endpoint para obter a lista completa de usuários mockados.
 *     responses:
 *       '200':
 *         description: Uma lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: O ID do usuário.
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         description: O nome do usuário.
 *                         example: "João da Silva"
 */
app.get('/usuarios', (req, res) => {
  const usuariosMock = [
    { id: 1, nome: 'João da Silva' },
    { id: 2, nome: 'Maria Oliveira' },
  ];
  res.status(200).json({ usuarios: usuariosMock });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger disponível em http://localhost:${PORT}/docs`);
});
