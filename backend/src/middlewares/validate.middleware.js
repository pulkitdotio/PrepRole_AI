const { ZodError } = require('zod');
const AppError = require('../utils/appError');

function formatIssues(issues) {
    return issues.map(issue => ({
        field: issue.path.join('.') || 'request',
        message: issue.code === 'unrecognized_keys'
            ? 'Unexpected field provided'
            : issue.message
    }));
}

function validate(schemas) {
    return (req, res, next) => {
        try {
            for (const location of ['body', 'params', 'query']) {
                if (schemas[location]) {
                    const parsed = schemas[location].parse(req[location]);
                    if (location === 'query') {
                        Object.defineProperty(req, 'query', {
                            value: parsed,
                            configurable: true,
                            enumerable: true
                        });
                    } else {
                        req[location] = parsed;
                    }
                }
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new AppError(
                    400,
                    'VALIDATION_ERROR',
                    'Invalid request',
                    formatIssues(error.issues)
                ));
            }
            return next(error);
        }
    };
}

module.exports = { validate, formatIssues };
