export function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = Number(error?.statusCode || error?.status || 500);
  const message =
    statusCode >= 500
      ? "Internal server error"
      : error?.message || "Request failed";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: message,
  });
}
