import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gabibi89*',
    database: 'bd_tasks'
});

// Verificar conexão MySQL
connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar com MySQL:', err);
    } else {
        console.log('✅ MySQL conectado com sucesso!');
    }
});

// Exportar a conexão para uso em outros arquivos
export default connection;