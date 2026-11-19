/**
 * Catches all unmatched routes and responds with a 404 JSON error.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Resource not found with id of ${err.value}`,
    });
  }

  // API provider authentication error (OpenAI, Groq, or other compatible providers)
  if (err.status === 401 || err.code === 'invalid_api_key') {
    return res.status(401).json({
      success: false,
      error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.',
    });
  }

  // Default server error
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};
