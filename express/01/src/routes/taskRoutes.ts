import express from 'express';
import { z } from 'zod';

// Schemas Zod para validação
const createTaskSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório'),
  id_user: z.number().positive('ID do usuário deve ser um número positivo')
});

const updateTaskSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  status: z.string().min(1, 'Status é obrigatório').optional(),
  id_user: z.number().positive('ID do usuário deve ser um número positivo').optional()
});

// Criar router
const taskRouter = express.Router();

// Middleware de validação
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

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar todas as tarefas
 *     description: Retorna lista completa de tarefas
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   id_user:
 *                     type: integer
 */
taskRouter.get('/', (req, res) => {
  // Dados mockados para exemplo
  const tasks = [
    { id: 1, title: 'Tarefa 1', description: 'Descrição da tarefa 1', status: 'pendente', id_user: 1 },
    { id: 2, title: 'Tarefa 2', description: 'Descrição da tarefa 2', status: 'concluída', id_user: 2 },
    { id: 3, title: 'Tarefa 3', description: 'Descrição da tarefa 3', status: 'em andamento', id_user: 1 }
  ];
  
  res.json(tasks);
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar nova tarefa
 *     description: Cria uma nova tarefa
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 minLength: 1
 *               id_user:
 *                 type: integer
 *                 minimum: 1
 *             required: [title, status, id_user]
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 */
taskRouter.post('/', validateBody(createTaskSchema), (req, res) => {
  const { title, description, status, id_user } = req.body;
  
  // Simular criação da tarefa
  const newTask = {
    message: 'Tarefa criada com sucesso',
    id: Math.floor(Math.random() * 1000)
  };
  
  res.status(201).json(newTask);
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Buscar tarefa por ID
 *     description: Retorna uma tarefa específica
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Dados da tarefa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 id_user:
 *                   type: integer
 */
taskRouter.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  
  // Simular busca da tarefa
  const task = { 
    id: taskId, 
    title: 'Tarefa Exemplo', 
    description: 'Descrição da tarefa', 
    status: 'pendente', 
    id_user: 1 
  };
  
  res.json(task);
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Atualizar tarefa
 *     description: Atualiza campos específicos de uma tarefa
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 minLength: 1
 *               id_user:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 */
taskRouter.patch('/:id', validateBody(updateTaskSchema), (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, status, id_user } = req.body;
  
  res.json({
    message: 'Tarefa atualizada com sucesso',
    id: taskId
  });
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Deletar tarefa
 *     description: Remove uma tarefa
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 id:
 *                   type: integer
 */
taskRouter.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  
  res.json({
    message: 'Tarefa deletada com sucesso',
    id: taskId
  });
});

export default taskRouter;
