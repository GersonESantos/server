# Express Router com TypeScript - Guia Completo

## 🎯 O que é Express Router?

O Express Router é uma funcionalidade do Express.js que permite criar **rotas modulares** e organizadas. É como criar "mini-aplicações" que podem ser facilmente reutilizadas e mantidas.

## 🏗️ Estrutura do Projeto

```
src/
├── config/
│   └── swagger.ts          # Configuração do Swagger
├── routes/
│   ├── index.ts           # Agregador de todas as rotas
│   ├── userRoutes.ts      # Rotas dos usuários
│   └── taskRoutes.ts      # Rotas das tarefas
├── server.ts              # Servidor original (monolítico)
└── server-with-router.ts  # Servidor usando Router
```

## ✨ Vantagens do Express Router

### 1. **Organização**
```typescript
// ❌ Sem Router (tudo no server.ts)
app.get('/users', getUsersHandler);
app.post('/users', createUserHandler);
app.get('/tasks', getTasksHandler);
app.post('/tasks', createTaskHandler);
// ... centenas de rotas misturadas

// ✅ Com Router (organizado)
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
```

### 2. **Reutilização**
```typescript
// Pode usar o mesmo router em diferentes aplicações
const userRoutes = require('./routes/userRoutes');

// App 1
app1.use('/api/users', userRoutes);

// App 2
app2.use('/v1/users', userRoutes);
```

### 3. **Middleware Específico**
```typescript
// Middleware só para rotas de usuários
userRouter.use(authenticateUser);
userRouter.use(validateUserPermissions);

// Middleware só para rotas de admin
adminRouter.use(requireAdminRole);
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd c:\Repo2024\server\express\01
npm install
```

### 2. Executar Servidor Original
```bash
npm run dev
```
- URL: http://localhost:3334
- Swagger: http://localhost:3334/docs

### 3. Executar Servidor com Router
```bash
# Compilar TypeScript
npx tsc src/server-with-router.ts --outDir dist --target ES2022 --module ES2022 --moduleResolution node

# Executar
node dist/server-with-router.js
```

## 📚 Estrutura das Rotas

### Base URL: `/api`

#### Usuários: `/api/users`
- `GET /api/users` - Listar todos
- `GET /api/users/:id` - Buscar por ID
- `POST /api/users` - Criar novo
- `PATCH /api/users/:id` - Atualizar parcial
- `DELETE /api/users/:id` - Remover

#### Tarefas: `/api/tasks`
- `GET /api/tasks` - Listar todas
- `GET /api/tasks/:id` - Buscar por ID
- `POST /api/tasks` - Criar nova
- `PATCH /api/tasks/:id` - Atualizar parcial
- `DELETE /api/tasks/:id` - Remover

## 🔧 Como Funciona o Router

### 1. **Criando um Router**
```typescript
import { Router } from 'express';

const userRouter = Router();

// Definir rotas
userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);

export default userRouter;
```

### 2. **Agregando Routers**
```typescript
// routes/index.ts
import { Router } from 'express';
import userRoutes from './userRoutes';
import taskRoutes from './taskRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;
```

### 3. **Usando no Server Principal**
```typescript
// server.ts
import apiRoutes from './routes/index';

// Prefixo /api para todas as rotas
app.use('/api', apiRoutes);
```

## 📝 Exemplos de Uso

### Testando com cURL

```bash
# Criar usuário
curl -X POST http://localhost:3334/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@email.com", "age": 30}'

# Listar usuários
curl http://localhost:3334/api/users

# Criar tarefa
curl -X POST http://localhost:3334/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar Router", "description": "Aprender Express Router", "userId": 1}'

# Listar tarefas
curl http://localhost:3334/api/tasks
```

### Testando com JavaScript (Frontend)

```javascript
// Criar usuário
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Maria Silva',
    email: 'maria@email.com',
    age: 25
  })
});

const user = await response.json();
console.log('Usuário criado:', user);

// Buscar tarefas
const tasks = await fetch('/api/tasks').then(r => r.json());
console.log('Tarefas:', tasks);
```

## 🎨 Middleware nos Routers

### Middleware Global (para todas as rotas)
```typescript
// server.ts
app.use(express.json());
app.use(cors());
app.use(helmet());
```

### Middleware Específico do Router
```typescript
// userRoutes.ts
userRouter.use((req, res, next) => {
  console.log('Middleware específico de usuários');
  next();
});

// Middleware só para uma rota
userRouter.get('/:id', authenticateUser, getUserById);
```

### Middleware de Validação
```typescript
// Middleware para validar dados com Zod
const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Dados inválidos' });
    }
  };
};

// Usar na rota
userRouter.post('/', validateBody(userSchema), createUser);
```

## 🔍 Swagger Automático

O Swagger documenta automaticamente todas as rotas definidas nos routers:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
userRouter.get('/', getAllUsers);
```

## 💡 Dicas Avançadas

### 1. **Router Aninhado**
```typescript
const apiV1 = Router();
const apiV2 = Router();

apiV1.use('/users', userRoutesV1);
apiV2.use('/users', userRoutesV2);

app.use('/api/v1', apiV1);
app.use('/api/v2', apiV2);
```

### 2. **Parâmetros de Router**
```typescript
// Middleware para parâmetros
userRouter.param('id', (req, res, next, id) => {
  // Validar se ID é válido
  if (!Number.isInteger(+id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }
  next();
});
```

### 3. **Router com Prefixo Dinâmico**
```typescript
const createTenantRouter = (tenantId: string) => {
  const router = Router();
  
  router.use((req, res, next) => {
    req.tenantId = tenantId;
    next();
  });
  
  return router;
};

app.use('/tenant/:id', createTenantRouter);
```

## 🎯 Comparação: Antes vs Depois

### ❌ Antes (sem Router)
```typescript
// server.ts - 500+ linhas
app.get('/users', getAllUsers);
app.post('/users', createUser);
app.patch('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
app.get('/tasks', getAllTasks);
app.post('/tasks', createTask);
// ... centenas de rotas misturadas
```

### ✅ Depois (com Router)
```typescript
// server.ts - 50 linhas
app.use('/api', apiRoutes);

// routes/index.ts - 10 linhas
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

// routes/userRoutes.ts - foco só nos usuários
// routes/taskRoutes.ts - foco só nas tarefas
```

## 🏆 Benefícios Finais

1. **📦 Modularidade** - Cada recurso em seu próprio arquivo
2. **🔧 Manutenibilidade** - Fácil de encontrar e modificar código
3. **🔄 Reutilização** - Routers podem ser usados em múltiplas aplicações
4. **🧪 Testabilidade** - Cada router pode ser testado independentemente
5. **👥 Trabalho em Equipe** - Diferentes devs podem trabalhar em routers diferentes
6. **📈 Escalabilidade** - Adicionar novos recursos sem bagunçar o código existente

## 🎉 Conclusão

O Express Router transforma seu código de uma "grande bagunça" em uma **arquitetura organizada e profissional**. É uma das melhores práticas para desenvolvimento com Express.js!

---

**Acesse a documentação completa em:** http://localhost:3334/docs
