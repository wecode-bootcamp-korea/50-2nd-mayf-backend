const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { createApp } = require('./app');
const { appDataSource } = require('./models/datasource');




const start = async () => {
    const app = createApp();
    const server = http.createServer(app);
    const PORT = process.env.TYPEORM_SERVER_PORT;
        await appDataSource.initialize();
    
    server.listen(PORT, () => {
        console.log(`Listening on Port ${PORT}`);
    });
};

start();