import fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

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

  // Schemas JSON Schema puros
  const usuarioSchema = {
    type: 'object',
    properties: {
      id: { type: 'number' },
      nome: { type: 'string' },
      email: { type: 'string', format: 'email' }
    },
    required: ['id', 'nome', 'email']
  };

  const criarUsuarioSchema = {
    type: 'object',
    properties: {
      nome: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' }
    },
    required: ['nome', 'email']
  };

  const atualizarUsuarioSchema = {
    type: 'object',
    properties: {
      nome: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' }
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' }
    }
  };

  // Dados mockados (simulando banco de dados)
  const usuariosMock = [
    { id: 1, nome: 'João Silva', email: 'joao@teste.com' },
    { id: 2, nome: 'Maria Santos', email: 'maria@teste.com' },
    { id: 3, nome: 'Pedro Oliveira', email: 'pedro@exemplo.com' },
    { id: 4, nome: 'Ana Costa', email: 'ana@exemplo.com' },
    { id: 5, nome: 'Carlos Eduardo', email: 'carlos@teste.com' },
    { id: 6, nome: 'Fernanda Lima', email: 'fernanda@exemplo.com' },
    { id: 7, nome: 'Roberto Alves', email: 'roberto@teste.com' },
    { id: 8, nome: 'Juliana Ferreira', email: 'juliana@exemplo.com' },
    { id: 9, nome: 'Marcos Pereira', email: 'marcos@teste.com' },
    { id: 10, nome: 'Carla Rodrigues', email: 'carla@exemplo.com' }
  ];

  // Função para gerar próximo ID
  const getNextId = () => {
    return usuariosMock.length > 0 ? Math.max(...usuariosMock.map(u => u.id)) + 1 : 1;
  };

  // ENDPOINTS
  
  // GET /usuarios
  app.get('/usuarios', {
    schema: {
      summary: 'Listar usuários',
      description: 'Retorna lista de todos os usuários',
      tags: ['Usuarios'],
      response: {
        200: {
          type: 'object',
          properties: {
            usuarios: {
              type: 'array',
              items: usuarioSchema
            },
            total: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      usuarios: usuariosMock,
      total: usuariosMock.length
    };
  });

  // POST /usuarios
  app.post('/usuarios', {
    schema: {
      summary: 'Criar usuário',
      description: 'Cria um novo usuário no sistema',
      tags: ['Usuarios'],
      body: criarUsuarioSchema,
      response: {
        201: usuarioSchema,
        400: errorSchema
      }
    }
  }, async (request, reply) => {
    const { nome, email } = request.body as { nome: string; email: string };
    
    // Verificar se email já existe
    const emailExiste = usuariosMock.find(u => u.email === email);
    if (emailExiste) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Email já está em uso'
      });
    }
    
    // Criar novo usuário
    const novoUsuario = {
      id: getNextId(),
      nome,
      email
    };

    // Adicionar à lista (simula inserção no banco)
    usuariosMock.push(novoUsuario);

    return reply.status(201).send(novoUsuario);
  });

  // GET /usuarios/:id
  app.get('/usuarios/:id', {
    schema: {
      summary: 'Buscar usuário por ID',
      description: 'Retorna um usuário específico pelo ID',
      tags: ['Usuarios'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: usuarioSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);
    const usuario = usuariosMock.find(u => u.id === userId);
    
    if (!usuario) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    return usuario;
  });

  // PUT /usuarios/:id
  app.put('/usuarios/:id', {
    schema: {
      summary: 'Atualizar usuário',
      description: 'Atualiza os dados de um usuário existente',
      tags: ['Usuarios'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      body: atualizarUsuarioSchema,
      response: {
        200: usuarioSchema,
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);
    const updates = request.body as { nome?: string; email?: string };
    
    // Encontrar usuário
    const usuarioIndex = usuariosMock.findIndex(u => u.id === userId);
    if (usuarioIndex === -1) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    // Verificar se novo email já existe (se fornecido)
    if (updates.email && updates.email !== usuariosMock[usuarioIndex].email) {
      const emailExiste = usuariosMock.find(u => u.email === updates.email);
      if (emailExiste) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Email já está em uso'
        });
      }
    }
    
    // Atualizar usuário
    const usuarioAtualizado = {
      ...usuariosMock[usuarioIndex],
      ...(updates.nome && { nome: updates.nome }),
      ...(updates.email && { email: updates.email })
    };

    // Salvar alterações
    usuariosMock[usuarioIndex] = usuarioAtualizado;

    return usuarioAtualizado;
  });

  // DELETE /usuarios/:id
  app.delete('/usuarios/:id', {
    schema: {
      summary: 'Deletar usuário',
      description: 'Remove um usuário do sistema',
      tags: ['Usuarios'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', pattern: '^[0-9]+$' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            id: { type: 'number' }
          }
        },
        404: errorSchema
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = parseInt(id);
    
    // Encontrar usuário
    const usuarioIndex = usuariosMock.findIndex(u => u.id === userId);
    if (usuarioIndex === -1) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Usuário com ID ${userId} não encontrado`
      });
    }

    // Remover usuário
    usuariosMock.splice(usuarioIndex, 1);
    
    return {
      message: `Usuário com ID ${userId} foi deletado com sucesso`,
      id: userId
    };
  });

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
