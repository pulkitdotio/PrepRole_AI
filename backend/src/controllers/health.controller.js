const mongoose = require('mongoose');

function liveness(req, res) {
    return res.status(200).json({ status: 'ok' });
}

function createReadinessHandler(isDatabaseReady = () => mongoose.connection.readyState === 1) {
    return (req, res) => {
        if (!isDatabaseReady()) {
            return res.status(503).json({
                status: 'not_ready',
                message: 'Service is not ready'
            });
        }
        return res.status(200).json({ status: 'ready' });
    };
}

module.exports = { liveness, createReadinessHandler };
