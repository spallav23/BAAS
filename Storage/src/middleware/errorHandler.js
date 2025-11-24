const errorHandler = (err, req, res, next) => {
  // Don't log aborted requests as errors
  if (err.code === 'ECONNABORTED' || err.type === 'request.aborted') {
    if (!res.headersSent) {
      return res.status(499).json({
        error: 'Request aborted',
        message: 'The request was cancelled by the client',
      });
    }
    return;
  }

  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error:', {
    message: err.message,
    code: err.code,
    type: err.type,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      details: 'A record with this information already exists',
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds the maximum allowed size',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

