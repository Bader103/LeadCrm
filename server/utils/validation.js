const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
    }),
    role: Joi.string().valid('Admin', 'Sales Manager', 'Sales Agent', 'Sales Intern').optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
});

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'Current password is required',
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.empty': 'New password is required',
        'string.min': 'New password must be at least 6 characters',
    }),
});

const leadSchema = Joi.object({
    first_name: Joi.string().required().messages({
        'string.empty': 'First name is required',
    }),
    last_name: Joi.string().required().messages({
        'string.empty': 'Last name is required',
    }),
    email: Joi.string().email().allow('', null).messages({
        'string.email': 'Please provide a valid email',
    }),
    phone: Joi.string().allow('', null),
    company: Joi.string().allow('', null),
    source: Joi.string().optional(),
    status: Joi.string().optional(),
    priority: Joi.string().optional(),
    assigned_to: Joi.number().optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    leadSchema
};
