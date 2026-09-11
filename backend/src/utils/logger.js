function write(level, event, metadata = {}) {
    const record = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        event,
        ...metadata
    });
    const output = level === 'error' ? console.error : console.log;
    output(record);
}

module.exports = {
    info: (event, metadata) => write('info', event, metadata),
    warn: (event, metadata) => write('warn', event, metadata),
    error: (event, metadata) => write('error', event, metadata)
};
