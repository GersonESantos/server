const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./Swagger.json');

// Middleware para parsing JSON
app.use(express.json());

// Rota para documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota principal
app.get('/', (req, res) => {
  res.json({
    message: 'API funcionando!',
    documentation: '/api-docs'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});