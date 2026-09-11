require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');
const logger = require('./src/utils/logger');
const { createShutdownController, installProcessHandlers } = require('./src/serverLifecycle');

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
    const server = await new Promise((resolve, reject) => {
        const listening = app.listen(PORT, () => resolve(listening));
        listening.once('error', reject);
    });
    logger.info('server.started', { port: Number(PORT) });
    const shutdown = createShutdownController({
        server,
        disconnect: () => mongoose.disconnect()
    });
    installProcessHandlers(shutdown);
    return { server, shutdown };
}

if (require.main === module) {
    startServer().catch(async error => {
        logger.error('server.startup_failed', { errorType: error.name || 'Error' });
        await mongoose.disconnect().catch(() => {});
        process.exitCode = 1;
    });
}

module.exports = { startServer };
