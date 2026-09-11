const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const logger = require('../src/utils/logger');
const User = require('../src/models/user.model');
const InterviewReport = require('../src/models/interviewReport.model');
const RevokedToken = require('../src/models/revokedToken.model');

async function synchronizeIndexes({ models, checkOnly = false }) {
    for (const model of models) {
        logger.info('database.indexes_started', { model: model.modelName, checkOnly });
        const difference = await model.diffIndexes();
        logger.info('database.indexes_diff', {
            model: model.modelName,
            createCount: difference.toCreate.length,
            dropCount: difference.toDrop.length
        });
        if (!checkOnly) await model.syncIndexes();
        logger.info('database.indexes_complete', { model: model.modelName, checkOnly });
    }
}

async function main() {
    require('dotenv').config({ quiet: true });
    const checkOnly = process.argv.includes('--check');
    try {
        await connectDB();
        await synchronizeIndexes({ models: [User, InterviewReport, RevokedToken], checkOnly });
    } catch (error) {
        logger.error('database.indexes_failed', { errorType: error.name || 'Error' });
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
}

if (require.main === module) main();

module.exports = { synchronizeIndexes };
