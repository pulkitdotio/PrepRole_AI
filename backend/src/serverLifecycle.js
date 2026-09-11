const logger = require('./utils/logger');

function closeHttpServer(server) {
    return new Promise((resolve, reject) => {
        if (!server?.listening) return resolve();
        server.close(error => error ? reject(error) : resolve());
        server.closeIdleConnections?.();
    });
}

function runWithin(operation, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => resolve(false), timeoutMs);
        timeout.unref?.();
        Promise.resolve().then(operation).then(
            () => { clearTimeout(timeout); resolve(true); },
            error => { clearTimeout(timeout); reject(error); }
        );
    });
}

function createShutdownController({ server, disconnect, timeoutMs = 10000, exit = process.exit }) {
    let shutdownPromise;
    return function shutdown(reason, exitCode = 0) {
        if (shutdownPromise) return shutdownPromise;
        shutdownPromise = (async () => {
            logger.info('server.shutdown_started', { reason });
            let timedOut = false;
            const phaseTimeout = Math.max(1, Math.floor(timeoutMs / 2));

            try {
                if (!await runWithin(() => closeHttpServer(server), phaseTimeout)) {
                    timedOut = true;
                    server?.closeAllConnections?.();
                }
                if (!await runWithin(disconnect, phaseTimeout)) timedOut = true;
            } catch (error) {
                exitCode = 1;
                logger.error('server.shutdown_failed', { errorType: error.name || 'Error' });
            }

            logger.info('server.shutdown_complete', { timedOut, exitCode });
            exit(exitCode);
        })();
        return shutdownPromise;
    };
}

function installProcessHandlers(shutdown, processObject = process) {
    processObject.once('SIGTERM', () => shutdown('SIGTERM', 0));
    processObject.once('SIGINT', () => shutdown('SIGINT', 0));
    processObject.once('unhandledRejection', () => shutdown('unhandledRejection', 1));
    processObject.once('uncaughtException', () => shutdown('uncaughtException', 1));
}

module.exports = { closeHttpServer, createShutdownController, installProcessHandlers };
