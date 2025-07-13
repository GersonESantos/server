export const swaggerConfig = {
  openapi: '3.0.0',
  info: {
    title: 'API Express com Router',
    version: '1.0.0',
    description: `
    ## API RESTful usando Express Router e TypeScript
    
    Esta API demonstra como organizar rotas usando Express Router de forma modular.
    
    ### Funcionalidades:
    - 🏗️ Arquitetura modular com Express Router
    - 📝 CRUD completo para usuários e tarefas
    - ✅ Validação com Zod
    - 📚 Documentação automática com Swagger
    - 🔒 Middleware de segurança
    
    ### Como usar:
    1. Todos os endpoints da API estão sob o prefixo \`/api\`
    2. Usuários: \`/api/users\`
    3. Tarefas: \`/api/tasks\`
    `,
    termsOfService: 'http://localhost:3334/terms',
    contact: {
      name: 'API Support',
      url: 'http://localhost:3334/contact',
      email: 'support@api.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3334',
      description: 'Servidor de desenvolvimento'
    },
    {
      url: 'https://api.example.com',
      description: 'Servidor de produção'
    }
  ],
  paths: {},
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único do usuário',
            example: 1
          },
          name: {
            type: 'string',
            description: 'Nome completo do usuário',
            minLength: 2,
            maxLength: 100,
            example: 'João Silva'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email único do usuário',
            example: 'joao@email.com'
          },
          age: {
            type: 'integer',
            minimum: 0,
            maximum: 120,
            description: 'Idade do usuário',
            example: 30
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do usuário',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      Task: {
        type: 'object',
        required: ['title', 'userId'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID único da tarefa',
            example: 1
          },
          title: {
            type: 'string',
            description: 'Título da tarefa',
            minLength: 1,
            maxLength: 200,
            example: 'Estudar Express Router'
          },
          description: {
            type: 'string',
            description: 'Descrição detalhada da tarefa',
            maxLength: 1000,
            example: 'Aprender como organizar rotas usando Express Router'
          },
          completed: {
            type: 'boolean',
            description: 'Status de conclusão da tarefa',
            default: false,
            example: false
          },
          userId: {
            type: 'integer',
            description: 'ID do usuário que criou a tarefa',
            example: 1
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação da tarefa',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data da última atualização',
            example: '2024-01-01T12:00:00.000Z'
          }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Tipo do erro',
            example: 'Bad Request'
          },
          message: {
            type: 'string',
            description: 'Mensagem descritiva do erro',
            example: 'Dados de entrada inválidos'
          },
          details: {
            type: 'object',
            description: 'Detalhes específicos do erro'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp do erro',
            example: '2024-01-01T00:00:00.000Z'
          }
        }
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Operação realizada com sucesso'
          },
          data: {
            type: 'object',
            description: 'Dados retornados pela operação'
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Requisição inválida',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError'
            }
          }
        }
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Erro interno do servidor',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError'
            }
          }
        }
      }
    },
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'ID único do recurso',
        schema: {
          type: 'integer',
          minimum: 1
        },
        example: 1
      }
    }
  },
  tags: [
    {
      name: 'Users',
      description: 'Operações relacionadas aos usuários'
    },
    {
      name: 'Tasks',
      description: 'Operações relacionadas às tarefas'
    }
  ]
};
