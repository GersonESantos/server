import fastify from 'fastify';
import { z } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider
} from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

// Criar instância do Fastify
const app = fastify({
  logger: true
}).withTypeProvider<ZodTypeProvider>();

// Schema do usuário
const usuarioSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string()
});

// Endpoint GET /usuarios
app.get('/usuarios', {
  schema: {
    summary: 'Listar usuários',
    description: 'Retorna lista de usuários',
    tags: ['Usuarios'],
    response: {
      200: z.object({
        usuarios: z.array(usuarioSchema),
        total: z.number()
      })
    }
  }
}, async (request, reply) => {
  const usuarios = [
    { id: 1, nome: 'João', email: 'joao@teste.com' },
    { id: 2, nome: 'Maria', email: 'maria@teste.com' }
  ];

  return reply.send({
    usuarios,
    total: 2
  });
});

// Schema para criar usuário
const criarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ser válido')
});

// Endpoint POST /usuarios
app.post('/usuarios', {
  schema: {
    summary: 'Criar usuário',
    description: 'Cria um novo usuário',
    tags: ['Usuarios'],
    body: criarUsuarioSchema,
    response: {
      201: usuarioSchema,
      400: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { nome, email } = request.body as {
    nome: string;
    email: string;
  };

  // Simular criação de usuário
  const novoUsuario = {
    id: Math.floor(Math.random() * 1000),
    nome,
    email
  };

  return reply.status(201).send(novoUsuario);
});

// Endpoint GET /usuarios/:id
app.get('/usuarios/:id', {
  schema: {
    summary: 'Buscar usuário por ID',
    description: 'Retorna um usuário específico pelo ID',
    tags: ['Usuarios'],
    params: z.object({
      id: z.string().transform(Number)
    }),
    response: {
      200: usuarioSchema,
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: number };
  
  // Dados mockados
  const usuarios = [
    { id: 1, nome: 'João', email: 'joao@teste.com' },
    { id: 2, nome: 'Maria', email: 'maria@teste.com' }
  ];

  const usuario = usuarios.find(u => u.id === id);
  
  if (!usuario) {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Usuário com ID ${id} não encontrado`
    });
  }

  return reply.send(usuario);
});

// Schema para atualizar usuário
const atualizarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email deve ser válido').optional()
});

// Endpoint PUT /usuarios/:id
app.put('/usuarios/:id', {
  schema: {
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário',
    tags: ['Usuarios'],
    params: z.object({
      id: z.string().transform(Number)
    }),
    body: atualizarUsuarioSchema,
    response: {
      200: usuarioSchema,
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: number };
  const updates = request.body as {
    nome?: string;
    email?: string;
  };
  
  // Simular atualização
  const usuarioAtualizado = {
    id,
    nome: updates.nome || 'Nome Atualizado',
    email: updates.email || 'email@atualizado.com'
  };

  return reply.send(usuarioAtualizado);
});

// Endpoint DELETE /usuarios/:id
app.delete('/usuarios/:id', {
  schema: {
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema',
    tags: ['Usuarios'],
    params: z.object({
      id: z.string().transform(Number)
    }),
    response: {
      200: z.object({
        message: z.string(),
        id: z.number()
      }),
      404: z.object({
        error: z.string(),
        message: z.string()
      })
    }
  }
}, async (request, reply) => {
  const { id } = request.params as { id: number };
  
  return reply.send({
    message: `Usuário com ID ${id} foi deletado com sucesso`,
    id
  });
});

// Iniciar servidor
const start = async () => {
  try {
    // Configurar compiladores do Zod
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    // Registrar CORS
    await app.register(import('@fastify/cors'), {
      origin: true
    });

    // Registrar todos os endpoints primeiro
    await app.ready();

    // Registrar Swagger
    await app.register(fastifySwagger, {
      swagger: {
        info: {
          title: 'API Simples',
          description: 'API para gerenciamento de usuários',
          version: '1.0.0'
        },
        host: 'localhost:3333',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          {
            name: 'Usuarios',
            description: 'Endpoints para usuários'
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

    await app.listen({ port: 3333, host: 'localhost' });
    console.log('🚀 Servidor rodando em http://localhost:3333');
    console.log('📚 Swagger em http://localhost:3333/docs');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

start();
