const express = require('express');
const app = express();
const port = 3000;

// Define a sample route
app.get('/', (req, res) => {
    res.send('Bem-vindo ao servidor Express!');
});

// Start the server
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});