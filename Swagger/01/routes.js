const express = require('express');
const router = express.Router();

// Rota principal
router.get('/', (req, res) => {
  res.json({
    message: 'API funcionando com Router!',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// Rota de exemplo
router.get('/info', (req, res) => {
  res.json({
    api: 'Express API',
    router: 'Express Router',
    status: 'funcionando'
  });
});

module.exports = router;
