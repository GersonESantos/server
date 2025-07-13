import express from 'express';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';

const router = express.Router();

// Usar os routers específicos
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

// Rota principal da API
router.get('/', (req, res) => {
  res.json({
    message: 'API funcionando com Express Router!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      tasks: '/api/tasks',
      docs: '/docs'
    }
  });
});

export default router;
