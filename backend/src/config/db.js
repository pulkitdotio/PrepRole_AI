const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: process.env.NODE_ENV !== 'production'
        });

        logger.info('database.connected');
    } catch (error) {
        logger.error('database.connection_failed', { errorType: error.name || 'Error' });
        throw error;
    }
}

module.exports = connectDB;
