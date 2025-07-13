import 'dotenv/config';
import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bd_tasks',
    port: Number(process.env.DB_PORT) || 3306
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