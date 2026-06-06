const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle validation errors with more detail
    if (err.details && Array.isArray(err.details)) {
        statusCode = 400;
        message = err.details.map(d => d.message).join(', ');
    }

    // Log the error for development
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[Error] ${err.stack}`);
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = { errorHandler, notFound };
