const { z } = require('zod');

const email = z.string()
    .trim()
    .max(254, 'Email must be 254 characters or fewer')
    .email('Enter a valid email address')
    .transform(value => value.toLowerCase());

const password = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer');

const registerBodySchema = z.strictObject({
    username: z.string()
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be 50 characters or fewer'),
    email,
    password
});

const loginBodySchema = z.strictObject({ email, password });
const deleteAccountBodySchema = z.strictObject({ password });

module.exports = { registerBodySchema, loginBodySchema, deleteAccountBodySchema };
