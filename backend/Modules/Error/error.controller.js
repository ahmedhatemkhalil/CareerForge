export const globalErrorHandler = (err, req, res, next) => {
    console.error("❌ DETECTED ERROR STACK:", err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack    
    });
};
